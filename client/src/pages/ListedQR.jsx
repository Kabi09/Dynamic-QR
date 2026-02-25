// ===== Listed QR Codes Page =====
// This page shows all created QR codes with edit, delete, and disable options

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
    HiNoSymbol,
    HiPlay,
} from 'react-icons/hi2'

// API URL - uses environment variable in production
var API_URL = (import.meta.env.VITE_API_BASE_URL || '') + '/api/qr'

function ListedQR() {
    // ===== State variables =====
    var [qrCodes, setQrCodes] = useState([])         // List of all QR codes
    var [loading, setLoading] = useState(true)        // Loading state
    var [editingId, setEditingId] = useState(null)    // ID of QR being edited
    var [editName, setEditName] = useState('')        // Edit form - name
    var [editUrl, setEditUrl] = useState('')          // Edit form - URL
    var [deletingId, setDeletingId] = useState(null)  // ID of QR being deleted

    // ===== Fetch all QR codes from the server =====
    async function fetchQRCodes() {
        try {
            var response = await fetch(API_URL)
            var data = await response.json()
            setQrCodes(data)
        } catch (err) {
            toast.error('Failed to load QR codes')
        } finally {
            setLoading(false)
        }
    }

    // ===== Load QR codes when page opens =====
    useEffect(function () {
        fetchQRCodes()
    }, [])

    // ===== Start editing a QR code =====
    function startEdit(qr) {
        setEditingId(qr._id)
        setEditName(qr.name)
        setEditUrl(qr.targetUrl)
    }

    // ===== Cancel editing =====
    function cancelEdit() {
        setEditingId(null)
        setEditName('')
        setEditUrl('')
    }

    // ===== Save the edited QR code =====
    async function saveEdit(id) {
        try {
            var response = await fetch(API_URL + '/' + id, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: editName,
                    targetUrl: editUrl,
                }),
            })

            var data = await response.json()

            if (!response.ok) {
                throw new Error(data.error)
            }

            // Update the QR code in the list
            var updatedList = qrCodes.map(function (qr) {
                if (qr._id === id) {
                    return data  // Replace with updated data
                }
                return qr  // Keep unchanged
            })

            setQrCodes(updatedList)
            setEditingId(null)
            toast.success('QR updated! Link changed, QR stays the same ✨')
        } catch (err) {
            toast.error(err.message)
        }
    }

    // ===== Toggle Enable/Disable a QR code =====
    async function toggleQR(id) {
        try {
            var response = await fetch(API_URL + '/' + id + '/toggle', {
                method: 'PATCH',
            })

            var data = await response.json()

            if (!response.ok) {
                throw new Error(data.error)
            }

            // Update the QR code's isActive status in the list
            var updatedList = qrCodes.map(function (qr) {
                if (qr._id === id) {
                    return Object.assign({}, qr, { isActive: data.isActive })
                }
                return qr
            })

            setQrCodes(updatedList)
            toast.success(data.message)
        } catch (err) {
            toast.error(err.message)
        }
    }

    // ===== Delete a QR code =====
    async function doDelete(id) {
        try {
            var response = await fetch(API_URL + '/' + id, {
                method: 'DELETE',
            })

            if (!response.ok) {
                throw new Error('Delete failed')
            }

            // Remove the QR code from the list
            var filteredList = qrCodes.filter(function (qr) {
                return qr._id !== id
            })

            setQrCodes(filteredList)
            setDeletingId(null)
            toast.success('QR code deleted')
        } catch (err) {
            toast.error(err.message)
        }
    }

    // ===== Download QR code image =====
    function downloadQR(qr) {
        var link = document.createElement('a')
        link.download = qr.name + '-qr.png'
        link.href = qr.qrImage
        link.click()
    }

    // ===== Show loading spinner =====
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

    // ===== Render the page =====
    return (
        <div className="page list-page">

            {/* Page Header */}
            <div className="page-header">
                <div className="page-header-icon">
                    <HiListBullet />
                </div>
                <div>
                    <h2>Listed QR Codes</h2>
                    <p>{qrCodes.length} dynamic QR code{qrCodes.length !== 1 ? 's' : ''} created</p>
                </div>
            </div>

            {/* Show empty state or QR code cards */}
            {qrCodes.length === 0 ? (

                // ===== Empty State =====
                <div className="glass-card empty-state">
                    <div className="placeholder-icon">
                        <HiQrCode />
                    </div>
                    <h3>No QR codes yet</h3>
                    <p>Create your first dynamic QR code from the Create QR page</p>
                </div>

            ) : (

                // ===== QR Code Cards Grid =====
                <div className="qr-grid">
                    {qrCodes.map(function (qr) {
                        return (
                            <div key={qr._id} className={'glass-card qr-card' + (qr.isActive === false ? ' qr-card-disabled' : '')}>

                                {/* Delete Confirmation Overlay */}
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

                                {/* Card Top: Image + Info */}
                                <div className="qr-card-top">

                                    {/* QR Code Image */}
                                    <div className="qr-card-image">
                                        <img src={qr.qrImage} alt={qr.name} />
                                    </div>

                                    {/* QR Code Info */}
                                    <div className="qr-card-info">
                                        {editingId === qr._id ? (

                                            // ===== Edit Mode =====
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

                                            // ===== Display Mode =====
                                            <>
                                                <div className="qr-card-name-row">
                                                    <h3 className="qr-card-name">{qr.name}</h3>
                                                    <span className={'badge ' + (qr.isActive === false ? 'badge-disabled' : 'badge-active')}>
                                                        {qr.isActive === false ? 'Disabled' : 'Active'}
                                                    </span>
                                                </div>
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

                                {/* Action Buttons (shown when not editing) */}
                                {editingId !== qr._id && (
                                    <div className="qr-card-actions">
                                        <button className="btn btn-secondary btn-sm" onClick={function () { downloadQR(qr) }}>
                                            <HiArrowDownTray /> Download
                                        </button>
                                        <button className="btn btn-accent btn-sm" onClick={function () { startEdit(qr) }}>
                                            <HiPencilSquare /> Edit
                                        </button>

                                        {/* Disable / Enable Button */}
                                        <button
                                            className={'btn btn-sm ' + (qr.isActive === false ? 'btn-enable' : 'btn-disable')}
                                            onClick={function () { toggleQR(qr._id) }}
                                        >
                                            {qr.isActive === false ? (
                                                <><HiPlay /> Enable</>
                                            ) : (
                                                <><HiNoSymbol /> Disable</>
                                            )}
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
