const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { analyzeGlucoseFromImage, analyzeMealFromImage, analyzeGlucoseFromText, analyzeWeightFromImage, analyzeBpFromImage, analyzeWeightFromText, analyzeBpFromText, analyzeMealFromText } = require('../controllers/analyzeController');

router.post('/glucose-from-image', auth, analyzeGlucoseFromImage);
router.post('/meal-from-image', auth, analyzeMealFromImage);
router.post('/glucose-from-text', auth, analyzeGlucoseFromText);
router.post('/weight-from-image', auth, analyzeWeightFromImage);
router.post('/bp-from-image', auth, analyzeBpFromImage);
router.post('/weight-from-text', auth, analyzeWeightFromText);
router.post('/bp-from-text', auth, analyzeBpFromText);
router.post('/meal-from-text', auth, analyzeMealFromText);

module.exports = router;