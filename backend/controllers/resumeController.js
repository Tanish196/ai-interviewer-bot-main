const { generateContent } = require("../utils/geminiClient");
const { asyncHandler } = require("../utils/errorHandler");

// Check Resume
exports.checkResume = asyncHandler(async (req, res) => {
    const { resume, profile } = req.body;

    if (!resume || !profile) {
        return res.status(400).json({ error: "Resume and profile are required" });
    }

    const prompt1 = `${resume} This is my resume. I am focusing on the job for ${profile}. First, just only give the score of my resume out of 10. Never give the line like "The formatting is also inconsistent and contains errors."`;
    const prompt2 = `${resume} This is my resume. I am focusing on the job for ${profile}. What are the good things about my resume? Give them in bullet form in 50-70 words.`;
    const prompt3 = `${resume} This is my resume. I am focusing on the job for ${profile}. What are the things I have to improve? These things should not be in the resume or need to be added/learned to make more impact. Give them in bullet form in 50-70 words.`;

    const [scoreText, goodText, improveText] = await Promise.all([
        generateContent(prompt1),
        generateContent(prompt2),
        generateContent(prompt3)
    ]);

    res.json({
        score: scoreText,
        goodPoints: goodText,
        improvementPoints: improveText
    });
});
