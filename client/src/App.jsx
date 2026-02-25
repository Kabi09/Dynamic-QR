// ===== Main App Component =====
// Handles auth state, theme toggle, routing, and layout

import { useState, useEffect } from 'react'
import { Routes, Route, NavLink, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { HiQrCode, HiListBullet, HiSun, HiMoon, HiArrowRightOnRectangle, HiUser } from 'react-icons/hi2'
import CreateQR from './pages/CreateQR'
import ListedQR from './pages/ListedQR'
import Signup from './pages/Signup'
import Login from './pages/Login'
import ForgotPassword from './pages/ForgotPassword'

function App() {
    // ===== Auth State =====
    var [user, setUser] = useState(null)
    var [isGuest, setIsGuest] = useState(false)

    // Check if user is already logged in
    useEffect(function () {
        var savedUser = localStorage.getItem('qr-user')
        var savedGuest = localStorage.getItem('qr-guest')

        if (savedUser) {
            setUser(JSON.parse(savedUser))
        } else if (savedGuest === 'true') {
            setIsGuest(true)
        }
    }, [])

    // ===== Theme State =====
    var [theme, setTheme] = useState(function () {
        return localStorage.getItem('qr-theme') || 'dark'
    })

    useEffect(function () {
        document.documentElement.setAttribute('data-theme', theme)
        localStorage.setItem('qr-theme', theme)
    }, [theme])

    function toggleTheme() {
        setTheme(theme === 'dark' ? 'light' : 'dark')
    }

    // ===== Auth Actions =====
    function handleLogin(userData) {
        setUser(userData)
        setIsGuest(false)
        localStorage.removeItem('qr-guest')
    }

    function handleGuest() {
        setIsGuest(true)
        localStorage.setItem('qr-guest', 'true')
    }

    function handleLogout() {
        setUser(null)
        setIsGuest(false)
        localStorage.removeItem('qr-token')
        localStorage.removeItem('qr-user')
        localStorage.removeItem('qr-guest')
    }

    // ===== Check if user is authenticated (logged in or guest) =====
    var isAuthenticated = user !== null || isGuest

    // ===== If NOT authenticated, show auth pages =====
    if (!isAuthenticated) {
        return (
            <div className="app">
                <Routes>
                    <Route path="/signup" element={<Signup onLogin={handleLogin} onGuest={handleGuest} />} />
                    <Route path="/login" element={<Login onLogin={handleLogin} onGuest={handleGuest} />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="*" element={<Navigate to="/login" />} />
                </Routes>
                <Toaster
                    position="top-right"
                    toastOptions={{
                        style: {
                            background: theme === 'dark' ? '#1e1e3a' : '#ffffff',
                            color: theme === 'dark' ? '#f0f0ff' : '#1a1a2e',
                            border: '1px solid rgba(139, 92, 246, 0.2)',
                        },
                    }}
                />
            </div>
        )
    }

    // ===== If authenticated, show the main app =====
    return (
        <div className="app">

            {/* ===== Sidebar ===== */}
            <aside className="sidebar">
                <div className="sidebar-logo">
                    <div className="logo-icon"><HiQrCode /></div>
                    <h1><span>QR</span>Dynamic</h1>
                </div>

                <nav className="sidebar-nav">
                    <NavLink to="/" className="nav-link">
                        <HiQrCode className="nav-icon" />
                        <span>Create QR</span>
                    </NavLink>
                    <NavLink to="/list" className="nav-link">
                        <HiListBullet className="nav-icon" />
                        <span>Listed QR</span>
                    </NavLink>
                </nav>

                {/* User Info */}
                <div className="user-info">
                    <div className="user-avatar">
                        <HiUser />
                    </div>
                    <div className="user-details">
                        <span className="user-name">{user ? user.name : 'Guest'}</span>
                        <span className="user-role">{user ? user.email : 'Guest Mode'}</span>
                    </div>
                </div>

                {/* Theme Toggle */}
                <button className="theme-toggle" onClick={toggleTheme}>
                    {theme === 'dark' ? <HiSun /> : <HiMoon />}
                    <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                </button>

                {/* Logout Button */}
                <button className="btn btn-ghost logout-btn" onClick={handleLogout}>
                    <HiArrowRightOnRectangle />
                    <span>{isGuest ? 'Exit Guest' : 'Logout'}</span>
                </button>

                <div className="sidebar-footer">
                    <p>Dynamic QR Generator</p>
                </div>
            </aside>

            {/* ===== Main Content ===== */}
            <main className="main-content">
                <Routes>
                    <Route path="/" element={<CreateQR />} />
                    <Route path="/list" element={<ListedQR />} />
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </main>

            <Toaster
                position="top-right"
                toastOptions={{
                    style: {
                        background: theme === 'dark' ? '#1e1e3a' : '#ffffff',
                        color: theme === 'dark' ? '#f0f0ff' : '#1a1a2e',
                        border: '1px solid rgba(139, 92, 246, 0.2)',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                    },
                }}
            />
        </div>
    )
}

export default App
