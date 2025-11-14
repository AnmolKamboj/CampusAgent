import { PDFDocument } from 'pdf-lib';
import { formTemplateService } from './formTemplateService.js';
import { DynamicFormData } from '../types.js';
import fs from 'fs/promises';

export class PdfFillService {
  // Fill a template-based PDF form
  async fillForm(templateId: string, formData: DynamicFormData): Promise<Buffer> {
    const template = formTemplateService.getTemplate(templateId);
    
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    // Load the PDF template
    const pdfBytes = await fs.readFile(template.filePath);
    const pdfDoc = await PDFDocument.load(pdfBytes);

    // Get the form
    const form = pdfDoc.getForm();
    const fields = form.getFields();

    // Try to fill form fields
    for (const field of fields) {
      const fieldName = field.getName();
      const value = formData[fieldName];

      if (value !== undefined && value !== null) {
        try {
          // Try to fill the field based on its type
          const fieldType = field.constructor.name;
          
          if (fieldType.includes('Text')) {
            (field as any).setText(String(value));
          } else if (fieldType.includes('CheckBox')) {
            if (value === true || value === 'true' || value === 'yes') {
              (field as any).check();
            }
          } else if (fieldType.includes('Dropdown') || fieldType.includes('Option')) {
            (field as any).select(String(value));
          }
        } catch (error) {
          console.warn(`Failed to fill field ${fieldName}:`, error);
        }
      }
    }

    // Save and return
    const filledPdfBytes = await pdfDoc.save();
    return Buffer.from(filledPdfBytes);
  }
}

export const pdfFillService = new PdfFillService();
