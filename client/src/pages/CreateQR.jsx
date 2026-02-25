// ===== Create QR Code Page =====
// Logged-in users: saves to database via API
// Guest users: saves to localStorage

import { useState } from 'react'
import toast from 'react-hot-toast'
import { HiQrCode, HiArrowDownTray, HiLink, HiDocument } from 'react-icons/hi2'

var API_URL = (import.meta.env.VITE_API_BASE_URL || '') + '/api/qr'

var SIZE_OPTIONS = [
    { value: 200, label: '200×200 (Small)' },
    { value: 300, label: '300×300 (Medium)' },
    { value: 400, label: '400×400 (Large)' },
    { value: 500, label: '500×500 (XL)' },
    { value: 600, label: '600×600 (XXL)' },
]

function CreateQR() {
    var [name, setName] = useState('')
    var [size, setSize] = useState(300)
    var [targetUrl, setTargetUrl] = useState('')
    var [loading, setLoading] = useState(false)
    var [result, setResult] = useState(null)

    // Check if user is logged in or guest
    function isLoggedIn() {
        return localStorage.getItem('qr-token') !== null
    }

    // Get the auth token
    function getToken() {
        return localStorage.getItem('qr-token')
    }

    // ===== Handle form submit =====
    async function handleSubmit(e) {
        e.preventDefault()

        if (!name.trim() || !targetUrl.trim()) {
            toast.error('Please fill in all fields')
            return
        }

        setLoading(true)

        try {
            if (isLoggedIn()) {
                // ===== LOGGED-IN USER: Save to database =====
                var response = await fetch(API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + getToken(),
                    },
                    body: JSON.stringify({ name: name, size: size, targetUrl: targetUrl }),
                })

                var data = await response.json()

                if (!response.ok) {
                    throw new Error(data.error || 'Failed to create QR')
                }

                setResult(data)
                toast.success('QR Code created and saved!')
            } else {
                // ===== GUEST USER: Save to localStorage =====
                var guestId = 'guest-' + Date.now()
                var guestQr = {
                    _id: guestId,
                    name: name,
                    size: size,
                    targetUrl: targetUrl,
                    shortId: guestId,
                    redirectUrl: targetUrl, // Guest QR points directly to URL
                    qrImage: null, // Will generate below
                    createdAt: new Date().toISOString(),
                }

                // Generate QR image (points directly to the target URL for guests)
                var QRCode = (await import('qrcode')).default
                var qrImage = await QRCode.toDataURL(targetUrl, {
                    width: size,
                    margin: 2,
                    color: { dark: '#000000', light: '#ffffff' },
                })

                guestQr.qrImage = qrImage

                // Save to localStorage
                var existingQrs = JSON.parse(localStorage.getItem('guest-qr-codes') || '[]')
                existingQrs.unshift(guestQr)
                localStorage.setItem('guest-qr-codes', JSON.stringify(existingQrs))

                setResult(guestQr)
                toast.success('QR Code created! (Stored in browser)')
            }

            // Clear form
            setName('')
            setSize(300)
            setTargetUrl('')
        } catch (err) {
            toast.error(err.message)
        } finally {
            setLoading(false)
        }
    }

    // ===== Download QR code image =====
    function downloadQR() {
        if (!result || !result.qrImage) return

        var link = document.createElement('a')
        link.download = result.name + '-qr.png'
        link.href = result.qrImage
        link.click()
    }

    return (
        <div className="page create-page">
            <div className="page-header">
                <div className="page-header-icon"><HiQrCode /></div>
                <div>
                    <h2>Create QR Code</h2>
                    <p>
                        {isLoggedIn()
                            ? 'Generate a permanent QR code with a dynamic redirect link'
                            : 'Guest mode — QR codes are saved in your browser only'
                        }
                    </p>
                </div>
            </div>

            <div className="create-layout">
                {/* Form Card */}
                <div className="glass-card form-card">
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="name"><HiDocument className="label-icon" /> QR Code Name</label>
                            <input
                                id="name"
                                type="text"
                                placeholder="e.g. My Website Link"
                                value={name}
                                onChange={function (e) { setName(e.target.value) }}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="size"><HiQrCode className="label-icon" /> QR Size</label>
                            <select
                                id="size"
                                value={size}
                                onChange={function (e) { setSize(Number(e.target.value)) }}
                            >
                                {SIZE_OPTIONS.map(function (option) {
                                    return <option key={option.value} value={option.value}>{option.label}</option>
                                })}
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="targetUrl"><HiLink className="label-icon" /> Destination URL</label>
                            <input
                                id="targetUrl"
                                type="url"
                                placeholder="https://www.example.com"
                                value={targetUrl}
                                onChange={function (e) { setTargetUrl(e.target.value) }}
                                required
                            />
                        </div>

                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? <span className="spinner"></span> : <><HiQrCode /> Generate QR Code</>}
                        </button>
                    </form>
                </div>

                {/* Result Card */}
                <div className="glass-card result-card">
                    {result ? (
                        <div className="qr-result">
                            <div className="qr-result-header">
                                <h3>{result.name}</h3>
                                <span className="badge">{isLoggedIn() ? 'Active' : 'Guest'}</span>
                            </div>
                            <div className="qr-image-wrapper">
                                <img src={result.qrImage} alt={'QR Code for ' + result.name} />
                            </div>
                            <div className="qr-info">
                                {isLoggedIn() && (
                                    <div className="qr-info-row">
                                        <span className="qr-info-label">Redirect URL</span>
                                        <a href={result.redirectUrl} target="_blank" rel="noopener noreferrer" className="qr-info-value link">
                                            {result.redirectUrl}
                                        </a>
                                    </div>
                                )}
                                <div className="qr-info-row">
                                    <span className="qr-info-label">Points to</span>
                                    <span className="qr-info-value">{result.targetUrl}</span>
                                </div>
                            </div>
                            <button className="btn btn-secondary" onClick={downloadQR}>
                                <HiArrowDownTray /> Download QR
                            </button>
                        </div>
                    ) : (
                        <div className="qr-placeholder">
                            <div className="placeholder-icon"><HiQrCode /></div>
                            <h3>Your QR Code</h3>
                            <p>Fill in the form and click Generate to create your QR code</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default CreateQR
