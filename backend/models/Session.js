const mongoose = require("mongoose");

const scoreSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    lastscore: {
        type: String,
        default: ""
    }
});

const qaSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    questionanswer: {
        type: String,
        default: ""
    }
});

const qnoSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    qno: {
        type: String,
        default: "0"
    }
});

const Score = mongoose.model("Score", scoreSchema);
const QA = mongoose.model("QA", qaSchema);
const Qno = mongoose.model("Qno", qnoSchema);

module.exports = { Score, QA, Qno };