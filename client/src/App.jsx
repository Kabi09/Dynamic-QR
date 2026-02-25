import { Routes, Route, NavLink } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { HiQrCode, HiListBullet } from 'react-icons/hi2'
import CreateQR from './pages/CreateQR.jsx'
import ListedQR from './pages/ListedQR.jsx'

function App() {
    return (
        <div className="app">
            <Toaster
                position="top-right"
                toastOptions={{
                    style: {
                        background: 'rgba(30, 30, 50, 0.95)',
                        color: '#fff',
                        border: '1px solid rgba(139, 92, 246, 0.3)',
                        backdropFilter: 'blur(10px)',
                    },
                }}
            />

            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-logo">
                    <div className="logo-icon">
                        <HiQrCode />
                    </div>
                    <h1>QR<span>Dynamic</span></h1>
                </div>

                <nav className="sidebar-nav">
                    <NavLink
                        to="/"
                        end
                        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                    >
                        <HiQrCode className="nav-icon" />
                        <span>Create QR</span>
                    </NavLink>

                    <NavLink
                        to="/list"
                        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                    >
                        <HiListBullet className="nav-icon" />
                        <span>Listed QR</span>
                    </NavLink>
                </nav>

                <div className="sidebar-footer">
                    <p>Permanent QR • Dynamic Links</p>
                </div>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                <Routes>
                    <Route path="/" element={<CreateQR />} />
                    <Route path="/list" element={<ListedQR />} />
                </Routes>
            </main>
        </div>
    )
}

export default App
