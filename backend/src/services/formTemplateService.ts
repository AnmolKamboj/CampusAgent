import { FormTemplate, PdfAnalysisResult } from '../types.js';
import { pdfAnalysisService } from './pdfAnalysisService.js';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export class FormTemplateService {
  private templates: Map<string, FormTemplate> = new Map();
  private storageDir: string;

  constructor() {
    // Use storage/forms directory in project root
    this.storageDir = path.join(process.cwd(), 'storage', 'forms');
    this.ensureStorageDir();
    this.loadTemplates();
  }

  private async ensureStorageDir() {
    try {
      await fs.mkdir(this.storageDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create storage directory:', error);
    }
  }

  private async loadTemplates() {
    try {
      // Load templates from JSON metadata files
      const files = await fs.readdir(this.storageDir);
      const jsonFiles = files.filter(f => f.endsWith('.json'));
      
      for (const jsonFile of jsonFiles) {
        try {
          const metadataPath = path.join(this.storageDir, jsonFile);
          const metadataContent = await fs.readFile(metadataPath, 'utf-8');
          const template: FormTemplate = JSON.parse(metadataContent);
          
          // Convert date strings back to Date objects
          template.uploadedAt = new Date(template.uploadedAt);
          
          // Verify file still exists
          const filePath = path.join(this.storageDir, template.fileName);
          try {
            await fs.access(filePath);
            this.templates.set(template.id, template);
          } catch {
            console.warn(`Template file not found for ${template.id}, skipping`);
          }
        } catch (error) {
          console.error(`Failed to load template from ${jsonFile}:`, error);
        }
      }
    } catch (error) {
      // Directory might not exist yet, that's okay
      console.log('No existing templates found');
    }
  }

  /**
   * Upload and analyze a new PDF form
   */
  async uploadForm(
    fileBuffer: Buffer,
    fileName: string,
    name: string,
    description?: string
  ): Promise<FormTemplate> {
    // Generate unique ID
    const id = uuidv4();
    const fileExtension = path.extname(fileName);
    const storedFileName = `${id}${fileExtension}`;
    const filePath = path.join(this.storageDir, storedFileName);

    // Save file
    await fs.writeFile(filePath, fileBuffer);

    // Analyze PDF with AI
    let analysis: PdfAnalysisResult;
    try {
      analysis = await pdfAnalysisService.analyzePdf(filePath);
    } catch (error) {
      console.error('PDF analysis failed:', error);
      // Create a basic template even if analysis fails
      analysis = {
        fields: [],
        requiredFields: [],
        optionalFields: [],
        formType: 'custom-form',
        description: description || 'Custom form',
        confidence: 0.5,
      };
    }

    // Create template
    const template: FormTemplate = {
      id,
      name,
      description: description || analysis.description,
      fileName: storedFileName,
      filePath,
      uploadedAt: new Date(),
      isActive: true,
      fields: analysis.fields,
      requiredFields: analysis.requiredFields,
      optionalFields: analysis.optionalFields,
    };

    // Store template
    this.templates.set(id, template);
    await this.saveTemplateMetadata(template);

    return template;
  }

  /**
   * Get all templates
   */
  getAllTemplates(): FormTemplate[] {
    return Array.from(this.templates.values());
  }

  /**
   * Get active templates only
   */
  getActiveTemplates(): FormTemplate[] {
    return Array.from(this.templates.values()).filter(t => t.isActive);
  }

  /**
   * Get template by ID
   */
  getTemplate(id: string): FormTemplate | undefined {
    return this.templates.get(id);
  }

  /**
   * Update template
   */
  async updateTemplate(id: string, updates: Partial<FormTemplate>): Promise<FormTemplate | null> {
    const template = this.templates.get(id);
    if (!template) return null;

    const updated = { ...template, ...updates };
    this.templates.set(id, updated);
    await this.saveTemplateMetadata(updated);

    return updated;
  }

  /**
   * Delete template
   */
  async deleteTemplate(id: string): Promise<boolean> {
    const template = this.templates.get(id);
    if (!template) return false;

    // Delete file
    try {
      await fs.unlink(template.filePath);
    } catch (error) {
      console.error('Failed to delete file:', error);
    }

    // Remove from memory
    this.templates.delete(id);
    await this.deleteTemplateMetadata(id);

    return true;
  }

  private async saveTemplateMetadata(template: FormTemplate) {
    // Save metadata to JSON file (or database in production)
    const metadataPath = path.join(this.storageDir, `${template.id}.json`);
    await fs.writeFile(metadataPath, JSON.stringify(template, null, 2));
  }

  private async deleteTemplateMetadata(id: string) {
    const metadataPath = path.join(this.storageDir, `${id}.json`);
    try {
      await fs.unlink(metadataPath);
    } catch (error) {
      // Ignore if file doesn't exist
    }
  }
}

export const formTemplateService = new FormTemplateService();

