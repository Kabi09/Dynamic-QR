const express = require("express");
const router = express.Router();
const QRCode = require("qrcode");
const { nanoid } = require("nanoid");
const QrCodeModel = require("../models/QrCode");

// CREATE — generate a new dynamic QR code
router.post("/", async (req, res) => {
    try {
        const { name, size, targetUrl } = req.body;

        if (!name || !targetUrl) {
            return res.status(400).json({ error: "Name and Target URL are required" });
        }

        const shortId = nanoid(8);
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const redirectUrl = `${baseUrl}/r/${shortId}`;

        // Generate QR code image as data URL
        const qrSize = size || 300;
        const qrDataUrl = await QRCode.toDataURL(redirectUrl, {
            width: qrSize,
            margin: 2,
            color: { dark: "#000000", light: "#ffffff" },
        });

        const qrDoc = await QrCodeModel.create({
            name,
            size: qrSize,
            targetUrl,
            shortId,
        });

        res.status(201).json({
            _id: qrDoc._id,
            name: qrDoc.name,
            size: qrDoc.size,
            targetUrl: qrDoc.targetUrl,
            shortId: qrDoc.shortId,
            redirectUrl,
            qrImage: qrDataUrl,
            createdAt: qrDoc.createdAt,
        });
    } catch (err) {
        console.error("Create QR error:", err);
        res.status(500).json({ error: "Failed to create QR code" });
    }
});

// READ — list all QR codes
router.get("/", async (req, res) => {
    try {
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const qrCodes = await QrCodeModel.find().sort({ createdAt: -1 });

        const result = await Promise.all(
            qrCodes.map(async (qr) => {
                const redirectUrl = `${baseUrl}/r/${qr.shortId}`;
                const qrDataUrl = await QRCode.toDataURL(redirectUrl, {
                    width: qr.size,
                    margin: 2,
                    color: { dark: "#000000", light: "#ffffff" },
                });
                return {
                    _id: qr._id,
                    name: qr.name,
                    size: qr.size,
                    targetUrl: qr.targetUrl,
                    shortId: qr.shortId,
                    redirectUrl,
                    qrImage: qrDataUrl,
                    createdAt: qr.createdAt,
                };
            })
        );

        res.json(result);
    } catch (err) {
        console.error("List QR error:", err);
        res.status(500).json({ error: "Failed to fetch QR codes" });
    }
});

// UPDATE — change name or targetUrl (QR image stays the same!)
router.put("/:id", async (req, res) => {
    try {
        const { name, targetUrl } = req.body;
        const qr = await QrCodeModel.findByIdAndUpdate(
            req.params.id,
            { ...(name && { name }), ...(targetUrl && { targetUrl }) },
            { new: true, runValidators: true }
        );

        if (!qr) return res.status(404).json({ error: "QR code not found" });

        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const redirectUrl = `${baseUrl}/r/${qr.shortId}`;
        const qrDataUrl = await QRCode.toDataURL(redirectUrl, {
            width: qr.size,
            margin: 2,
            color: { dark: "#000000", light: "#ffffff" },
        });

        res.json({
            _id: qr._id,
            name: qr.name,
            size: qr.size,
            targetUrl: qr.targetUrl,
            shortId: qr.shortId,
            redirectUrl,
            qrImage: qrDataUrl,
            createdAt: qr.createdAt,
        });
    } catch (err) {
        console.error("Update QR error:", err);
        res.status(500).json({ error: "Failed to update QR code" });
    }
});

// DELETE — remove a QR code
router.delete("/:id", async (req, res) => {
    try {
        const qr = await QrCodeModel.findByIdAndDelete(req.params.id);
        if (!qr) return res.status(404).json({ error: "QR code not found" });
        res.json({ message: "QR code deleted successfully" });
    } catch (err) {
        console.error("Delete QR error:", err);
        res.status(500).json({ error: "Failed to delete QR code" });
    }
});

module.exports = router;
