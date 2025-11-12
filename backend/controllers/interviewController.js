const { QA, Qno } = require("../models/Session");
const { generateContent } = require("../utils/geminiClient");
const { asyncHandler } = require("../utils/errorHandler");

// Generate Interview Question
exports.generateQuestion = asyncHandler(async (req, res) => {
    const username = req.headers.username;
    const { domain, numberofquestion } = req.body;

    if (!domain) {
        return res.status(400).json({ error: "Domain is required" });
    }

    let qaRecord = await QA.findOne({ username });
    if (!qaRecord) {
        qaRecord = new QA({ username, questionanswer: '' });
        await qaRecord.save();
    }

    let qnoRecord = await Qno.findOne({ username });
    if (!qnoRecord) {
        qnoRecord = new Qno({ username, qno: "0" });
        await qnoRecord.save();
    }

    let i = parseInt(qnoRecord.qno, 10);

    let prompt1;
    if (i === 0) {
        prompt1 = `Generate a professional interview question in the domain of "${domain}".`;
    } else {
        prompt1 = `Based on this previous Q&A history, generate a relevant follow-up interview question in the domain of "${domain}":\n${qaRecord.questionanswer}\n\nOnly output the question itself. Do not include analysis, explanation, or commentary.`;
    }

    const question = await generateContent(prompt1);

    qaRecord.questionanswer += `\nQ${i + 1}: ${question}`;
    await qaRecord.save();

    qnoRecord.qno = (i + 1).toString();
    await qnoRecord.save();

    res.json({
        qno: i + 1,
        question: question
    });
});

// Store Answer
exports.addAnswer = asyncHandler(async (req, res) => {
    const username = req.headers.username;
    const { answer } = req.body;

    if (!answer) {
        return res.status(400).json({ error: "Answer is required" });
    }

    let qaRecord = await QA.findOne({ username });
    if (!qaRecord) {
        qaRecord = new QA({ username, questionanswer: '' });
        await qaRecord.save();
    }

    let qnoRecord = await Qno.findOne({ username });
    if (!qnoRecord) {
        return res.status(400).json({ error: "No question found for the user" });
    }

    let i = parseInt(qnoRecord.qno, 10);
    qaRecord.questionanswer += `\nA${i}: ${answer}`;
    await qaRecord.save();

    res.json({ mes: "Added the answer to the database" });
});

// Reset Interview Session
exports.resetInterview = asyncHandler(async (req, res) => {
    const username = req.headers.username;

    await QA.deleteOne({ username });
    await Qno.deleteOne({ username });

    res.json({ message: "true" });
});
