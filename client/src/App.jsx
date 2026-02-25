// ===== Main App Component =====
// This is the root component that sets up the layout and routing

import { Routes, Route, NavLink } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { HiQrCode, HiListBullet } from 'react-icons/hi2'
import CreateQR from './pages/CreateQR'
import ListedQR from './pages/ListedQR'

function App() {
    return (
        <div className="app">

            {/* ===== Sidebar Navigation ===== */}
            <aside className="sidebar">

                {/* Logo */}
                <div className="sidebar-logo">
                    <div className="logo-icon">
                        <HiQrCode />
                    </div>
                    <h1><span>QR</span>Dynamic</h1>
                </div>

                {/* Navigation Links */}
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

                {/* Footer */}
                <div className="sidebar-footer">
                    <p>Dynamic QR Generator</p>
                </div>
            </aside>

            {/* ===== Main Content Area ===== */}
            <main className="main-content">
                <Routes>
                    <Route path="/" element={<CreateQR />} />
                    <Route path="/list" element={<ListedQR />} />
                </Routes>
            </main>

            {/* ===== Toast Notifications ===== */}
            <Toaster
                position="top-right"
                toastOptions={{
                    style: {
                        background: '#1e1e3a',
                        color: '#f0f0ff',
                        border: '1px solid rgba(139, 92, 246, 0.2)',
                    },
                }}
            />
        </div>
    )
}

export default App
