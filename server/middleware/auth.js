// ===== Auth Middleware =====
// Checks if the user is logged in by verifying their JWT token
// If valid, adds user info to req.user

var jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
    // Get the token from the Authorization header
    var authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "No token provided. Please login." });
    }

    var token = authHeader.split(" ")[1];

    try {
        // Verify the token
        var decoded = jwt.verify(token, process.env.JWT_SECRET || "default-secret");

        // Add user info to the request
        req.user = {
            userId: decoded.userId,
            name: decoded.name,
            email: decoded.email,
        };

        next(); // Continue to the route
    } catch (err) {
        return res.status(401).json({ error: "Invalid or expired token" });
    }
}

module.exports = authMiddleware;
