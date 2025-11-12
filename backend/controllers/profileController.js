const Image = require("../models/Interview");
const { asyncHandler } = require("../utils/errorHandler");

// Get Profile Image
exports.getImage = asyncHandler(async (req, res) => {
    const { username } = req.headers;

    if (!username) {
        return res.status(400).json({ error: "Username is required" });
    }

    const userImage = await Image.findOne({ username });

    if (userImage) {
        res.json({ image: userImage.image });
    } else {
        res.json({ image: null });
    }
});

// Add/Update Profile Image
exports.addImage = asyncHandler(async (req, res) => {
    const { username, image } = req.body;

    if (!username || !image) {
        return res.status(400).json({ error: "Username and image are required" });
    }

    const existing = await Image.findOne({ username });

    if (existing) {
        existing.image = image;
        existing.updatedAt = Date.now();
        await existing.save();
        return res.json({ message: "Image updated" });
    } else {
        const newImage = new Image({ username, image });
        await newImage.save();
        return res.json({ message: "Image added" });
    }
});

// Transcribe Audio
const multer = require('multer');
const { transcribeAudio } = require('../utils/assemblyClient');
const upload = multer({ storage: multer.memoryStorage() });

exports.transcribeAudio = [
    upload.single('audio'),
    asyncHandler(async (req, res) => {
        if (!req.file) {
            return res.status(400).json({ error: "No audio file provided" });
        }

        const buffer = req.file.buffer;
        const text = await transcribeAudio(buffer);

        res.json({ text });
    })
];
