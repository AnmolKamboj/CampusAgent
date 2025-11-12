import express from 'express';
import { agentService } from '../services/agentService.js';
import { ChatRequest } from '../types.js';

const router = express.Router();

// Start new chat session
router.post('/start', async (req, res) => {
  try {
    const welcomeMessage = await agentService.generateWelcome();
    res.json({ message: welcomeMessage });
  } catch (error) {
    console.error('Error starting chat:', error);
    res.status(500).json({ error: 'Failed to start chat session' });
  }
});

// Process chat message
router.post('/', async (req, res) => {
  try {
    const { sessionId, message, formData }: ChatRequest = req.body;

    if (!sessionId || !message) {
      return res.status(400).json({ error: 'sessionId and message are required' });
    }

    const response = await agentService.processMessage(sessionId, message, formData || {});

    res.json(response);
  } catch (error) {
    console.error('Error processing message:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

export default router;

