const express = require('express');
require("dotenv").config();
const cors = require('cors');
const connectDB = require('./config/db');
const { errorHandler } = require('./utils/errorHandler');

// Import routes
const authRoutes = require('./routes/authRoutes');
const interviewRoutes = require('./routes/interviewRoutes');
const scoreRoutes = require('./routes/scoreRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const profileRoutes = require('./routes/profileRoutes');

const app = express();

// Middleware
// Configure CORS - allow specific frontend origin in production (set FRONTEND_URL)
const corsOptions = {
    origin: process.env.FRONTEND_URL || true, // set FRONTEND_URL in production to your Vercel URL
    credentials: true,
};
const bodyParser = require('body-parser');
app.use(cors(corsOptions));

// Replace express.json with a tolerant parser that first reads the raw text and handles literal 'null' bodies gracefully (some clients send JSON 'null').
app.use(bodyParser.text({ type: 'application/json', limit: '8mb' }));
app.use((req, res, next) => {
    const ct = req.headers['content-type'] || '';
    if (ct.includes('application/json')) {
        const text = req.body;
        if (!text || String(text).trim() === 'null' || String(text).trim() === '') {
            // treat null or empty body as empty object
            req.body = {};
            return next();
        }

        try {
            req.body = JSON.parse(text);
            return next();
        } catch (err) {
            // forward parse error to error handler
            return next(err);
        }
    }
    // For non-json content-types, defer to urlencoded parser
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

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});

module.exports = app;