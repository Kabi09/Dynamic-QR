// ===== Forgot Password Page =====
// 3-step flow: Enter email → Enter OTP → Set new password

import { useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { HiEnvelope, HiKey, HiLockClosed, HiArrowLeft } from 'react-icons/hi2'

var API_URL = (import.meta.env.VITE_API_BASE_URL || '') + '/api/auth'

function ForgotPassword() {
    // ===== State =====
    var [step, setStep] = useState(1)          // 1=email, 2=OTP, 3=new password
    var [email, setEmail] = useState('')
    var [otp, setOtp] = useState('')
    var [newPassword, setNewPassword] = useState('')
    var [loading, setLoading] = useState(false)

    // ===== Step 1: Send OTP to email =====
    async function sendOtp(e) {
        e.preventDefault()

        if (!email.trim()) {
            toast.error('Please enter your email')
            return
        }

        setLoading(true)

        try {
            var response = await fetch(API_URL + '/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email }),
            })

            var data = await response.json()

            if (!response.ok) {
                throw new Error(data.error)
            }

            toast.success('OTP sent to your email!')
            setStep(2)
        } catch (err) {
            toast.error(err.message)
        } finally {
            setLoading(false)
        }
    }

    // ===== Step 2: Verify OTP =====
    async function verifyOtp(e) {
        e.preventDefault()

        if (!otp.trim()) {
            toast.error('Please enter the OTP')
            return
        }

        setLoading(true)

        try {
            var response = await fetch(API_URL + '/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email, otp: otp }),
            })

            var data = await response.json()

            if (!response.ok) {
                throw new Error(data.error)
            }

            toast.success('OTP verified!')
            setStep(3)
        } catch (err) {
            toast.error(err.message)
        } finally {
            setLoading(false)
        }
    }

    // ===== Step 3: Reset password =====
    async function resetPassword(e) {
        e.preventDefault()

        if (newPassword.length < 6) {
            toast.error('Password must be at least 6 characters')
            return
        }

        setLoading(true)

        try {
            var response = await fetch(API_URL + '/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email, otp: otp, newPassword: newPassword }),
            })

            var data = await response.json()

            if (!response.ok) {
                throw new Error(data.error)
            }

            toast.success('Password reset! You can now login.')
            // Redirect to login
            window.location.href = '/login'
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
                        {step === 1 && <HiEnvelope />}
                        {step === 2 && <HiKey />}
                        {step === 3 && <HiLockClosed />}
                    </div>
                    <h2>
                        {step === 1 && 'Forgot Password'}
                        {step === 2 && 'Enter OTP'}
                        {step === 3 && 'New Password'}
                    </h2>
                    <p>
                        {step === 1 && 'Enter your email to receive a reset OTP'}
                        {step === 2 && 'Check your email for the 6-digit code'}
                        {step === 3 && 'Set your new password'}
                    </p>

                    {/* Step indicator */}
                    <div className="step-indicator">
                        <div className={'step-dot' + (step >= 1 ? ' active' : '')}></div>
                        <div className="step-line"></div>
                        <div className={'step-dot' + (step >= 2 ? ' active' : '')}></div>
                        <div className="step-line"></div>
                        <div className={'step-dot' + (step >= 3 ? ' active' : '')}></div>
                    </div>
                </div>

                {/* Step 1: Email */}
                {step === 1 && (
                    <form onSubmit={sendOtp}>
                        <div className="form-group">
                            <label><HiEnvelope className="label-icon" /> Email Address</label>
                            <input
                                type="email"
                                placeholder="Enter your registered email"
                                value={email}
                                onChange={function (e) { setEmail(e.target.value) }}
                                required
                            />
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? <span className="spinner"></span> : 'Send OTP'}
                        </button>
                    </form>
                )}

                {/* Step 2: OTP */}
                {step === 2 && (
                    <form onSubmit={verifyOtp}>
                        <div className="form-group">
                            <label><HiKey className="label-icon" /> OTP Code</label>
                            <input
                                type="text"
                                placeholder="Enter 6-digit OTP"
                                value={otp}
                                onChange={function (e) { setOtp(e.target.value) }}
                                maxLength={6}
                                className="otp-input"
                                required
                            />
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? <span className="spinner"></span> : 'Verify OTP'}
                        </button>
                    </form>
                )}

                {/* Step 3: New Password */}
                {step === 3 && (
                    <form onSubmit={resetPassword}>
                        <div className="form-group">
                            <label><HiLockClosed className="label-icon" /> New Password</label>
                            <input
                                type="password"
                                placeholder="Min 6 characters"
                                value={newPassword}
                                onChange={function (e) { setNewPassword(e.target.value) }}
                                required
                            />
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? <span className="spinner"></span> : 'Reset Password'}
                        </button>
                    </form>
                )}

                {/* Back to login */}
                <div className="auth-links">
                    <Link to="/login" className="back-link">
                        <HiArrowLeft /> Back to Login
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default ForgotPassword
