const { Score, QA } = require("../models/Session");
const { generateContent, parseModelJSON } = require("../utils/geminiClient");
const jwt = require("jsonwebtoken");
const { asyncHandler } = require("../utils/errorHandler");

// Calculate Score and Generate Feedback
exports.calculateScore = asyncHandler(async (req, res) => {
    const username = req.headers.username;

    if (!username) {
        return res.status(400).json({ error: "Username is required" });
    }

    let lastscore = await Score.findOne({ username });
    if (!lastscore) {
        lastscore = new Score({ username, lastscore: "" });
        await lastscore.save();
    }

    let q = await QA.findOne({ username }).select('questionanswer');
    if (!q) {
        return res.status(404).json({ error: "No interview responses found for the user" });
    }

    const questionAnswer = q.questionanswer;

    const feedbackPrompt = `
Analyze the following interview responses: ${questionAnswer}
Provide a structured JSON object with the following format:
{
  "overall_score": "x/10",
  "overall_feedback": "<brief summary>",
  "date": "<current datetime in format: Mar 21, 2025 12:53 AM>",
  "breakdown": {
    "Communication Skills": {
      "score": "x/10",
      "feedback": "<feedback>"
    },
    "Technical Knowledge": {
      "score": "x/10",
      "feedback": "<feedback>"
    },
    "Problem Solving": {
      "score": "x/10",
      "feedback": "<feedback>"
    },
    "Cultural Fit": {
      "score": "x/10",
      "feedback": "<feedback>"
    },
    "Confidence and Clarity": {
      "score": "x/10",
      "feedback": "<feedback>"
    }
  },
  "strengths": "<summary of strengths>",
  "areas_for_improvement": [
    "<point 1>",
    "<point 2>",
    "<point 3>"
  ]
}
Only return valid JSON. Do not add commentary.
`;

    const feedbackText = await generateContent(feedbackPrompt);
    const parsed = parseModelJSON(feedbackText);

    // Save numeric score
    const numericScore = parsed.overall_score?.match(/\d+/)?.[0] || "0";
    lastscore.lastscore += lastscore.lastscore ? `_${numericScore}` : numericScore;
    await lastscore.save();

    // Clear previous Q&A
    q.questionanswer = "";
    await q.save();

    // Reset question number
    let qnoRecord = await QA.findOne({ username }).select('qno');
    if (qnoRecord) {
        qnoRecord.qno = "1";
        await qnoRecord.save();
    }

    res.json(parsed);
});

// Check Score History and Progress
exports.checkScore = asyncHandler(async (req, res) => {
    const username = req.headers.username;
    const token = req.headers.jwttoken;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || process.env.jsonpassword);
        const userScore = await Score.findOne({ username });

        if (!userScore || !userScore.lastscore) {
            return res.json({ 
                validUser: true, 
                array: [], 
                suggestion: "No score history found." 
            });
        }

        const lastScores = userScore.lastscore
            .split("_")
            .filter(score => score !== "")
            .map(Number);
        
        const lastFiveScores = lastScores.slice(-5);

        if (lastFiveScores.length >= 5) {
            const prompt = `Analyze the progress of the user's last 5 scores out of 10 in 70 words: ${lastFiveScores}`;
            const suggestion = await generateContent(prompt);

            return res.json({
                validUser: true,
                array: lastFiveScores,
                suggestion: suggestion,
            });
        } else {
            return res.json({ 
                validUser: true, 
                array: lastFiveScores, 
                suggestion: "Not enough scores to analyze." 
            });
        }
    } catch (err) {
        console.error("JWT Verification Failed:", err.message);
        return res.status(401).json({ 
            validUser: false, 
            array: [], 
            suggestion: "Invalid or expired token." 
        });
    }
});
