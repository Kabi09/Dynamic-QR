// ===== Load environment variables from .env file =====
const dotenv = require("dotenv");
dotenv.config();

// ===== Import required packages =====
const express = require("express");       // Web server framework
const mongoose = require("mongoose");     // MongoDB connection library
const cors = require("cors");             // Allow frontend to talk to backend
const qrRoutes = require("./routes/qr"); // Our QR code routes
const authRoutes = require("./routes/auth"); // Auth routes (signup, login, etc.)
const QrCodeModel = require("./models/QrCode"); // QR code database model

// ===== Create the Express app =====
const app = express();

// ===== Set the port number =====
const PORT = process.env.PORT || 5000;

// ===== Middleware (runs on every request) =====
app.use(cors());             // Allow requests from any website
app.use(express.json());     // Parse JSON data from requests

// ===== API Routes =====
// All QR code CRUD operations are in /api/qr
app.use("/api/qr", qrRoutes);

// All auth operations are in /api/auth
app.use("/api/auth", authRoutes);

// ===== Redirect Route (Most important!) =====
// When someone scans a QR code, they visit /r/shortId
// This finds the matching URL in the database and redirects them
app.get("/r/:shortId", async function (req, res) {
    try {
        // Get the shortId from the URL
        var shortId = req.params.shortId;

        // Find the QR code in the database
        var qr = await QrCodeModel.findOne({ shortId: shortId });

        // If not found, show error
        if (!qr) {
            return res.status(404).json({ error: "QR code not found" });
        }

        // Redirect the user to the target URL
        res.redirect(qr.targetUrl);
    } catch (err) {
        console.log("Redirect error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// ===== Demo Route =====
app.get("/demo", function (req, res) {
    res.json({ message: "welcome" });
});

// ===== Home Route (Health Check) =====
app.get("/", function (req, res) {
    res.json({ status: "Dynamic QR Code API is running 🚀" });
});

// ===== Connect to MongoDB and Start Server =====
var MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/dynamic-qr";

mongoose
    .connect(MONGO_URI)
    .then(function () {
        console.log("✅ Connected to MongoDB");

        app.listen(PORT, function () {
            console.log("🚀 Server running on http://localhost:" + PORT);
        });
    })
    .catch(function (err) {
        console.log("❌ MongoDB connection failed:", err);
    });
