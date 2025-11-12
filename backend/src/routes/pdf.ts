import express from 'express';
import { pdfService } from '../services/pdfService.js';
import { FormData, FormType, DynamicFormData } from '../types.js';
import { formConfigService } from '../services/formConfigService.js';
import { formTemplateService } from '../services/formTemplateService.js';

const router = express.Router();

// Generate PDF
router.post('/generate', async (req, res) => {
  try {
    const { formData, formType }: { formData: FormData | DynamicFormData; formType: FormType | string } = req.body;

    if (!formData) {
      return res.status(400).json({ error: 'formData is required' });
    }

    if (!formType) {
      return res.status(400).json({ error: 'formType is required' });
    }

    // Check if this is a template ID (UUID format)
    const isTemplate = typeof formType === 'string' && formType.length === 36 && formType.includes('-');
    
    if (isTemplate) {
      // Validate template-based form
      const template = formTemplateService.getTemplate(formType);
      if (!template) {
        return res.status(400).json({ error: 'Template not found' });
      }

      const missingFields = template.requiredFields.filter(field => {
        const value = (formData as DynamicFormData)[field];
        return !value || (typeof value === 'string' && value.trim() === '');
      });
      
      if (missingFields.length > 0) {
        return res.status(400).json({ 
          error: `Missing required fields: ${missingFields.join(', ')}` 
        });
      }
    } else {
      // Validate hardcoded form
      const formTypeEnum = formType as FormType;
      const config = formConfigService.getConfig(formTypeEnum);
      if (!config) {
        return res.status(400).json({ error: 'Invalid form type' });
      }

      const missingFields = config.requiredFields.filter(field => !(formData as FormData)[field as keyof FormData]);
      if (missingFields.length > 0) {
        return res.status(400).json({ 
          error: `Missing required fields: ${missingFields.join(', ')}` 
        });
      }
    }

    const pdfBuffer = await pdfService.generatePdf(formType, formData);

    const filename = `${formType}-${Date.now()}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    return res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating PDF:', error);
    return res.status(500).json({ error: 'Failed to generate PDF', details: (error as Error).message });
  }
});

export default router;
