const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    image: {
        type: String,
        required: true
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Image", imageSchema);