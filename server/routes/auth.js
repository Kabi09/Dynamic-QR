// ===== Auth Routes =====
// Handles signup, login, forgot password, verify OTP, and reset password

var express = require("express");
var router = express.Router();
var bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
var nodemailer = require("nodemailer");
var UserModel = require("../models/User");

// ===== Email transporter setup =====
var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// ===== Generate a random 6-digit OTP =====
function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// ============================================
// SIGNUP — Create a new account
// POST /api/auth/signup
// ============================================
router.post("/signup", async function (req, res) {
    try {
        var name = req.body.name;
        var email = req.body.email;
        var password = req.body.password;

        // Check if all fields are filled
        if (!name || !email || !password) {
            return res.status(400).json({ error: "All fields are required" });
        }

        // Check if email already exists
        var existingUser = await UserModel.findOne({ email: email });
        if (existingUser) {
            return res.status(400).json({ error: "Email already registered" });
        }

        // Hash the password
        var hashedPassword = await bcrypt.hash(password, 10);

        // Save user to database
        var newUser = await UserModel.create({
            name: name,
            email: email,
            password: hashedPassword,
        });

        // Create JWT token
        var token = jwt.sign(
            { userId: newUser._id, name: newUser.name, email: newUser.email },
            process.env.JWT_SECRET || "default-secret",
            { expiresIn: "7d" }
        );

        // Send response
        res.status(201).json({
            message: "Account created successfully",
            token: token,
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
            },
        });
    } catch (err) {
        console.log("Signup error:", err);
        res.status(500).json({ error: "Failed to create account" });
    }
});

// ============================================
// LOGIN — Sign in to existing account
// POST /api/auth/login
// ============================================
router.post("/login", async function (req, res) {
    try {
        var email = req.body.email;
        var password = req.body.password;

        // Check if fields are filled
        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        // Find user by email
        var user = await UserModel.findOne({ email: email });
        if (!user) {
            return res.status(400).json({ error: "Invalid email or password" });
        }

        // Compare password
        var isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: "Invalid email or password" });
        }

        // Create JWT token
        var token = jwt.sign(
            { userId: user._id, name: user.name, email: user.email },
            process.env.JWT_SECRET || "default-secret",
            { expiresIn: "7d" }
        );

        // Send response
        res.json({
            message: "Login successful",
            token: token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
        });
    } catch (err) {
        console.log("Login error:", err);
        res.status(500).json({ error: "Login failed" });
    }
});

// ============================================
// FORGOT PASSWORD — Send OTP to email
// POST /api/auth/forgot-password
// ============================================
router.post("/forgot-password", async function (req, res) {
    try {
        var email = req.body.email;

        if (!email) {
            return res.status(400).json({ error: "Email is required" });
        }

        // Find user
        var user = await UserModel.findOne({ email: email });
        if (!user) {
            return res.status(400).json({ error: "No account found with this email" });
        }

        // Generate OTP and save it
        var otp = generateOtp();
        user.resetOtp = otp;
        user.resetOtpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        await user.save();

        // Send OTP email
        var mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "QRDynamic - Password Reset OTP",
            html:
                '<div style="font-family: Arial, sans-serif; padding: 20px; max-width: 400px; margin: auto; background: #1a1a2e; color: #f0f0ff; border-radius: 12px;">' +
                '<h2 style="color: #8b5cf6; text-align: center;">QRDynamic</h2>' +
                "<p>Your OTP for password reset is:</p>" +
                '<div style="text-align: center; margin: 20px 0;">' +
                '<span style="font-size: 32px; font-weight: bold; color: #8b5cf6; letter-spacing: 8px;">' +
                otp +
                "</span>" +
                "</div>" +
                '<p style="color: #a0a0c0; font-size: 14px;">This OTP is valid for 10 minutes.</p>' +
                "</div>",
        };

        await transporter.sendMail(mailOptions);

        res.json({ message: "OTP sent to your email" });
    } catch (err) {
        console.log("Forgot password error:", err);
        res.status(500).json({ error: "Failed to send OTP" });
    }
});

// ============================================
// VERIFY OTP — Check if OTP is correct
// POST /api/auth/verify-otp
// ============================================
router.post("/verify-otp", async function (req, res) {
    try {
        var email = req.body.email;
        var otp = req.body.otp;

        if (!email || !otp) {
            return res.status(400).json({ error: "Email and OTP are required" });
        }

        // Find user
        var user = await UserModel.findOne({ email: email });
        if (!user) {
            return res.status(400).json({ error: "User not found" });
        }

        // Check OTP
        if (user.resetOtp !== otp) {
            return res.status(400).json({ error: "Invalid OTP" });
        }

        // Check if OTP is expired
        if (new Date() > user.resetOtpExpiry) {
            return res.status(400).json({ error: "OTP has expired" });
        }

        res.json({ message: "OTP verified successfully" });
    } catch (err) {
        console.log("Verify OTP error:", err);
        res.status(500).json({ error: "OTP verification failed" });
    }
});

// ============================================
// RESET PASSWORD — Set new password after OTP
// POST /api/auth/reset-password
// ============================================
router.post("/reset-password", async function (req, res) {
    try {
        var email = req.body.email;
        var otp = req.body.otp;
        var newPassword = req.body.newPassword;

        if (!email || !otp || !newPassword) {
            return res.status(400).json({ error: "All fields are required" });
        }

        // Find user and verify OTP again
        var user = await UserModel.findOne({ email: email });
        if (!user || user.resetOtp !== otp || new Date() > user.resetOtpExpiry) {
            return res.status(400).json({ error: "Invalid or expired OTP" });
        }

        // Hash new password and save
        user.password = await bcrypt.hash(newPassword, 10);
        user.resetOtp = null;
        user.resetOtpExpiry = null;
        await user.save();

        res.json({ message: "Password reset successful" });
    } catch (err) {
        console.log("Reset password error:", err);
        res.status(500).json({ error: "Password reset failed" });
    }
});

module.exports = router;
