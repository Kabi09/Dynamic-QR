// ===== Login Page =====
// Sign in with email and password

import { useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { HiLockOpen, HiEnvelope, HiLockClosed, HiEye, HiEyeSlash } from 'react-icons/hi2'

var API_URL = (import.meta.env.VITE_API_BASE_URL || '') + '/api/auth'

function Login(props) {
    // ===== State =====
    var [email, setEmail] = useState('')
    var [password, setPassword] = useState('')
    var [showPassword, setShowPassword] = useState(false)
    var [loading, setLoading] = useState(false)

    // ===== Handle login =====
    async function handleSubmit(e) {
        e.preventDefault()

        if (!email.trim() || !password.trim()) {
            toast.error('Please fill in all fields')
            return
        }

        setLoading(true)

        try {
            var response = await fetch(API_URL + '/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email, password: password }),
            })

            var data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Login failed')
            }

            // Save token and user info
            localStorage.setItem('qr-token', data.token)
            localStorage.setItem('qr-user', JSON.stringify(data.user))

            toast.success('Welcome back, ' + data.user.name + '!')
            props.onLogin(data.user)
        } catch (err) {
            toast.error(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-card glass-card">
                {/* Header */}
                <div className="auth-header">
                    <div className="auth-icon">
                        <HiLockOpen />
                    </div>
                    <h2>Welcome Back</h2>
                    <p>Sign in to your account</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label><HiEnvelope className="label-icon" /> Email</label>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={function (e) { setEmail(e.target.value) }}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label><HiLockClosed className="label-icon" /> Password</label>
                        <div className="password-input">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Enter your password"
                                value={password}
                                onChange={function (e) { setPassword(e.target.value) }}
                                required
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={function () { setShowPassword(!showPassword) }}
                            >
                                {showPassword ? <HiEyeSlash /> : <HiEye />}
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? <span className="spinner"></span> : <><HiLockOpen /> Login</>}
                    </button>
                </form>

                {/* Links */}
                <div className="auth-links">
                    <Link to="/forgot-password" className="forgot-link">Forgot Password?</Link>
                    <p>Don't have an account? <Link to="/signup">Sign Up</Link></p>
                    <button className="btn btn-ghost guest-btn" onClick={function () { props.onGuest() }}>
                        Continue as Guest
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Login
