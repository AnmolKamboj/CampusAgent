import express from 'express';
import { pdfService } from '../services/pdfService.js';
import { FormData } from '../types.js';

const router = express.Router();

// Generate PDF
router.post('/generate', async (req, res) => {
  try {
    const { formData }: { formData: FormData } = req.body;

    if (!formData) {
      return res.status(400).json({ error: 'formData is required' });
    }

    // Validate required fields
    if (!formData.studentName || !formData.studentId || !formData.currentMajor || !formData.desiredMajor) {
      return res.status(400).json({ 
        error: 'Missing required fields. Please provide studentName, studentId, currentMajor, and desiredMajor.' 
      });
    }

    const pdfBuffer = await pdfService.generateChangeOfMajorPdf(formData);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=change-of-major.pdf');
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

export default router;

