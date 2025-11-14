import express from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { formTemplateService } from '../services/formTemplateService.js';
import { FormTemplate } from '../types.js';
import path from 'path';
import fs from 'fs/promises';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (_req, _file, cb) => {
    const uploadDir = 'uploads';
    try {
      await fs.mkdir(uploadDir, { recursive: true });
    } catch (error) {
      console.error('Error creating upload directory:', error);
    }
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueName = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Get all form templates
router.get('/forms', (_req, res) => {
  try {
    const templates = formTemplateService.getTemplates();
    res.json({ templates });
  } catch (error) {
    console.error('Error getting templates:', error);
    res.status(500).json({ error: 'Failed to get templates' });
  }
});

// Get active form templates
router.get('/forms/active', (_req, res) => {
  try {
    const templates = formTemplateService.getActiveTemplates();
    res.json({ templates });
  } catch (error) {
    console.error('Error getting active templates:', error);
    res.status(500).json({ error: 'Failed to get active templates' });
  }
});

// Get single form template
router.get('/forms/:id', (req, res) => {
  try {
    const { id } = req.params;
    const template = formTemplateService.getTemplate(id);
    
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    return res.json({ template });
  } catch (error) {
    console.error('Error getting template:', error);
    return res.status(500).json({ error: 'Failed to get template' });
  }
});

// Upload new form template
router.post('/forms/upload', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Form name is required' });
    }

    // Create template object
    const template: FormTemplate = {
      id: uuidv4(),
      name,
      description: description || '',
      fileName: req.file.originalname,
      filePath: req.file.path,
      uploadedAt: new Date(),
      isActive: true,
      fields: [], // Would be populated by PDF analysis service
      requiredFields: [],
      optionalFields: [],
    };

    formTemplateService.addTemplate(template);

    return res.json({
      message: 'Template uploaded successfully',
      template,
    });
  } catch (error) {
    console.error('Error uploading template:', error);
    return res.status(500).json({ error: 'Failed to upload template' });
  }
});

// Update form template
router.patch('/forms/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const template = formTemplateService.updateTemplate(id, updates);

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    return res.json({ template });
  } catch (error) {
    console.error('Error updating template:', error);
    return res.status(500).json({ error: 'Failed to update template' });
  }
});

// Delete form template
router.delete('/forms/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const template = formTemplateService.getTemplate(id);

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    // Delete the file
    try {
      await fs.unlink(template.filePath);
    } catch (error) {
      console.warn('Failed to delete file:', error);
    }

    // Delete from service
    formTemplateService.deleteTemplate(id);

    return res.json({ message: 'Template deleted successfully' });
  } catch (error) {
    console.error('Error deleting template:', error);
    return res.status(500).json({ error: 'Failed to delete template' });
  }
});

// Toggle form active status
router.patch('/forms/:id/toggle', (req, res) => {
  try {
    const { id } = req.params;
    const template = formTemplateService.toggleActive(id);

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    return res.json({ template });
  } catch (error) {
    console.error('Error toggling template:', error);
    return res.status(500).json({ error: 'Failed to toggle template' });
  }
});

export default router;
