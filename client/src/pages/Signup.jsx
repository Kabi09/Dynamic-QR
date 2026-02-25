// ===== Signup Page =====
// Create a new account with name, email, and password

import { useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { HiUserPlus, HiUser, HiEnvelope, HiLockClosed, HiEye, HiEyeSlash } from 'react-icons/hi2'

var API_URL = (import.meta.env.VITE_API_BASE_URL || '') + '/api/auth'

function Signup(props) {
    // ===== State =====
    var [name, setName] = useState('')
    var [email, setEmail] = useState('')
    var [password, setPassword] = useState('')
    var [showPassword, setShowPassword] = useState(false)
    var [loading, setLoading] = useState(false)

    // ===== Handle signup =====
    async function handleSubmit(e) {
        e.preventDefault()

        if (!name.trim() || !email.trim() || !password.trim()) {
            toast.error('Please fill in all fields')
            return
        }

        if (password.length < 6) {
            toast.error('Password must be at least 6 characters')
            return
        }

        setLoading(true)

        try {
            var response = await fetch(API_URL + '/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: name, email: email, password: password }),
            })

            var data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Signup failed')
            }

            // Save token and user info
            localStorage.setItem('qr-token', data.token)
            localStorage.setItem('qr-user', JSON.stringify(data.user))

            toast.success('Account created! Welcome, ' + data.user.name + '!')
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
                        <HiUserPlus />
                    </div>
                    <h2>Create Account</h2>
                    <p>Sign up to save and manage your QR codes</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label><HiUser className="label-icon" /> Full Name</label>
                        <input
                            type="text"
                            placeholder="Enter your name"
                            value={name}
                            onChange={function (e) { setName(e.target.value) }}
                            required
                        />
                    </div>

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
                                placeholder="Min 6 characters"
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
                        {loading ? <span className="spinner"></span> : <><HiUserPlus /> Sign Up</>}
                    </button>
                </form>

                {/* Links */}
                <div className="auth-links">
                    <p>Already have an account? <Link to="/login">Login</Link></p>
                    <button className="btn btn-ghost guest-btn" onClick={function () { props.onGuest() }}>
                        Continue as Guest
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Signup
