import express from 'express';
import multer from 'multer';
import { agentService } from '../services/agentService.js';
import { pdfAnalysisService } from '../services/pdfAnalysisService.js';
import { ChatRequest } from '../types.js';

const router = express.Router();

// Configure multer for in-memory file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
});

// Start new chat session
router.post('/start', async (_req, res) => {
  try {
    const welcomeMessage = await agentService.generateWelcome();
    res.json({ message: welcomeMessage });
  } catch (error) {
    console.error('Error starting chat:', error);
    res.status(500).json({ error: 'Failed to start chat session' });
  }
});

// Upload and analyze PDF
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { sessionId } = req.body;
    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId is required' });
    }

    // Analyze the PDF
    const analysis = await pdfAnalysisService.analyzePdf(req.file.buffer);

    if (!analysis.success) {
      return res.status(400).json({ 
        error: analysis.message || 'Failed to analyze PDF' 
      });
    }

    // Store the PDF and analysis in the session
    await agentService.storePdfInSession(sessionId, req.file.buffer, analysis);

    res.json({
      success: true,
      message: `Great! I analyzed your PDF and found ${analysis.fields.length} fields to fill. Let's get started!`,
      analysis,
    });
  } catch (error) {
    console.error('Error uploading PDF:', error);
    res.status(500).json({ error: 'Failed to upload and analyze PDF' });
  }
});

// Process chat message
router.post('/', async (req, res) => {
  try {
    const { sessionId, message, formData }: ChatRequest = req.body;

    if (!sessionId || !message) {
      return res.status(400).json({ error: 'sessionId and message are required' });
    }

    const response = await agentService.processMessage(
      sessionId,
      message,
      formData || {}
    );

    return res.json(response);
  } catch (error) {
    console.error('Error processing message:', error);
    return res.status(500).json({ error: 'Failed to process message' });
  }
});

export default router;
