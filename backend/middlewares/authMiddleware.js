const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    try {
        const token = req.headers.jwttoken || req.headers.authorization?.split(" ")[1];
        
        if (!token) {
            return res.status(401).json({ error: "No token provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || process.env.jsonpassword);
        req.user = decoded;
        req.username = decoded.username;
        next();
    } catch (error) {
        return res.status(401).json({ error: "Invalid or expired token" });
    }
};

module.exports = authMiddleware;