const express = require('express');
const router = express.Router();
const multer = require('multer');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Configure multer for audio file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Transcribe audio to text
router.post('/transcribe', upload.single('audio'), async (req, res) => {
  try {
    console.log('🎤 Voice transcription request received');
    
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    console.log('📊 Audio size:', req.file.size);
    console.log('📊 MIME type:', req.file.mimetype);

    // Convert audio buffer to base64
    const audioBase64 = req.file.buffer.toString('base64');

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: req.file.mimetype,
          data: audioBase64
        }
      },
      { text: "Transcribe this audio to text. Only return the transcribed text, nothing else." }
    ]);

    const response = await result.response;
    const transcript = response.text().trim();

    console.log('✅ Transcription successful:', transcript);

    res.json({ transcript });
  } catch (error) {
    console.error('❌ Voice transcription error:', error);
    res.status(500).json({ 
      error: 'Failed to transcribe audio',
      details: error.message 
    });
  }
});

module.exports = router;

