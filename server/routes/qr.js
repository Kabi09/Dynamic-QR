// ===== Import required packages =====
var express = require("express");
var router = express.Router();           // Create a router to define routes
var QRCode = require("qrcode");          // Library to generate QR code images
var nanoid = require("nanoid");          // Library to generate random short IDs
var QrCodeModel = require("../models/QrCode");  // Our database model

// ============================================
// CREATE — Make a new QR code
// POST /api/qr
// ============================================
router.post("/", async function (req, res) {
    try {
        // Step 1: Get the data from the request
        var name = req.body.name;
        var size = req.body.size || 300;
        var targetUrl = req.body.targetUrl;

        // Step 2: Check if required fields are provided
        if (!name || !targetUrl) {
            return res.status(400).json({ error: "Name and Target URL are required" });
        }

        // Step 3: Generate a random 8-character short ID
        var shortId = nanoid.nanoid(8);

        // Step 4: Build the redirect URL using the current server address
        var serverUrl = req.protocol + "://" + req.get("host");
        var redirectUrl = serverUrl + "/r/" + shortId;

        // Step 5: Generate the QR code image
        var qrImage = await QRCode.toDataURL(redirectUrl, {
            width: size,
            margin: 2,
            color: { dark: "#000000", light: "#ffffff" },
        });

        // Step 6: Save to database
        var savedQr = await QrCodeModel.create({
            name: name,
            size: size,
            targetUrl: targetUrl,
            shortId: shortId,
        });

        // Step 7: Send the response back
        res.status(201).json({
            _id: savedQr._id,
            name: savedQr.name,
            size: savedQr.size,
            targetUrl: savedQr.targetUrl,
            shortId: savedQr.shortId,
            isActive: savedQr.isActive,
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
// READ — Get all QR codes
// GET /api/qr
// ============================================
router.get("/", async function (req, res) {
    try {
        // Step 1: Get server URL
        var serverUrl = req.protocol + "://" + req.get("host");

        // Step 2: Get all QR codes from database (newest first)
        var allQrCodes = await QrCodeModel.find().sort({ createdAt: -1 });

        // Step 3: Loop through each QR code and add the image + redirect URL
        var result = [];

        for (var i = 0; i < allQrCodes.length; i++) {
            var qr = allQrCodes[i];
            var redirectUrl = serverUrl + "/r/" + qr.shortId;

            // Generate the QR image
            var qrImage = await QRCode.toDataURL(redirectUrl, {
                width: qr.size,
                margin: 2,
                color: { dark: "#000000", light: "#ffffff" },
            });

            // Add to results array
            result.push({
                _id: qr._id,
                name: qr.name,
                size: qr.size,
                targetUrl: qr.targetUrl,
                shortId: qr.shortId,
                isActive: qr.isActive,
                redirectUrl: redirectUrl,
                qrImage: qrImage,
                createdAt: qr.createdAt,
            });
        }

        // Step 4: Send all QR codes back
        res.json(result);
    } catch (err) {
        console.log("List QR error:", err);
        res.status(500).json({ error: "Failed to fetch QR codes" });
    }
});

// ============================================
// UPDATE — Edit a QR code's name or URL
// PUT /api/qr/:id
// ============================================
router.put("/:id", async function (req, res) {
    try {
        // Step 1: Get the new values from the request
        var newName = req.body.name;
        var newTargetUrl = req.body.targetUrl;

        // Step 2: Build the update object
        var updateData = {};
        if (newName) {
            updateData.name = newName;
        }
        if (newTargetUrl) {
            updateData.targetUrl = newTargetUrl;
        }

        // Step 3: Find and update the QR code in the database
        var updatedQr = await QrCodeModel.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }  // Return the updated document
        );

        // Step 4: Check if it exists
        if (!updatedQr) {
            return res.status(404).json({ error: "QR code not found" });
        }

        // Step 5: Generate the redirect URL and QR image
        var serverUrl = req.protocol + "://" + req.get("host");
        var redirectUrl = serverUrl + "/r/" + updatedQr.shortId;

        var qrImage = await QRCode.toDataURL(redirectUrl, {
            width: updatedQr.size,
            margin: 2,
            color: { dark: "#000000", light: "#ffffff" },
        });

        // Step 6: Send the updated QR code back
        res.json({
            _id: updatedQr._id,
            name: updatedQr.name,
            size: updatedQr.size,
            targetUrl: updatedQr.targetUrl,
            shortId: updatedQr.shortId,
            isActive: updatedQr.isActive,
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
// TOGGLE — Enable or Disable a QR code
// PATCH /api/qr/:id/toggle
// ============================================
router.patch("/:id/toggle", async function (req, res) {
    try {
        // Step 1: Find the QR code in the database
        var qr = await QrCodeModel.findById(req.params.id);

        // Step 2: Check if it exists
        if (!qr) {
            return res.status(404).json({ error: "QR code not found" });
        }

        // Step 3: Flip the isActive value (true becomes false, false becomes true)
        qr.isActive = !qr.isActive;
        await qr.save();

        // Step 4: Send back the updated status
        res.json({
            _id: qr._id,
            isActive: qr.isActive,
            message: qr.isActive ? "QR code enabled" : "QR code disabled",
        });
    } catch (err) {
        console.log("Toggle QR error:", err);
        res.status(500).json({ error: "Failed to toggle QR code" });
    }
});

// ============================================
// DELETE — Remove a QR code
// DELETE /api/qr/:id
// ============================================
router.delete("/:id", async function (req, res) {
    try {
        // Step 1: Find and delete the QR code
        var deletedQr = await QrCodeModel.findByIdAndDelete(req.params.id);

        // Step 2: Check if it existed
        if (!deletedQr) {
            return res.status(404).json({ error: "QR code not found" });
        }

        // Step 3: Send success message
        res.json({ message: "QR code deleted successfully" });
    } catch (err) {
        console.log("Delete QR error:", err);
        res.status(500).json({ error: "Failed to delete QR code" });
    }
});

// ===== Export the router =====
module.exports = router;
