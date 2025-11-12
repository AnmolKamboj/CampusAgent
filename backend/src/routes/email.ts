import express from 'express';
import { emailService } from '../services/emailService.js';
import { FormData, FormType } from '../types.js';
import { formConfigService } from '../services/formConfigService.js';

const router = express.Router();

// Generate email draft
router.post('/generate', async (req, res) => {
  try {
    const { formData, formType }: { formData: FormData; formType: FormType } = req.body;

    if (!formData) {
      return res.status(400).json({ error: 'formData is required' });
    }

    if (!formType) {
      return res.status(400).json({ error: 'formType is required' });
    }

    // Validate required fields
    const config = formConfigService.getConfig(formType);
    if (!config) {
      return res.status(400).json({ error: 'Invalid form type' });
    }

    const missingFields = config.requiredFields.filter(field => !formData[field as keyof FormData]);
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        error: `Missing required fields: ${missingFields.join(', ')}` 
      });
    }

    const emailDraft = await emailService.generateEmailDraft(formType, formData);

    return res.json({ emailDraft });
  } catch (error) {
    console.error('Error generating email:', error);
    return res.status(500).json({ error: 'Failed to generate email' });
  }
});

export default router;
