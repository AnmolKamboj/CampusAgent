import { PDFDocument } from 'pdf-lib';
import { PdfAnalysisResult, FormField } from '../types.js';

export class PdfAnalysisService {
  /**
   * Analyze an uploaded PDF to extract fillable fields
   */
  async analyzePdf(pdfBuffer: Buffer): Promise<PdfAnalysisResult> {
    try {
      const pdfDoc = await PDFDocument.load(pdfBuffer);
      const form = pdfDoc.getForm();
      const fields = form.getFields();

      const extractedFields: FormField[] = [];
      const fieldNames: string[] = [];

      for (const field of fields) {
        const fieldName = field.getName();
        const fieldType = field.constructor.name;

        // Map PDF field types to our form field types
        let type: 'text' | 'email' | 'tel' | 'date' | 'select' | 'textarea' | 'checkbox' = 'text';
        
        if (fieldType.includes('Text')) {
          // Try to infer more specific type from field name
          const lowerName = fieldName.toLowerCase();
          if (lowerName.includes('email')) {
            type = 'email';
          } else if (lowerName.includes('phone') || lowerName.includes('tel')) {
            type = 'tel';
          } else if (lowerName.includes('date')) {
            type = 'date';
          } else if (lowerName.includes('address') || lowerName.includes('reason') || lowerName.includes('description')) {
            type = 'textarea';
          } else {
            type = 'text';
          }
        } else if (fieldType.includes('CheckBox')) {
          type = 'checkbox';
        } else if (fieldType.includes('Dropdown') || fieldType.includes('Option')) {
          type = 'select';
        }

        // Generate a user-friendly question from field name
        const question = this.generateQuestionFromFieldName(fieldName);

        extractedFields.push({
          name: fieldName,
          type,
          required: true, // Assume all fields are required by default
          question,
        });

        fieldNames.push(fieldName);
      }

      // If no form fields found, return empty result
      if (extractedFields.length === 0) {
        return {
          formTitle: 'Uploaded Form',
          fields: [],
          requiredFields: [],
          success: false,
          message: 'No fillable fields found in this PDF. The PDF might not have form fields.',
        };
      }

      return {
        formTitle: 'Uploaded Form',
        fields: extractedFields,
        requiredFields: fieldNames,
        success: true,
        message: `Found ${extractedFields.length} fillable fields in the PDF.`,
      };
    } catch (error) {
      console.error('Error analyzing PDF:', error);
      return {
        formTitle: 'Uploaded Form',
        fields: [],
        requiredFields: [],
        success: false,
        message: 'Failed to analyze PDF. Please ensure it\'s a valid PDF with form fields.',
      };
    }
  }

  /**
   * Generate a user-friendly question from a field name
   * Examples:
   *   "studentName" → "What is your student name?"
   *   "date_of_birth" → "What is your date of birth?"
   *   "currentMajor" → "What is your current major?"
   */
  private generateQuestionFromFieldName(fieldName: string): string {
    // Convert camelCase or snake_case to words
    let words = fieldName
      .replace(/([A-Z])/g, ' $1') // camelCase
      .replace(/_/g, ' ') // snake_case
      .toLowerCase()
      .trim()
      .split(/\s+/);

    // Capitalize first letter
    words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);

    const phrase = words.join(' ');

    // Common patterns
    if (fieldName.toLowerCase().includes('name')) {
      return `What is your ${phrase}?`;
    } else if (fieldName.toLowerCase().includes('id') || fieldName.toLowerCase().includes('number')) {
      return `What is your ${phrase}?`;
    } else if (fieldName.toLowerCase().includes('date')) {
      return `What is the ${phrase}?`;
    } else if (fieldName.toLowerCase().includes('email')) {
      return `What is your ${phrase}?`;
    } else if (fieldName.toLowerCase().includes('phone') || fieldName.toLowerCase().includes('tel')) {
      return `What is your ${phrase}?`;
    } else if (fieldName.toLowerCase().includes('address')) {
      return `What is your ${phrase}?`;
    } else if (fieldName.toLowerCase().includes('reason') || fieldName.toLowerCase().includes('description')) {
      return `Please provide ${phrase}:`;
    } else {
      return `What is your ${phrase}?`;
    }
  }

  /**
   * Fill a PDF with provided form data
   */
  async fillPdf(pdfBuffer: Buffer, formData: Record<string, any>): Promise<Buffer> {
    try {
      const pdfDoc = await PDFDocument.load(pdfBuffer);
      const form = pdfDoc.getForm();
      const fields = form.getFields();

      // Fill each field
      for (const field of fields) {
        const fieldName = field.getName();
        const value = formData[fieldName];

        if (value !== undefined && value !== null && value !== '') {
          try {
            const fieldType = field.constructor.name;
            
            if (fieldType.includes('Text')) {
              (field as any).setText(String(value));
            } else if (fieldType.includes('CheckBox')) {
              if (value === true || value === 'true' || value === 'yes') {
                (field as any).check();
              } else {
                (field as any).uncheck();
              }
            } else if (fieldType.includes('Dropdown') || fieldType.includes('Option')) {
              (field as any).select(String(value));
            }
          } catch (error) {
            console.warn(`Failed to fill field ${fieldName}:`, error);
          }
        }
      }

      // Flatten the form to make it non-editable
      form.flatten();

      // Save and return
      const filledPdfBytes = await pdfDoc.save();
      return Buffer.from(filledPdfBytes);
    } catch (error) {
      console.error('Error filling PDF:', error);
      throw new Error('Failed to fill PDF');
    }
  }
}

export const pdfAnalysisService = new PdfAnalysisService();
