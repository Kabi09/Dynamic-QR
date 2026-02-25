// ===== Create QR Code Page =====
// This page lets users create a new QR code

import { useState } from 'react'
import toast from 'react-hot-toast'
import { HiQrCode, HiArrowDownTray, HiLink, HiDocument } from 'react-icons/hi2'

// API URL - uses environment variable in production, empty string for local dev
var API_URL = (import.meta.env.VITE_API_BASE_URL || '') + '/api/qr'

// Available QR code sizes
var SIZE_OPTIONS = [
    { value: 200, label: '200×200 (Small)' },
    { value: 300, label: '300×300 (Medium)' },
    { value: 400, label: '400×400 (Large)' },
    { value: 500, label: '500×500 (XL)' },
    { value: 600, label: '600×600 (XXL)' },
]

function CreateQR() {
    // ===== State variables =====
    var [name, setName] = useState('')           // QR code name
    var [size, setSize] = useState(300)           // QR code size
    var [targetUrl, setTargetUrl] = useState('')  // Destination URL
    var [loading, setLoading] = useState(false)   // Loading spinner
    var [result, setResult] = useState(null)      // Created QR code data

    // ===== Handle form submit =====
    async function handleSubmit(e) {
        e.preventDefault()

        // Check if fields are filled
        if (!name.trim() || !targetUrl.trim()) {
            toast.error('Please fill in all fields')
            return
        }

        setLoading(true)

        try {
            // Send POST request to create QR code
            var response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: name,
                    size: size,
                    targetUrl: targetUrl,
                }),
            })

            var data = await response.json()

            // Check if request was successful
            if (!response.ok) {
                throw new Error(data.error || 'Failed to create QR')
            }

            // Save the result and clear the form
            setResult(data)
            toast.success('QR Code created successfully!')
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

    // ===== Render the page =====
    return (
        <div className="page create-page">

            {/* Page Header */}
            <div className="page-header">
                <div className="page-header-icon">
                    <HiQrCode />
                </div>
                <div>
                    <h2>Create QR Code</h2>
                    <p>Generate a permanent QR code with a dynamic redirect link</p>
                </div>
            </div>

            <div className="create-layout">

                {/* ===== Form Card ===== */}
                <div className="glass-card form-card">
                    <form onSubmit={handleSubmit}>

                        {/* QR Code Name Input */}
                        <div className="form-group">
                            <label htmlFor="name">
                                <HiDocument className="label-icon" />
                                QR Code Name
                            </label>
                            <input
                                id="name"
                                type="text"
                                placeholder="e.g. My Website Link"
                                value={name}
                                onChange={function (e) { setName(e.target.value) }}
                                required
                            />
                        </div>

                        {/* QR Size Dropdown */}
                        <div className="form-group">
                            <label htmlFor="size">
                                <HiQrCode className="label-icon" />
                                QR Size
                            </label>
                            <select
                                id="size"
                                value={size}
                                onChange={function (e) { setSize(Number(e.target.value)) }}
                            >
                                {SIZE_OPTIONS.map(function (option) {
                                    return (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    )
                                })}
                            </select>
                        </div>

                        {/* Destination URL Input */}
                        <div className="form-group">
                            <label htmlFor="targetUrl">
                                <HiLink className="label-icon" />
                                Destination URL
                            </label>
                            <input
                                id="targetUrl"
                                type="url"
                                placeholder="https://www.example.com"
                                value={targetUrl}
                                onChange={function (e) { setTargetUrl(e.target.value) }}
                                required
                            />
                        </div>

                        {/* Submit Button */}
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? (
                                <span className="spinner"></span>
                            ) : (
                                <>
                                    <HiQrCode /> Generate QR Code
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* ===== Result Card ===== */}
                <div className="glass-card result-card">
                    {result ? (
                        <div className="qr-result">
                            {/* QR Code Name + Badge */}
                            <div className="qr-result-header">
                                <h3>{result.name}</h3>
                                <span className="badge">Active</span>
                            </div>

                            {/* QR Code Image */}
                            <div className="qr-image-wrapper">
                                <img src={result.qrImage} alt={'QR Code for ' + result.name} />
                            </div>

                            {/* QR Code Info */}
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

                            {/* Download Button */}
                            <button className="btn btn-secondary" onClick={downloadQR}>
                                <HiArrowDownTray /> Download QR
                            </button>
                        </div>
                    ) : (
                        <div className="qr-placeholder">
                            <div className="placeholder-icon">
                                <HiQrCode />
                            </div>
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
