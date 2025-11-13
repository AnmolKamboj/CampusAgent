import express from 'express';
import { agentService } from '../services/agentService.js';
import { ChatRequest, FormType } from '../types.js';
import { formConfigService } from '../services/formConfigService.js';
import { formTemplateService } from '../services/formTemplateService.js';

const router = express.Router();

// Get available forms (both hardcoded and uploaded templates)
router.get('/forms', (_req, res) => {
  try {
    // Get hardcoded forms
    const hardcodedForms = formConfigService.getAllConfigs();
    
    // Get active uploaded templates
    const templates = formTemplateService.getActiveTemplates();
    
    // Combine both types of forms
    const allForms = [
      ...hardcodedForms.map(form => ({
        ...form,
        isTemplate: false,
      })),
      ...templates.map(template => ({
        type: template.id, // Use template ID as type identifier
        name: template.name,
        description: template.description || '',
        requiredFields: template.requiredFields,
        optionalFields: template.optionalFields,
        isTemplate: true,
        templateId: template.id,
      })),
    ];
    
    res.json({ forms: allForms });
  } catch (error) {
    console.error('Error getting forms:', error);
    res.status(500).json({ error: 'Failed to get forms' });
  }
});

// Start new chat session (supports both FormType and template ID)
router.post('/start', async (req, res) => {
  try {
    const { formType } = req.body;
    // Check if it's a template ID (UUID format) or FormType enum
    let formTypeToUse: FormType | string | undefined;
    
    if (formType) {
      // Check if it's a UUID (template ID)
      if (typeof formType === 'string' && formType.length === 36 && formType.includes('-')) {
        formTypeToUse = formType;
      } else {
        // Try to parse as FormType enum
        formTypeToUse = FormType[formType as unknown as keyof typeof FormType] || formType;
      }
    }
    
    const welcomeMessage = await agentService.generateWelcome(formTypeToUse);
    res.json({ message: welcomeMessage, formType: formTypeToUse });
  } catch (error) {
    console.error('Error starting chat:', error);
    res.status(500).json({ error: 'Failed to start chat session' });
  }
});

// Process chat message
router.post('/', async (req, res) => {
  try {
    const { sessionId, message, formData, formType, useAutoFill }: ChatRequest = req.body;

    if (!sessionId || !message) {
      return res.status(400).json({ error: 'sessionId and message are required' });
    }

    const formTypeEnum = formType ? (FormType[formType as unknown as keyof typeof FormType] || undefined) : undefined;
    const response = await agentService.processMessage(
      sessionId,
      message,
      formData || {},
      formTypeEnum,
      useAutoFill
    );

    return res.json(response);
  } catch (error) {
    console.error('Error processing message:', error);
    return res.status(500).json({ error: 'Failed to process message' });
  }
});

export default router;
