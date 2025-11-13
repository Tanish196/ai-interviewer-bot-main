const { GoogleGenerativeAI } = require("@google/generative-ai");

let genAI;

// Backup model hierarchy: try models in order until one succeeds
const BACKUP_MODELS = [
    "gemini-2.0-flash",      
    "gemini-2.5-flash",           
    "gemini-2.0-pro",
    "gemini-2.0-flash-lite", 
    "gemini-2.5-flash-lite", 
];

const initializeGemini = () => {
    if (!genAI) {
        genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    }
    return genAI;
};

const generateContent = async (prompt, retryCount = 0) => {
    const genAI = initializeGemini();
    
    for (let i = 0; i < BACKUP_MODELS.length; i++) {
        const modelName = BACKUP_MODELS[i];
        
        try {
            console.log(`Attempting with model: ${modelName} (attempt ${retryCount + 1})`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(prompt);
            const text = result.response.text();
            
            console.log(`Success with model: ${modelName}`);
            return text;
            
        } catch (error) {
            const isRateLimitError = error.status === 429 || 
                                    error.message?.includes('429') ||
                                    error.message?.includes('Resource exhausted') ||
                                    error.message?.includes('quota');
            
            const isLastModel = i === BACKUP_MODELS.length - 1;
            
            console.error(`❌ Model ${modelName} failed:`, error.message);
            
            // If rate limit and not last model, try next model immediately
            if (isRateLimitError && !isLastModel) {
                console.log(`⏭️ Rate limit hit, trying next backup model...`);
                continue;
            }
            
            // If last model and rate limit, retry with delay
            if (isRateLimitError && isLastModel && retryCount < 2) {
                const delay = Math.pow(2, retryCount) * 2000; // 2s, 4s, 8s
                console.log(`⏳ All models rate limited. Waiting ${delay/1000}s before retry...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                return generateContent(prompt, retryCount + 1);
            }
            
            // If not rate limit error or exhausted all retries, throw
            if (isLastModel) {
                throw new Error(`All backup models failed. Last error: ${error.message}`);
            }
        }
    }
    
    throw new Error("Failed to generate content from any Gemini model");
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