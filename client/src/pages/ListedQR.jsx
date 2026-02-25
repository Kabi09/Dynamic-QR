import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import {
    HiListBullet,
    HiPencilSquare,
    HiTrash,
    HiXMark,
    HiCheck,
    HiArrowDownTray,
    HiLink,
    HiQrCode,
} from 'react-icons/hi2'

const API_BASE = `${import.meta.env.VITE_API_BASE_URL || ''}/api/qr`

function ListedQR() {
    const [qrCodes, setQrCodes] = useState([])
    const [loading, setLoading] = useState(true)
    const [editingId, setEditingId] = useState(null)
    const [editForm, setEditForm] = useState({ name: '', targetUrl: '' })
    const [deletingId, setDeletingId] = useState(null)

    const fetchQRCodes = async () => {
        try {
            const res = await fetch(API_BASE)
            const data = await res.json()
            setQrCodes(data)
        } catch (err) {
            toast.error('Failed to load QR codes')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchQRCodes()
    }, [])

    const startEdit = (qr) => {
        setEditingId(qr._id)
        setEditForm({ name: qr.name, targetUrl: qr.targetUrl })
    }

    const cancelEdit = () => {
        setEditingId(null)
        setEditForm({ name: '', targetUrl: '' })
    }

    const saveEdit = async (id) => {
        try {
            const res = await fetch(`${API_BASE}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editForm),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            setQrCodes((prev) =>
                prev.map((qr) => (qr._id === id ? data : qr))
            )
            setEditingId(null)
            toast.success('QR updated! Link changed, QR stays the same ✨')
        } catch (err) {
            toast.error(err.message)
        }
    }

    const confirmDelete = (id) => {
        setDeletingId(id)
    }

    const doDelete = async (id) => {
        try {
            const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' })
            if (!res.ok) throw new Error('Delete failed')
            setQrCodes((prev) => prev.filter((qr) => qr._id !== id))
            setDeletingId(null)
            toast.success('QR code deleted')
        } catch (err) {
            toast.error(err.message)
        }
    }

    const downloadQR = (qr) => {
        const link = document.createElement('a')
        link.download = `${qr.name}-qr.png`
        link.href = qr.qrImage
        link.click()
    }

    if (loading) {
        return (
            <div className="page">
                <div className="loading-container">
                    <div className="spinner large"></div>
                    <p>Loading QR codes...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="page list-page">
            <div className="page-header">
                <div className="page-header-icon">
                    <HiListBullet />
                </div>
                <div>
                    <h2>Listed QR Codes</h2>
                    <p>{qrCodes.length} dynamic QR code{qrCodes.length !== 1 ? 's' : ''} created</p>
                </div>
            </div>

            {qrCodes.length === 0 ? (
                <div className="glass-card empty-state">
                    <div className="placeholder-icon">
                        <HiQrCode />
                    </div>
                    <h3>No QR codes yet</h3>
                    <p>Create your first dynamic QR code from the Create QR page</p>
                </div>
            ) : (
                <div className="qr-grid">
                    {qrCodes.map((qr) => (
                        <div key={qr._id} className="glass-card qr-card">
                            {/* Delete confirmation overlay */}
                            {deletingId === qr._id && (
                                <div className="delete-overlay">
                                    <p>Delete this QR code?</p>
                                    <div className="delete-actions">
                                        <button className="btn btn-danger btn-sm" onClick={() => doDelete(qr._id)}>
                                            <HiTrash /> Yes, Delete
                                        </button>
                                        <button className="btn btn-ghost btn-sm" onClick={() => setDeletingId(null)}>
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="qr-card-top">
                                <div className="qr-card-image">
                                    <img src={qr.qrImage} alt={qr.name} />
                                </div>

                                <div className="qr-card-info">
                                    {editingId === qr._id ? (
                                        <div className="edit-form">
                                            <input
                                                type="text"
                                                value={editForm.name}
                                                onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                                                placeholder="Name"
                                                className="edit-input"
                                            />
                                            <input
                                                type="url"
                                                value={editForm.targetUrl}
                                                onChange={(e) => setEditForm((p) => ({ ...p, targetUrl: e.target.value }))}
                                                placeholder="New destination URL"
                                                className="edit-input"
                                            />
                                            <div className="edit-actions">
                                                <button className="btn btn-primary btn-sm" onClick={() => saveEdit(qr._id)}>
                                                    <HiCheck /> Save
                                                </button>
                                                <button className="btn btn-ghost btn-sm" onClick={cancelEdit}>
                                                    <HiXMark /> Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <h3 className="qr-card-name">{qr.name}</h3>
                                            <div className="qr-card-url">
                                                <HiLink className="url-icon" />
                                                <span>{qr.targetUrl}</span>
                                            </div>
                                            <div className="qr-card-redirect">
                                                <span className="redirect-label">QR Points to:</span>
                                                <a href={qr.redirectUrl} target="_blank" rel="noopener noreferrer">
                                                    {qr.redirectUrl}
                                                </a>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {editingId !== qr._id && (
                                <div className="qr-card-actions">
                                    <button className="btn btn-secondary btn-sm" onClick={() => downloadQR(qr)}>
                                        <HiArrowDownTray /> Download
                                    </button>
                                    <button className="btn btn-accent btn-sm" onClick={() => startEdit(qr)}>
                                        <HiPencilSquare /> Edit
                                    </button>
                                    <button className="btn btn-danger btn-sm" onClick={() => confirmDelete(qr._id)}>
                                        <HiTrash /> Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default ListedQR
