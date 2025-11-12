const { AssemblyAI } = require('assemblyai');

let client;

const initializeAssemblyAI = () => {
    if (!client) {
        client = new AssemblyAI({
            apiKey: process.env.ASSEMBLYAI_API_KEY || process.env.apiKey
        });
    }
    return client;
};

const transcribeAudio = async (audioBuffer) => {
    try {
        const assemblyClient = initializeAssemblyAI();
        const transcript = await assemblyClient.transcripts.transcribe({
            audio: audioBuffer
        });
        return transcript.text;
    } catch (error) {
        console.error("AssemblyAI Transcription Error:", error);
        throw new Error("Failed to transcribe audio");
    }
};

module.exports = {
    initializeAssemblyAI,
    transcribeAudio
};
