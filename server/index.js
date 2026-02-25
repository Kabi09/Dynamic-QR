require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const QrCodeModel = require("./models/QrCode");
const qrRoutes = require("./routes/qr");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// API routes
app.use("/api/qr", qrRoutes);

// REDIRECT route — this is what the QR code points to
app.get("/r/:shortId", async (req, res) => {
    try {
        const qr = await QrCodeModel.findOne({ shortId: req.params.shortId });
        if (!qr) {
            return res.status(404).send(`
        <html>
          <body style="display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif;background:#0f0f0f;color:#fff;">
            <h1>🔗 Link not found</h1>
          </body>
        </html>
      `);
        }
        res.redirect(302, qr.targetUrl);
    } catch (err) {
        console.error("Redirect error:", err);
        res.status(500).send("Server error");
    }
});

// Demo route
app.get("/demo", (req, res) => {
    res.json({ message: "welcome" });
});

// Health check
app.get("/", (req, res) => {
    res.json({ status: "Dynamic QR Code API is running 🚀" });
});

// Connect to MongoDB and start server
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("✅ Connected to MongoDB");
        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error("❌ MongoDB connection error:", err.message);
        process.exit(1);
    });
