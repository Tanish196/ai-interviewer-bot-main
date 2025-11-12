import api from './api';

export const authService = {
    // Sign up
    signup: async (username, password) => {
        try {
            const response = await api.post('/auth/signup', { username, password });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Sign in
    signin: async (username, password) => {
        try {
            const response = await api.post('/auth/signin', { username, password });
            
            if (response.data.mes === "true") {
                localStorage.setItem('authToken', response.data.jwttoken);
                localStorage.setItem('username', username);
            }
            
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Sign out
    signout: () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('username');
        localStorage.removeItem('profileImage');
    },

    // Check if user is authenticated
    isAuthenticated: () => {
        return !!localStorage.getItem('authToken');
    },

    // Get current user
    getCurrentUser: () => {
        return localStorage.getItem('username');
    }
};

export const interviewService = {
    // Generate interview question
    generateQuestion: async (domain, numberofquestion) => {
        try {
            const response = await api.post('/interview', {
                domain,
                numberofquestion
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Submit answer
    submitAnswer: async (answer) => {
        try {
            const response = await api.post('/addanswer', { answer });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Reset interview
    resetInterview: async () => {
        try {
            const response = await api.post('/home');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Transcribe audio
    transcribeAudio: async (audioBlob) => {
        try {
            const formData = new FormData();
            formData.append('audio', audioBlob, 'recording.webm');
            
            const response = await api.post('/transcribe', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
};

export const scoreService = {
    // Get score and feedback
    getScore: async () => {
        try {
            const response = await api.post('/score');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Check score history
    checkScoreHistory: async () => {
        try {
            const response = await api.post('/checkscore');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
};

export const resumeService = {
    // Check resume
    checkResume: async (resume, profile) => {
        try {
            const response = await api.post('/checkresume', {
                resume,
                profile
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
};

export const profileService = {
    // Get profile image
    getImage: async () => {
        try {
            const response = await api.post('/getimage');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Add/update profile image
    addImage: async (image) => {
        try {
            const username = localStorage.getItem('username');
            const response = await api.post('/addimage', {
                username,
                image
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
};
