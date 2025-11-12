const express = require('express');
const router = express.Router();
const { checkResume } = require('../controllers/resumeController');

router.post('/checkresume', checkResume);

module.exports = router;
