import express from 'express';
import multer from 'multer';
import { formTemplateService } from '../services/formTemplateService.js';

const router = express.Router();

// Configure multer for file uploads
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

// Get all form templates
router.get('/forms', (_req, res) => {
  try {
    const templates = formTemplateService.getAllTemplates();
    res.json({ templates });
  } catch (error) {
    console.error('Error getting forms:', error);
    res.status(500).json({ error: 'Failed to get forms' });
  }
});

// Get active form templates only
router.get('/forms/active', (_req, res) => {
  try {
    const templates = formTemplateService.getActiveTemplates();
    res.json({ templates });
  } catch (error) {
    console.error('Error getting active forms:', error);
    res.status(500).json({ error: 'Failed to get active forms' });
  }
});

// Get single form template
router.get('/forms/:id', (req, res) => {
  try {
    const template = formTemplateService.getTemplate(req.params.id);
    if (!template) {
      return res.status(404).json({ error: 'Form not found' });
    }
    return res.json({ template });
  } catch (error) {
    console.error('Error getting form:', error);
    return res.status(500).json({ error: 'Failed to get form' });
  }
});

// Upload new form template
router.post('/forms/upload', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Form name is required' });
    }

    const template = await formTemplateService.uploadForm(
      req.file.buffer,
      req.file.originalname,
      name,
      description
    );

    return res.json({ 
      template, 
      message: 'Form uploaded and analyzed successfully',
      fieldsDetected: template.fields.length,
    });
  } catch (error) {
    console.error('Error uploading form:', error);
    return res.status(500).json({ 
      error: 'Failed to upload form', 
      details: (error as Error).message 
    });
  }
});

// Update form template
router.patch('/forms/:id', async (req, res) => {
  try {
    const { name, description, isActive } = req.body;
    const updates: any = {};
    
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (isActive !== undefined) updates.isActive = isActive;

    const updated = await formTemplateService.updateTemplate(req.params.id, updates);
    if (!updated) {
      return res.status(404).json({ error: 'Form not found' });
    }

    return res.json({ template: updated });
  } catch (error) {
    console.error('Error updating form:', error);
    return res.status(500).json({ error: 'Failed to update form' });
  }
});

// Delete form template
router.delete('/forms/:id', async (req, res) => {
  try {
    const deleted = await formTemplateService.deleteTemplate(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Form not found' });
    }
    return res.json({ message: 'Form deleted successfully' });
  } catch (error) {
    console.error('Error deleting form:', error);
    return res.status(500).json({ error: 'Failed to delete form' });
  }
});

// Toggle form active status
router.patch('/forms/:id/toggle', async (req, res) => {
  try {
    const template = formTemplateService.getTemplate(req.params.id);
    if (!template) {
      return res.status(404).json({ error: 'Form not found' });
    }
    
    const updated = await formTemplateService.updateTemplate(req.params.id, {
      isActive: !template.isActive,
    });
    
    return res.json({ template: updated });
  } catch (error) {
    console.error('Error toggling form:', error);
    return res.status(500).json({ error: 'Failed to toggle form' });
  }
});

export default router;

