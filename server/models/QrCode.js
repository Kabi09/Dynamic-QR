// ===== Import mongoose to work with MongoDB =====
var mongoose = require("mongoose");

// ===== Define the shape of a QR Code document =====
// This tells MongoDB what data each QR code should have
var qrCodeSchema = new mongoose.Schema(
    {
        // Name of the QR code (e.g. "My Website")
        name: {
            type: String,
            required: true,
        },

        // Size of the QR image in pixels (e.g. 300)
        size: {
            type: Number,
            default: 300,
        },

        // The actual URL the QR code should redirect to
        targetUrl: {
            type: String,
            required: true,
        },

        // A unique short ID used in the redirect link (e.g. "abc12345")
        shortId: {
            type: String,
            required: true,
            unique: true,
        },
    },
    {
        // Automatically add createdAt and updatedAt fields
        timestamps: true,
    }
);

// ===== Create and export the model =====
// "QrCode" is the name of the collection in MongoDB
var QrCodeModel = mongoose.model("QrCode", qrCodeSchema);

module.exports = QrCodeModel;
