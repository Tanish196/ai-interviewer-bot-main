const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { asyncHandler } = require("../utils/errorHandler");

// Sign Up
exports.signup = asyncHandler(async (req, res) => {
    const { username, password } = req.headers;

    if (!username || !password) {
        return res.status(400).json({ mes: false, error: "Username and password are required" });
    }

    const existingUser = await User.findOne({ username });

    if (existingUser) {
        return res.json({ mes: false, message: "User already exists" });
    }

    const newUser = new User({ username, password });
    await newUser.save();

    res.json({ mes: true, message: "Sign-up successful" });
});

// Sign In
exports.signin = asyncHandler(async (req, res) => {
    const { username, password } = req.headers;

    if (!username || !password) {
        return res.status(400).json({ mes: "false", error: "Username and password are required" });
    }

    const existingUser = await User.findOne({ username, password });

    if (existingUser) {
        const token = jwt.sign(
            { username },
            process.env.JWT_SECRET || process.env.jsonpassword,
            { expiresIn: '24h' }
        );
        return res.json({ mes: "true", jwttoken: token });
    } else {
        return res.json({ mes: "false", message: "Invalid username or password" });
    }
});
