const express = require('express');
const router = express.Router();
const { calculateScore, checkScore } = require('../controllers/scoreController');

router.post('/score', calculateScore);
router.post('/checkscore', checkScore);

module.exports = router;
