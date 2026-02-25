// ===== Listed QR Codes Page =====
// Logged-in: GET /api/qr (with auth token)
// Guest: POST /api/qr/guest/list (sends shortIds from localStorage)

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import {
    HiListBullet, HiPencilSquare, HiTrash, HiXMark,
    HiCheck, HiArrowDownTray, HiLink, HiQrCode,
} from 'react-icons/hi2'

var API_BASE = import.meta.env.VITE_API_BASE_URL || ''
var API_URL = API_BASE + '/api/qr'

function ListedQR() {
    var [qrCodes, setQrCodes] = useState([])
    var [loading, setLoading] = useState(true)
    var [editingId, setEditingId] = useState(null)
    var [editName, setEditName] = useState('')
    var [editUrl, setEditUrl] = useState('')
    var [deletingId, setDeletingId] = useState(null)

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
                // Logged-in: GET /api/qr with auth
                var response = await fetch(API_URL, {
                    headers: { 'Authorization': 'Bearer ' + getToken() },
                })
                var data = await response.json()
                setQrCodes(data)
            } else {
                // Guest: send shortIds to server, get back full QR data
                var savedIds = JSON.parse(localStorage.getItem('guest-qr-ids') || '[]')

                if (savedIds.length === 0) {
                    setQrCodes([])
                } else {
                    var response2 = await fetch(API_URL + '/guest/list', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ shortIds: savedIds }),
                    })
                    var data2 = await response2.json()
                    setQrCodes(data2)
                }
            }
        } catch (err) {
            toast.error('Failed to load QR codes')
        } finally {
            setLoading(false)
        }
    }

    useEffect(function () { fetchQRCodes() }, [])

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

    async function saveEdit(qr) {
        try {
            var response
            var body = JSON.stringify({ name: editName, targetUrl: editUrl })
            var headers = { 'Content-Type': 'application/json' }

            if (isLoggedIn()) {
                headers['Authorization'] = 'Bearer ' + getToken()
                response = await fetch(API_URL + '/' + qr._id, {
                    method: 'PUT', headers: headers, body: body,
                })
            } else {
                // Guest: update by shortId
                response = await fetch(API_URL + '/guest/' + qr.shortId, {
                    method: 'PUT', headers: headers, body: body,
                })
            }

            var data = await response.json()
            if (!response.ok) throw new Error(data.error)

            var updatedList = qrCodes.map(function (q) {
                if (q._id === qr._id) return data
                return q
            })
            setQrCodes(updatedList)
            setEditingId(null)
            toast.success('QR updated! Link changed, QR stays the same ✨')
        } catch (err) {
            toast.error(err.message)
        }
    }

    // ===== Delete =====
    async function doDelete(qr) {
        try {
            var response

            if (isLoggedIn()) {
                response = await fetch(API_URL + '/' + qr._id, {
                    method: 'DELETE',
                    headers: { 'Authorization': 'Bearer ' + getToken() },
                })
            } else {
                // Guest: delete by shortId
                response = await fetch(API_URL + '/guest/' + qr.shortId, {
                    method: 'DELETE',
                })
            }

            if (!response.ok) throw new Error('Delete failed')

            // Also remove shortId from localStorage for guest
            if (!isLoggedIn()) {
                var savedIds = JSON.parse(localStorage.getItem('guest-qr-ids') || '[]')
                savedIds = savedIds.filter(function (id) { return id !== qr.shortId })
                localStorage.setItem('guest-qr-ids', JSON.stringify(savedIds))
            }

            var filteredList = qrCodes.filter(function (q) { return q._id !== qr._id })
            setQrCodes(filteredList)
            setDeletingId(null)
            toast.success('QR code deleted')
        } catch (err) {
            toast.error(err.message)
        }
    }

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
                    <p>{qrCodes.length} dynamic QR code{qrCodes.length !== 1 ? 's' : ''}</p>
                </div>
            </div>

            {qrCodes.length === 0 ? (
                <div className="glass-card empty-state">
                    <div className="placeholder-icon"><HiQrCode /></div>
                    <h3>No QR codes yet</h3>
                    <p>Create your first dynamic QR code from the Create QR page</p>
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
                                            <button className="btn btn-danger btn-sm" onClick={function () { doDelete(qr) }}>
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
                                                <input type="text" value={editName} className="edit-input"
                                                    onChange={function (e) { setEditName(e.target.value) }} placeholder="Name" />
                                                <input type="url" value={editUrl} className="edit-input"
                                                    onChange={function (e) { setEditUrl(e.target.value) }} placeholder="New destination URL" />
                                                <div className="edit-actions">
                                                    <button className="btn btn-primary btn-sm" onClick={function () { saveEdit(qr) }}>
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
