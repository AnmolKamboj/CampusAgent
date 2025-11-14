import { FormTemplate } from '../types.js';

// In-memory storage for uploaded form templates
// In production, replace with database
const templates: Map<string, FormTemplate> = new Map();

export class FormTemplateService {
  // Get all templates
  getTemplates(): FormTemplate[] {
    return Array.from(templates.values());
  }

  // Get active templates only
  getActiveTemplates(): FormTemplate[] {
    return Array.from(templates.values()).filter(t => t.isActive);
  }

  // Get single template by ID
  getTemplate(id: string): FormTemplate | undefined {
    return templates.get(id);
  }

  // Add new template
  addTemplate(template: FormTemplate): void {
    templates.set(template.id, template);
  }

  // Update template
  updateTemplate(id: string, updates: Partial<FormTemplate>): FormTemplate | undefined {
    const template = templates.get(id);
    if (!template) return undefined;

    const updated = { ...template, ...updates };
    templates.set(id, updated);
    return updated;
  }

  // Delete template
  deleteTemplate(id: string): boolean {
    return templates.delete(id);
  }

  // Toggle active status
  toggleActive(id: string): FormTemplate | undefined {
    const template = templates.get(id);
    if (!template) return undefined;

    template.isActive = !template.isActive;
    templates.set(id, template);
    return template;
  }
}

export const formTemplateService = new FormTemplateService();
