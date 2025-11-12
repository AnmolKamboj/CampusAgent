import express from 'express';
import { emailService } from '../services/emailService.js';
import { FormData } from '../types.js';

const router = express.Router();

// Generate email draft
router.post('/generate', async (req, res) => {
  try {
    const { formData }: { formData: FormData } = req.body;

    if (!formData) {
      return res.status(400).json({ error: 'formData is required' });
    }

    // Validate required fields
    if (!formData.studentName || !formData.desiredMajor) {
      return res.status(400).json({ 
        error: 'Missing required fields. Please provide at least studentName and desiredMajor.' 
      });
    }

    const emailDraft = await emailService.generateEmailDraft(formData);

    res.json({ emailDraft });
  } catch (error) {
    console.error('Error generating email:', error);
    res.status(500).json({ error: 'Failed to generate email' });
  }
});

export default router;

