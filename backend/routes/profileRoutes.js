const express = require('express');
const router = express.Router();
const { getImage, addImage, transcribeAudio } = require('../controllers/profileController');

router.post('/getimage', getImage);
router.post('/addimage', addImage);
router.post('/transcribe', transcribeAudio);

module.exports = router;
