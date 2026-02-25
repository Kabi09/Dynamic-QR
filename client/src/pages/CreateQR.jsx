import { useState } from 'react'
import toast from 'react-hot-toast'
import { HiQrCode, HiArrowDownTray, HiLink, HiDocument } from 'react-icons/hi2'

const API_BASE = '/api/qr'

const SIZE_OPTIONS = [
    { value: 200, label: '200×200 (Small)' },
    { value: 300, label: '300×300 (Medium)' },
    { value: 400, label: '400×400 (Large)' },
    { value: 500, label: '500×500 (XL)' },
    { value: 600, label: '600×600 (XXL)' },
]

function CreateQR() {
    const [form, setForm] = useState({ name: '', size: 300, targetUrl: '' })
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState(null)

    const handleChange = (e) => {
        const { name, value } = e.target
        setForm((prev) => ({ ...prev, [name]: name === 'size' ? Number(value) : value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!form.name.trim() || !form.targetUrl.trim()) {
            toast.error('Please fill in all fields')
            return
        }

        setLoading(true)
        try {
            const res = await fetch(API_BASE, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Failed to create QR')
            setResult(data)
            toast.success('QR Code created successfully!')
            setForm({ name: '', size: 300, targetUrl: '' })
        } catch (err) {
            toast.error(err.message)
        } finally {
            setLoading(false)
        }
    }

    const downloadQR = () => {
        if (!result?.qrImage) return
        const link = document.createElement('a')
        link.download = `${result.name}-qr.png`
        link.href = result.qrImage
        link.click()
    }

    return (
        <div className="page create-page">
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
                {/* Form Card */}
                <div className="glass-card form-card">
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="name">
                                <HiDocument className="label-icon" />
                                QR Code Name
                            </label>
                            <input
                                id="name"
                                type="text"
                                name="name"
                                placeholder="e.g. My Website Link"
                                value={form.name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="size">
                                <HiQrCode className="label-icon" />
                                QR Size
                            </label>
                            <select
                                id="size"
                                name="size"
                                value={form.size}
                                onChange={handleChange}
                            >
                                {SIZE_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="targetUrl">
                                <HiLink className="label-icon" />
                                Destination URL
                            </label>
                            <input
                                id="targetUrl"
                                type="url"
                                name="targetUrl"
                                placeholder="https://www.example.com"
                                value={form.targetUrl}
                                onChange={handleChange}
                                required
                            />
                        </div>

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

                {/* Result Card */}
                <div className="glass-card result-card">
                    {result ? (
                        <div className="qr-result">
                            <div className="qr-result-header">
                                <h3>{result.name}</h3>
                                <span className="badge">Active</span>
                            </div>
                            <div className="qr-image-wrapper">
                                <img src={result.qrImage} alt={`QR Code for ${result.name}`} />
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
