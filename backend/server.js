const express = require('express');
require("dotenv").config();
const cors = require('cors');
const connectDB = require('./config/db');
const { errorHandler } = require('./utils/errorHandler');
const authRoutes = require('./routes/authRoutes');
const interviewRoutes = require('./routes/interviewRoutes');
const scoreRoutes = require('./routes/scoreRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const profileRoutes = require('./routes/profileRoutes');
const behaviourRoutes = require('./routes/behaviourRoutes');

const app = express();

// Middleware
// Configure CORS - allow specific frontend origin in production
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://ai-interviewer-bot-main.vercel.app',
    process.env.FRONTEND_URL
].filter(Boolean);

const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.log('❌ CORS blocked origin:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
};
const bodyParser = require('body-parser');
app.use(cors(corsOptions));

app.use(bodyParser.text({ type: 'application/json', limit: '8mb' }));
app.use((req, res, next) => {
    const ct = req.headers['content-type'] || '';
    if (ct.includes('application/json')) {
        const text = req.body;
        if (!text || String(text).trim() === 'null' || String(text).trim() === '') {
            req.body = {};
            return next();
        }

        try {
            req.body = JSON.parse(text);
            return next();
        } catch (err) {
            return next(err);
        }
    }
    next();
});

app.use(express.urlencoded({ extended: true, limit: '8mb' }));
app.use(express.static('public'));

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', interviewRoutes);
app.use('/api', scoreRoutes);
app.use('/api', resumeRoutes);
app.use('/api', profileRoutes);
app.use('/api', behaviourRoutes);

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});

module.exports = app;