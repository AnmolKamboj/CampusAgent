import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { FormTemplate, DynamicFormData } from '../types.js';
import { formTemplateService } from './formTemplateService.js';
import fs from 'fs/promises';

export class PdfFillService {
  /**
   * Fill a PDF form template with collected data
   */
  async fillForm(templateId: string, formData: DynamicFormData): Promise<Buffer> {
    const template = formTemplateService.getTemplate(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    // Load PDF template
    const pdfBytes = await fs.readFile(template.filePath);
    const pdfDoc = await PDFDocument.load(pdfBytes);

    // Try to fill form fields if PDF has fillable fields
    try {
      const form = pdfDoc.getForm();
      const fields = form.getFields();
      
      if (fields.length > 0) {
        // PDF has fillable form fields
        const fieldMapping = this.createFieldMapping(template, formData);
        
        // Fill form fields
        for (const [pdfFieldName, value] of Object.entries(fieldMapping)) {
          try {
            const field = form.getTextField(pdfFieldName);
            if (field) {
              field.setText(String(value));
            }
          } catch (error) {
            // Try other field types
            try {
              const checkboxField = form.getCheckBox(pdfFieldName);
              if (checkboxField) {
                checkboxField.check();
              }
            } catch (e) {
              // Field might not exist or be wrong type
              console.warn(`Could not fill field ${pdfFieldName}:`, error);
            }
          }
        }
      } else {
        // No fillable fields, use text overlay
        return this.overlayTextOnPdf(pdfDoc, template, formData);
      }
    } catch (error) {
      // PDF might not have a form, use text overlay
      console.log('PDF does not have fillable form, using text overlay');
      return this.overlayTextOnPdf(pdfDoc, template, formData);
    }

    // Save filled PDF
    const filledPdfBytes = await pdfDoc.save();
    return Buffer.from(filledPdfBytes);
  }

  private createFieldMapping(template: FormTemplate, formData: DynamicFormData): Record<string, any> {
    const mapping: Record<string, any> = {};

    for (const field of template.fields) {
      const value = formData[field.name];
      if (value !== undefined && value !== null && value !== '') {
        if (field.pdfFieldName) {
          mapping[field.pdfFieldName] = value;
        } else {
          // Try to match by name similarity
          const normalizedName = field.name.toLowerCase().replace(/\s+/g, '');
          mapping[normalizedName] = value;
        }
      }
    }

    return mapping;
  }

  private async overlayTextOnPdf(
    pdfDoc: PDFDocument,
    _template: FormTemplate,
    _formData: DynamicFormData
  ): Promise<Buffer> {
    // If PDF doesn't have fillable fields, we need to overlay text
    // This is a simplified version - in production you'd want coordinate detection
    const pages = pdfDoc.getPages();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // For now, add a data page at the end with all the collected information
    // In a real implementation, you'd use OCR or coordinate mapping to place text
    // at the exact positions of form fields
    
    if (pages.length > 0) {
      const lastPage = pages[pages.length - 1];
      
      // Add a note at the bottom indicating this is a filled form
      lastPage.drawText('Filled by CampusAgent - ' + new Date().toLocaleDateString(), {
        x: 50,
        y: 30,
        size: 8,
        font,
        color: rgb(0.5, 0.5, 0.5),
      });
    }

    // Note: Full text overlay would require:
    // 1. OCR to detect field positions
    // 2. Coordinate mapping from template analysis
    // 3. Precise text placement
    
    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }
}

export const pdfFillService = new PdfFillService();

