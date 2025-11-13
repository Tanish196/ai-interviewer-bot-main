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
    const totalQuestionsValue = Number.parseInt(numberofquestion, 10);
    const interviewDescriptor = Number.isNaN(totalQuestionsValue)
        ? 'an interview'
        : `a ${totalQuestionsValue}-question interview`;
    const totalQuestionsSuffix = Number.isNaN(totalQuestionsValue)
        ? ''
        : ` of ${totalQuestionsValue}`;
    const transcript = qaRecord.questionanswer.trim();
    const transcriptBlock = transcript || 'No candidate transcript available yet.';

    let prompt1;
    if (i === 0) {
        prompt1 = `You are conducting ${interviewDescriptor} in the "${domain}" domain. You have not collected any information about the candidate yet. Ask your first question (#1) so that the candidate briefly shares their background, current role, or motivations related to "${domain}". Keep the tone professional but warm. Output only the question text without numbering, bullet points, analysis, or commentary.`;
    } else {
    prompt1 = `You are an attentive senior interviewer for roles in the "${domain}" domain. You have asked ${i} question(s) and are about to ask question #${i + 1}${totalQuestionsSuffix}. Use ONLY the information explicitly shared by the candidate in the transcript below to tailor the next question:

${transcriptBlock}

Craft the next single interview question that naturally builds on their previous answers and remains focused on the "${domain}" domain. You may reference specific details they mentioned to show active listening, but do not invent or assume facts that were not provided. Output only the question text, with no numbering, commentary, or follow-up instructions.`;
    }

    const question = (await generateContent(prompt1)).trim();

    const questionEntry = `Q${i + 1}: ${question}`;
    qaRecord.questionanswer = qaRecord.questionanswer
        ? `${qaRecord.questionanswer}\n${questionEntry}`
        : questionEntry;
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
    const answerEntry = `A${i}: ${answer}`;
    qaRecord.questionanswer = qaRecord.questionanswer
        ? `${qaRecord.questionanswer}\n${answerEntry}`
        : answerEntry;
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
