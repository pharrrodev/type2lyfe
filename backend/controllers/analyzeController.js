const geminiService = require('../services/geminiService');

exports.analyzeGlucoseFromImage = async (req, res) => {
  const { image, mimeType } = req.body;
  console.log('📸 Glucose image analysis request received');
  console.log('📊 Image size:', image ? image.length : 'No image');
  console.log('📊 MIME type:', mimeType);

  try {
    const result = await geminiService.parseGlucoseReadingFromImage(image, mimeType);
    console.log('✅ Glucose analysis successful:', result);
    res.json(result);
  } catch (error) {
    console.error('❌ Glucose analysis error:', error.message);
    console.error('❌ Full error:', error);
    res.status(500).json({ error: 'Could not parse reading from image.', details: error.message });
  }
};

exports.analyzeMealFromImage = async (req, res) => {
  const { image, mimeType } = req.body;
  console.log('🍽️ Meal image analysis request received');
  console.log('📊 Image size:', image ? image.length : 'No image');
  console.log('📊 MIME type:', mimeType);

  try {
    const result = await geminiService.analyzeMealPhoto(image, mimeType);
    console.log('✅ Meal analysis successful:', result);
    res.json(result);
  } catch (error) {
    console.error('❌ Meal analysis error:', error.message);
    console.error('❌ Full error:', error);
    res.status(500).json({ error: 'Could not parse meal from image.', details: error.message });
  }
};

exports.analyzeGlucoseFromText = async (req, res) => {
  const { description } = req.body;
  try {
    const result = await geminiService.parseGlucoseReadingFromText(description);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Could not parse reading from text.' });
  }
};

exports.analyzeWeightFromImage = async (req, res) => {
  const { image, mimeType } = req.body;
  try {
    const result = await geminiService.parseWeightFromImage(image, mimeType);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Could not parse weight from image.' });
  }
};

exports.analyzeBpFromImage = async (req, res) => {
  const { image, mimeType } = req.body;
  try {
    const result = await geminiService.parseBloodPressureFromImage(image, mimeType);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Could not parse blood pressure from image.' });
  }
};

exports.analyzeWeightFromText = async (req, res) => {
  const { description } = req.body;
  try {
    const result = await geminiService.parseWeightFromText(description);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Could not parse weight from text.' });
  }
};

exports.analyzeBpFromText = async (req, res) => {
  const { description } = req.body;
  try {
    const result = await geminiService.parseBloodPressureFromText(description);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Could not parse blood pressure from text.' });
  }
};

exports.analyzeMealFromText = async (req, res) => {
  const { description } = req.body;
  console.log('🍽️ Meal text analysis request received');
  console.log('📊 Description:', description);

  try {
    const result = await geminiService.parseMealFromText(description);
    console.log('✅ Meal text analysis successful:', result);
    res.json(result);
  } catch (error) {
    console.error('❌ Meal text analysis error:', error.message);
    console.error('❌ Full error:', error);
    res.status(500).json({ error: 'Could not parse meal from text.', details: error.message });
  }
};