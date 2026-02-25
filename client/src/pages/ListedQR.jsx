// ===== Listed QR Codes Page =====
// Logged-in users: fetches from API (only their QR codes)
// Guest users: reads from localStorage

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

var API_URL = (import.meta.env.VITE_API_BASE_URL || '') + '/api/qr'

function ListedQR() {
    var [qrCodes, setQrCodes] = useState([])
    var [loading, setLoading] = useState(true)
    var [editingId, setEditingId] = useState(null)
    var [editName, setEditName] = useState('')
    var [editUrl, setEditUrl] = useState('')
    var [deletingId, setDeletingId] = useState(null)

    // Check if user is logged in or guest
    function isLoggedIn() {
        return localStorage.getItem('qr-token') !== null
    }

    function getToken() {
        return localStorage.getItem('qr-token')
    }

    // ===== Fetch QR codes =====
    async function fetchQRCodes() {
        try {
            if (isLoggedIn()) {
                // LOGGED-IN: Fetch from API (only this user's QR codes)
                var response = await fetch(API_URL, {
                    headers: {
                        'Authorization': 'Bearer ' + getToken(),
                    },
                })
                var data = await response.json()
                setQrCodes(data)
            } else {
                // GUEST: Read from localStorage
                var guestQrs = JSON.parse(localStorage.getItem('guest-qr-codes') || '[]')
                setQrCodes(guestQrs)
            }
        } catch (err) {
            toast.error('Failed to load QR codes')
        } finally {
            setLoading(false)
        }
    }

    useEffect(function () {
        fetchQRCodes()
    }, [])

    // ===== Edit =====
    function startEdit(qr) {
        setEditingId(qr._id)
        setEditName(qr.name)
        setEditUrl(qr.targetUrl)
    }

    function cancelEdit() {
        setEditingId(null)
        setEditName('')
        setEditUrl('')
    }

    async function saveEdit(id) {
        try {
            if (isLoggedIn()) {
                // LOGGED-IN: Update via API
                var response = await fetch(API_URL + '/' + id, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + getToken(),
                    },
                    body: JSON.stringify({ name: editName, targetUrl: editUrl }),
                })

                var data = await response.json()

                if (!response.ok) {
                    throw new Error(data.error)
                }

                var updatedList = qrCodes.map(function (qr) {
                    if (qr._id === id) return data
                    return qr
                })
                setQrCodes(updatedList)
            } else {
                // GUEST: Update in localStorage
                var guestQrs = JSON.parse(localStorage.getItem('guest-qr-codes') || '[]')
                for (var i = 0; i < guestQrs.length; i++) {
                    if (guestQrs[i]._id === id) {
                        guestQrs[i].name = editName
                        guestQrs[i].targetUrl = editUrl
                        guestQrs[i].redirectUrl = editUrl

                        // Regenerate QR image with new URL
                        var QRCodeLib = (await import('qrcode')).default
                        guestQrs[i].qrImage = await QRCodeLib.toDataURL(editUrl, {
                            width: guestQrs[i].size,
                            margin: 2,
                            color: { dark: '#000000', light: '#ffffff' },
                        })
                        break
                    }
                }
                localStorage.setItem('guest-qr-codes', JSON.stringify(guestQrs))
                setQrCodes([].concat(guestQrs))
            }

            setEditingId(null)
            toast.success(isLoggedIn() ? 'QR updated! Link changed, QR stays the same ✨' : 'QR updated in browser!')
        } catch (err) {
            toast.error(err.message)
        }
    }

    // ===== Delete =====
    async function doDelete(id) {
        try {
            if (isLoggedIn()) {
                // LOGGED-IN: Delete via API
                var response = await fetch(API_URL + '/' + id, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': 'Bearer ' + getToken(),
                    },
                })

                if (!response.ok) {
                    throw new Error('Delete failed')
                }
            } else {
                // GUEST: Delete from localStorage
                var guestQrs = JSON.parse(localStorage.getItem('guest-qr-codes') || '[]')
                guestQrs = guestQrs.filter(function (qr) { return qr._id !== id })
                localStorage.setItem('guest-qr-codes', JSON.stringify(guestQrs))
            }

            var filteredList = qrCodes.filter(function (qr) { return qr._id !== id })
            setQrCodes(filteredList)
            setDeletingId(null)
            toast.success('QR code deleted')
        } catch (err) {
            toast.error(err.message)
        }
    }

    // ===== Download =====
    function downloadQR(qr) {
        var link = document.createElement('a')
        link.download = qr.name + '-qr.png'
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
                <div className="page-header-icon"><HiListBullet /></div>
                <div>
                    <h2>Listed QR Codes</h2>
                    <p>
                        {qrCodes.length} QR code{qrCodes.length !== 1 ? 's' : ''}
                        {isLoggedIn() ? ' saved to your account' : ' stored in browser'}
                    </p>
                </div>
            </div>

            {qrCodes.length === 0 ? (
                <div className="glass-card empty-state">
                    <div className="placeholder-icon"><HiQrCode /></div>
                    <h3>No QR codes yet</h3>
                    <p>
                        {isLoggedIn()
                            ? 'Create your first dynamic QR code from the Create QR page'
                            : 'Create a QR code — it will be saved in your browser'
                        }
                    </p>
                </div>
            ) : (
                <div className="qr-grid">
                    {qrCodes.map(function (qr) {
                        return (
                            <div key={qr._id} className="glass-card qr-card">

                                {deletingId === qr._id && (
                                    <div className="delete-overlay">
                                        <p>Delete this QR code?</p>
                                        <div className="delete-actions">
                                            <button className="btn btn-danger btn-sm" onClick={function () { doDelete(qr._id) }}>
                                                <HiTrash /> Yes, Delete
                                            </button>
                                            <button className="btn btn-ghost btn-sm" onClick={function () { setDeletingId(null) }}>
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
                                                    value={editName}
                                                    onChange={function (e) { setEditName(e.target.value) }}
                                                    placeholder="Name"
                                                    className="edit-input"
                                                />
                                                <input
                                                    type="url"
                                                    value={editUrl}
                                                    onChange={function (e) { setEditUrl(e.target.value) }}
                                                    placeholder="New destination URL"
                                                    className="edit-input"
                                                />
                                                <div className="edit-actions">
                                                    <button className="btn btn-primary btn-sm" onClick={function () { saveEdit(qr._id) }}>
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
                                                {qr.redirectUrl && isLoggedIn() && (
                                                    <div className="qr-card-redirect">
                                                        <span className="redirect-label">QR Points to:</span>
                                                        <a href={qr.redirectUrl} target="_blank" rel="noopener noreferrer">
                                                            {qr.redirectUrl}
                                                        </a>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>

                                {editingId !== qr._id && (
                                    <div className="qr-card-actions">
                                        <button className="btn btn-secondary btn-sm" onClick={function () { downloadQR(qr) }}>
                                            <HiArrowDownTray /> Download
                                        </button>
                                        <button className="btn btn-accent btn-sm" onClick={function () { startEdit(qr) }}>
                                            <HiPencilSquare /> Edit
                                        </button>
                                        <button className="btn btn-danger btn-sm" onClick={function () { setDeletingId(qr._id) }}>
                                            <HiTrash /> Delete
                                        </button>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

export default ListedQR
