const express = require('express');
const router = express.Router();
const { 
    generateQuestion, 
    addAnswer, 
    resetInterview 
} = require('../controllers/interviewController');

router.post('/interview', generateQuestion);
router.post('/addanswer', addAnswer);
router.post('/home', resetInterview);

module.exports = router;
