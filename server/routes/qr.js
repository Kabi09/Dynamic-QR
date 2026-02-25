// ===== QR Code Routes =====
// Logged-in users: CRUD with auth, filtered by userId
// Guest users: create without auth (userId=null), fetch by shortIds

var express = require("express");
var router = express.Router();
var QRCode = require("qrcode");
var nanoid = require("nanoid");
var QrCodeModel = require("../models/QrCode");
var authMiddleware = require("../middleware/auth");

// ============================================
// CREATE — Logged-in user (requires auth)
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
            width: size, margin: 2,
            color: { dark: "#000000", light: "#ffffff" },
        });

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
// CREATE — Guest user (NO auth needed)
// POST /api/qr/guest
// ============================================
router.post("/guest", async function (req, res) {
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
            width: size, margin: 2,
            color: { dark: "#000000", light: "#ffffff" },
        });

        // Save to DB with NO userId (guest)
        var savedQr = await QrCodeModel.create({
            name: name,
            size: size,
            targetUrl: targetUrl,
            shortId: shortId,
            userId: null,
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
        console.log("Guest create QR error:", err);
        res.status(500).json({ error: "Failed to create QR code" });
    }
});

// ============================================
// READ — Logged-in user's QR codes
// GET /api/qr
// ============================================
router.get("/", authMiddleware, async function (req, res) {
    try {
        var serverUrl = req.protocol + "://" + req.get("host");
        var allQrCodes = await QrCodeModel.find({ userId: req.user.userId }).sort({ createdAt: -1 });

        var result = [];
        for (var i = 0; i < allQrCodes.length; i++) {
            var qr = allQrCodes[i];
            var redirectUrl = serverUrl + "/r/" + qr.shortId;
            var qrImage = await QRCode.toDataURL(redirectUrl, {
                width: qr.size, margin: 2,
                color: { dark: "#000000", light: "#ffffff" },
            });
            result.push({
                _id: qr._id, name: qr.name, size: qr.size,
                targetUrl: qr.targetUrl, shortId: qr.shortId,
                redirectUrl: redirectUrl, qrImage: qrImage,
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
// READ — Guest QR codes by shortIds
// POST /api/qr/guest/list
// Body: { shortIds: ["abc123", "xyz789"] }
// ============================================
router.post("/guest/list", async function (req, res) {
    try {
        var shortIds = req.body.shortIds || [];

        if (shortIds.length === 0) {
            return res.json([]);
        }

        var serverUrl = req.protocol + "://" + req.get("host");
        var allQrCodes = await QrCodeModel.find({ shortId: { $in: shortIds } }).sort({ createdAt: -1 });

        var result = [];
        for (var i = 0; i < allQrCodes.length; i++) {
            var qr = allQrCodes[i];
            var redirectUrl = serverUrl + "/r/" + qr.shortId;
            var qrImage = await QRCode.toDataURL(redirectUrl, {
                width: qr.size, margin: 2,
                color: { dark: "#000000", light: "#ffffff" },
            });
            result.push({
                _id: qr._id, name: qr.name, size: qr.size,
                targetUrl: qr.targetUrl, shortId: qr.shortId,
                redirectUrl: redirectUrl, qrImage: qrImage,
                createdAt: qr.createdAt,
            });
        }

        res.json(result);
    } catch (err) {
        console.log("Guest list QR error:", err);
        res.status(500).json({ error: "Failed to fetch guest QR codes" });
    }
});

// ============================================
// UPDATE — Logged-in user
// PUT /api/qr/:id
// ============================================
router.put("/:id", authMiddleware, async function (req, res) {
    try {
        var updateData = {};
        if (req.body.name) updateData.name = req.body.name;
        if (req.body.targetUrl) updateData.targetUrl = req.body.targetUrl;

        var updatedQr = await QrCodeModel.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.userId },
            updateData, { new: true }
        );

        if (!updatedQr) {
            return res.status(404).json({ error: "QR code not found" });
        }

        var serverUrl = req.protocol + "://" + req.get("host");
        var redirectUrl = serverUrl + "/r/" + updatedQr.shortId;
        var qrImage = await QRCode.toDataURL(redirectUrl, {
            width: updatedQr.size, margin: 2,
            color: { dark: "#000000", light: "#ffffff" },
        });

        res.json({
            _id: updatedQr._id, name: updatedQr.name, size: updatedQr.size,
            targetUrl: updatedQr.targetUrl, shortId: updatedQr.shortId,
            redirectUrl: redirectUrl, qrImage: qrImage,
            createdAt: updatedQr.createdAt,
        });
    } catch (err) {
        console.log("Update QR error:", err);
        res.status(500).json({ error: "Failed to update QR code" });
    }
});

// ============================================
// UPDATE — Guest (by shortId, no auth)
// PUT /api/qr/guest/:shortId
// ============================================
router.put("/guest/:shortId", async function (req, res) {
    try {
        var updateData = {};
        if (req.body.name) updateData.name = req.body.name;
        if (req.body.targetUrl) updateData.targetUrl = req.body.targetUrl;

        var updatedQr = await QrCodeModel.findOneAndUpdate(
            { shortId: req.params.shortId, userId: null },
            updateData, { new: true }
        );

        if (!updatedQr) {
            return res.status(404).json({ error: "QR code not found" });
        }

        var serverUrl = req.protocol + "://" + req.get("host");
        var redirectUrl = serverUrl + "/r/" + updatedQr.shortId;
        var qrImage = await QRCode.toDataURL(redirectUrl, {
            width: updatedQr.size, margin: 2,
            color: { dark: "#000000", light: "#ffffff" },
        });

        res.json({
            _id: updatedQr._id, name: updatedQr.name, size: updatedQr.size,
            targetUrl: updatedQr.targetUrl, shortId: updatedQr.shortId,
            redirectUrl: redirectUrl, qrImage: qrImage,
            createdAt: updatedQr.createdAt,
        });
    } catch (err) {
        console.log("Guest update QR error:", err);
        res.status(500).json({ error: "Failed to update QR code" });
    }
});

// ============================================
// DELETE — Logged-in user
// DELETE /api/qr/:id
// ============================================
router.delete("/:id", authMiddleware, async function (req, res) {
    try {
        var deletedQr = await QrCodeModel.findOneAndDelete({
            _id: req.params.id, userId: req.user.userId,
        });

        if (!deletedQr) {
            return res.status(404).json({ error: "QR code not found" });
        }

        res.json({ message: "QR code deleted successfully", shortId: deletedQr.shortId });
    } catch (err) {
        console.log("Delete QR error:", err);
        res.status(500).json({ error: "Failed to delete QR code" });
    }
});

// ============================================
// DELETE — Guest (by shortId, no auth)
// DELETE /api/qr/guest/:shortId
// ============================================
router.delete("/guest/:shortId", async function (req, res) {
    try {
        var deletedQr = await QrCodeModel.findOneAndDelete({
            shortId: req.params.shortId, userId: null,
        });

        if (!deletedQr) {
            return res.status(404).json({ error: "QR code not found" });
        }

        res.json({ message: "QR code deleted successfully", shortId: deletedQr.shortId });
    } catch (err) {
        console.log("Guest delete QR error:", err);
        res.status(500).json({ error: "Failed to delete QR code" });
    }
});

module.exports = router;
