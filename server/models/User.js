// ===== User Model =====
// Stores user accounts for authentication

var mongoose = require("mongoose");

var userSchema = new mongoose.Schema(
    {
        // User's full name
        name: {
            type: String,
            required: true,
        },

        // User's email (used for login)
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },

        // Hashed password
        password: {
            type: String,
            required: true,
        },

        // OTP for password reset (temporary)
        resetOtp: {
            type: String,
            default: null,
        },

        // OTP expiry time
        resetOtpExpiry: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

var UserModel = mongoose.model("User", userSchema);

module.exports = UserModel;
