// ===== QR Code Routes =====
// Create, Read, Update, Delete QR codes
// Each user only sees their own QR codes

var express = require("express");
var router = express.Router();
var QRCode = require("qrcode");
var nanoid = require("nanoid");
var QrCodeModel = require("../models/QrCode");
var authMiddleware = require("../middleware/auth");

// ============================================
// CREATE — Make a new QR code (requires login)
// POST /api/qr
// ============================================
router.post("/", authMiddleware, async function (req, res) {
    try {
        var name = req.body.name;
        var size = req.body.size || 300;
        var targetUrl = req.body.targetUrl;

        if (!name || !targetUrl) {
            return res.status(400).json({ error: "Name and Target URL are required" });
        }

        var shortId = nanoid.nanoid(8);

        var serverUrl = req.protocol + "://" + req.get("host");
        var redirectUrl = serverUrl + "/r/" + shortId;

        var qrImage = await QRCode.toDataURL(redirectUrl, {
            width: size,
            margin: 2,
            color: { dark: "#000000", light: "#ffffff" },
        });

        // Save with the userId of the logged-in user
        var savedQr = await QrCodeModel.create({
            name: name,
            size: size,
            targetUrl: targetUrl,
            shortId: shortId,
            userId: req.user.userId,
        });

        res.status(201).json({
            _id: savedQr._id,
            name: savedQr.name,
            size: savedQr.size,
            targetUrl: savedQr.targetUrl,
            shortId: savedQr.shortId,
            redirectUrl: redirectUrl,
            qrImage: qrImage,
            createdAt: savedQr.createdAt,
        });
    } catch (err) {
        console.log("Create QR error:", err);
        res.status(500).json({ error: "Failed to create QR code" });
    }
});

// ============================================
// READ — Get only YOUR QR codes (requires login)
// GET /api/qr
// ============================================
router.get("/", authMiddleware, async function (req, res) {
    try {
        var serverUrl = req.protocol + "://" + req.get("host");

        // Only get QR codes belonging to this user
        var allQrCodes = await QrCodeModel.find({ userId: req.user.userId }).sort({ createdAt: -1 });

        var result = [];

        for (var i = 0; i < allQrCodes.length; i++) {
            var qr = allQrCodes[i];
            var redirectUrl = serverUrl + "/r/" + qr.shortId;

            var qrImage = await QRCode.toDataURL(redirectUrl, {
                width: qr.size,
                margin: 2,
                color: { dark: "#000000", light: "#ffffff" },
            });

            result.push({
                _id: qr._id,
                name: qr.name,
                size: qr.size,
                targetUrl: qr.targetUrl,
                shortId: qr.shortId,
                redirectUrl: redirectUrl,
                qrImage: qrImage,
                createdAt: qr.createdAt,
            });
        }

        res.json(result);
    } catch (err) {
        console.log("List QR error:", err);
        res.status(500).json({ error: "Failed to fetch QR codes" });
    }
});

// ============================================
// UPDATE — Edit YOUR QR code (requires login)
// PUT /api/qr/:id
// ============================================
router.put("/:id", authMiddleware, async function (req, res) {
    try {
        var newName = req.body.name;
        var newTargetUrl = req.body.targetUrl;

        var updateData = {};
        if (newName) updateData.name = newName;
        if (newTargetUrl) updateData.targetUrl = newTargetUrl;

        // Only update if it belongs to this user
        var updatedQr = await QrCodeModel.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.userId },
            updateData,
            { new: true }
        );

        if (!updatedQr) {
            return res.status(404).json({ error: "QR code not found" });
        }

        var serverUrl = req.protocol + "://" + req.get("host");
        var redirectUrl = serverUrl + "/r/" + updatedQr.shortId;

        var qrImage = await QRCode.toDataURL(redirectUrl, {
            width: updatedQr.size,
            margin: 2,
            color: { dark: "#000000", light: "#ffffff" },
        });

        res.json({
            _id: updatedQr._id,
            name: updatedQr.name,
            size: updatedQr.size,
            targetUrl: updatedQr.targetUrl,
            shortId: updatedQr.shortId,
            redirectUrl: redirectUrl,
            qrImage: qrImage,
            createdAt: updatedQr.createdAt,
        });
    } catch (err) {
        console.log("Update QR error:", err);
        res.status(500).json({ error: "Failed to update QR code" });
    }
});

// ============================================
// DELETE — Remove YOUR QR code (requires login)
// DELETE /api/qr/:id
// ============================================
router.delete("/:id", authMiddleware, async function (req, res) {
    try {
        // Only delete if it belongs to this user
        var deletedQr = await QrCodeModel.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.userId,
        });

        if (!deletedQr) {
            return res.status(404).json({ error: "QR code not found" });
        }

        res.json({ message: "QR code deleted successfully" });
    } catch (err) {
        console.log("Delete QR error:", err);
        res.status(500).json({ error: "Failed to delete QR code" });
    }
});

module.exports = router;
