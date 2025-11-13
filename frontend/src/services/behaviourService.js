import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

/**
 * Behaviour Analysis Service
 * Sends interview score + behaviour metrics to backend for final analysis
 */
export const behaviourService = {
  /**
   * Send final analysis request
   * @param {number} interviewScore - Score from interview (0-10)
   * @param {object} behaviourMetrics - Tracking data from useBehaviourTracking
   * @returns {Promise<object>} Final analysis with combined scores and feedback
   */
  async getFinalAnalysis(interviewScore, behaviourMetrics) {
    try {
      const response = await axios.post(`${API_BASE_URL}/final-analysis`, {
        interviewScore,
        behaviourMetrics,
      });
      return response.data;
    } catch (error) {
      console.error('Error getting final analysis:', error);
      throw error;
    }
  },
};

export default behaviourService;
