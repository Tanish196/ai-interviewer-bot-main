const express = require('express');
const router = express.Router();
const geminiClient = require('../utils/geminiClient');

/**
 * Retry logic with exponential backoff for Gemini API
 * Handles 503 overload errors gracefully
 */
async function retryWithBackoff(fn, maxRetries = 3, initialDelay = 1000) {
  let lastError;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Check if it's a 503 overload error
      const is503 = error.message?.includes('503') || 
                    error.message?.includes('overloaded') ||
                    error.message?.includes('RESOURCE_EXHAUSTED');
      
      if (!is503 || attempt === maxRetries - 1) {
        throw error;
      }
      
      // Exponential backoff: wait 1s, 2s, 4s, etc.
      const delay = initialDelay * Math.pow(2, attempt);
      console.log(`Gemini API overloaded. Retrying in ${delay}ms... (Attempt ${attempt + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}

router.post('/final-analysis', async (req, res) => {
  try {
    const { interviewScore, behaviourMetrics } = req.body;

    // Validate inputs
    if (typeof interviewScore !== 'number' || interviewScore < 0 || interviewScore > 10) {
      return res.status(400).json({
        success: false,
        message: 'Invalid interviewScore. Must be a number between 0 and 10.'
      });
    }

    if (!behaviourMetrics || typeof behaviourMetrics !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Invalid behaviourMetrics. Must be an object.'
      });
    }

    const {
      behaviourScore = 0,
      focusScore = 0,
      postureScore = 0,
      movementJitterScore = 0,
      offScreenPercent = 0,
      badPosturePercent = 0,
      duration = 0
    } = behaviourMetrics;

    // Compute final score: 70% interview + 30% behaviour
    const finalScore = Math.round((0.7 * interviewScore + 0.3 * behaviourScore) * 10) / 10;

    // Generate behaviour analysis using Gemini
    const calmnessScore = Math.max(0, 10 - movementJitterScore);
    
    const prompt = `You are an expert interview coach analyzing a candidate's behaviour and nervousness during an interview.

**Interview Metrics:**
- Interview Score (content quality): ${interviewScore}/10
- Behaviour Score: ${behaviourScore}/10
- Duration: ${Math.round(duration)} seconds

**Detailed Behaviour Breakdown:**
1. Eye Tracking / Focus:
   - Focus Score: ${focusScore}/10
   - Off-screen Time: ${offScreenPercent.toFixed(1)}% (looking away from screen)

2. Posture Analysis:
   - Posture Score: ${postureScore}/10
   - Bad Posture Time: ${badPosturePercent.toFixed(1)}% (slouching, misalignment)

3. Nervousness Indicators:
   - Calmness Score: ${calmnessScore.toFixed(1)}/10
   - Movement Jitter: ${movementJitterScore.toFixed(1)}/10 (higher = more nervous)

**Task:**
Provide a comprehensive behaviour and nervousness analysis in JSON format with exactly these fields:

{
  "behaviourFeedback": [
    // Array of 3-5 specific observations about their behaviour (eye contact, posture, nervousness level)
    // Be constructive and specific. Example: "Maintained good eye contact for 75% of the interview."
  ],
  "tips": [
    // Array of 4-6 actionable improvement tips
    // Focus on practical advice for better body language, eye contact, and reducing nervousness
    // Example: "Practice looking directly at the camera to simulate eye contact."
  ]
}

**Important:**
- Be encouraging and constructive, not harsh
- Provide specific, actionable advice
- Acknowledge strengths before suggesting improvements
- Keep feedback relevant to the actual metrics provided
- Return ONLY valid JSON, no extra text`;

    // Call Gemini with retry logic using centralized client
    const text = await retryWithBackoff(async () => {
      return await geminiClient.generateContent(prompt);
    });
    
    // Parse JSON response from Gemini
    let behaviourAnalysis;
    try {
      // Extract JSON from potential markdown code blocks
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        behaviourAnalysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', text);
      // Fallback with default feedback
      behaviourAnalysis = {
        behaviourFeedback: [
          `Your behaviour score is ${behaviourScore}/10.`,
          `Focus score: ${focusScore}/10 - ${focusScore >= 7 ? 'Good eye contact maintained' : 'Try to maintain more consistent eye contact'}.`,
          `Posture score: ${postureScore}/10 - ${postureScore >= 7 ? 'Maintained professional posture' : 'Work on sitting upright and aligned'}.`,
          `Calmness: ${calmnessScore.toFixed(1)}/10 - ${calmnessScore >= 7 ? 'Appeared calm and confident' : 'Showed signs of nervousness'}.`
        ],
        tips: [
          'Practice mock interviews to build confidence.',
          'Focus on maintaining eye contact with the camera.',
          'Sit upright with shoulders back for better posture.',
          'Take deep breaths before answering to reduce nervousness.',
          'Use hand gestures naturally to appear more engaged.'
        ]
      };
    }

    // Send response
    res.json({
      success: true,
      interviewScore,
      behaviourScore,
      finalScore,
      behaviourFeedback: behaviourAnalysis.behaviourFeedback || [],
      tips: behaviourAnalysis.tips || [],
      metrics: {
        focusScore,
        postureScore,
        calmnessScore: calmnessScore.toFixed(1),
        offScreenPercent: offScreenPercent.toFixed(1),
        badPosturePercent: badPosturePercent.toFixed(1),
        duration: Math.round(duration)
      }
    });

  } catch (error) {
    console.error('Error in /final-analysis:', error);
    
    // Handle specific error types
    if (error.message?.includes('API key')) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or missing Gemini API key.'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to generate behaviour analysis. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
