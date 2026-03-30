// ===== Create QR Code Page =====
// Both logged-in and guest users get dynamic QR codes (stored in DB)
// Guest: stores shortId in localStorage to remember their QR codes

import { useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { HiQrCode, HiArrowDownTray, HiLink, HiDocument, HiExclamationTriangle } from 'react-icons/hi2'

var API_BASE = import.meta.env.VITE_API_BASE_URL || ''
var API_URL = API_BASE + '/api/qr'

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

    function isLoggedIn() {
        return localStorage.getItem('qr-token') !== null
    }

    function getToken() {
        return localStorage.getItem('qr-token')
    }

    // ===== Handle form submit =====
    async function handleSubmit(e) {
        e.preventDefault()

        // Guest restriction: only one QR code allowed
        if (!isLoggedIn()) {
            var savedIds = JSON.parse(localStorage.getItem('guest-qr-ids') || '[]')
            if (savedIds.length >= 1) {
                toast.error('Guest users can only generate 1 QR code. Please login to create more!')
                return
            }
        }

        if (!name.trim() || !targetUrl.trim()) {
            toast.error('Please fill in all fields')
            return
        }

        setLoading(true)

        try {
            var response
            var headers = { 'Content-Type': 'application/json' }
            var body = JSON.stringify({ name: name, size: size, targetUrl: targetUrl })

            if (isLoggedIn()) {
                // Logged-in user: POST /api/qr (with auth token)
                headers['Authorization'] = 'Bearer ' + getToken()
                response = await fetch(API_URL, { method: 'POST', headers: headers, body: body })
            } else {
                // Guest user: POST /api/qr/guest (no auth needed)
                response = await fetch(API_URL + '/guest', { method: 'POST', headers: headers, body: body })
            }

            var data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create QR')
            }

            // Guest: save shortId to localStorage
            if (!isLoggedIn()) {
                var savedIds = JSON.parse(localStorage.getItem('guest-qr-ids') || '[]')
                savedIds.unshift(data.shortId)
                localStorage.setItem('guest-qr-ids', JSON.stringify(savedIds))
            }

            setResult(data)
            toast.success('QR Code created!')
            setName('')
            setSize(300)
            setTargetUrl('')
        } catch (err) {
            toast.error(err.message)
        } finally {
            setLoading(false)
        }
    }

    // ===== Download =====
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
                    <p>Generate a permanent QR code with a dynamic redirect link</p>
                </div>
            </div>

            {!isLoggedIn() && JSON.parse(localStorage.getItem('guest-qr-ids') || '[]').length >= 1 && (
                <div className="alert alert-warning">
                    <HiExclamationTriangle />
                    <span>You've reached the <strong>Guest Limit (1 QR)</strong>. Please login to create unlimited QR codes!</span>
                    <Link to="/login" className="alert-link">Login Now &rarr;</Link>
                </div>
            )}

            <div className="create-layout">
                <div className="glass-card form-card">
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="name"><HiDocument className="label-icon" /> QR Code Name</label>
                            <input id="name" type="text" placeholder="e.g. My Website Link"
                                value={name} onChange={function (e) { setName(e.target.value) }} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="size"><HiQrCode className="label-icon" /> QR Size</label>
                            <select id="size" value={size} onChange={function (e) { setSize(Number(e.target.value)) }}>
                                {SIZE_OPTIONS.map(function (opt) {
                                    return <option key={opt.value} value={opt.value}>{opt.label}</option>
                                })}
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="targetUrl"><HiLink className="label-icon" /> Destination URL</label>
                            <input id="targetUrl" type="url" placeholder="https://www.example.com"
                                value={targetUrl} onChange={function (e) { setTargetUrl(e.target.value) }} required />
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? <span className="spinner"></span> : <><HiQrCode /> Generate QR Code</>}
                        </button>
                    </form>
                </div>

                <div className="glass-card result-card">
                    {result ? (
                        <div className="qr-result">
                            <div className="qr-result-header">
                                <h3>{result.name}</h3>
                                <span className="badge">Active</span>
                            </div>
                            <div className="qr-image-wrapper">
                                <img src={result.qrImage} alt={'QR Code for ' + result.name} />
                            </div>
                            <div className="qr-info">
                                <div className="qr-info-row">
                                    <span className="qr-info-label">Redirect URL</span>
                                    <a href={result.redirectUrl} target="_blank" rel="noopener noreferrer" className="qr-info-value link">
                                        {result.redirectUrl}
                                    </a>
                                </div>
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
                            <p>Fill in the form and click Generate to create your dynamic QR code</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default CreateQR
