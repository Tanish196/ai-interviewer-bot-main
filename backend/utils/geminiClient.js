const { GoogleGenerativeAI } = require("@google/generative-ai");

let genAI;
let model;

const initializeGemini = () => {
    if (!genAI) {
        genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    }
    return model;
};

const generateContent = async (prompt) => {
    try {
        const modelInstance = initializeGemini();
        const result = await modelInstance.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        console.error("Gemini API Error:", error);
        throw new Error("Failed to generate content from Gemini API");
    }
};

const parseModelJSON = (text) => {
    try {
        // Clean markdown code fences if present
        let cleanedText = text.trim();
        if (cleanedText.startsWith("```json")) {
            cleanedText = cleanedText.replace(/^```json\s*/, "").replace(/```$/, "").trim();
        } else if (cleanedText.startsWith("```")) {
            cleanedText = cleanedText.replace(/^```\s*/, "").replace(/```$/, "").trim();
        }
        
        return JSON.parse(cleanedText);
    } catch (error) {
        console.error("Failed to parse JSON:", text);
        throw new Error("Failed to parse model output as JSON");
    }
};

module.exports = {
    initializeGemini,
    generateContent,
    parseModelJSON
};