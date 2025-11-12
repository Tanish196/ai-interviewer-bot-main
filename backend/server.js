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
app.use(cors(corsOptions));
app.use(express.json({ limit: '8mb' }));
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