import { getModel } from '../config/ai.js';
import { PdfAnalysisResult, FormField } from '../types.js';
import fs from 'fs/promises';

export class PdfAnalysisService {
  private model = getModel();

  /**
   * Analyze PDF to extract form fields and structure
   */
  async analyzePdf(pdfPath: string): Promise<PdfAnalysisResult> {
    // Step 1: Extract text from PDF
    const pdfBuffer = await fs.readFile(pdfPath);
    // pdf-parse is a CommonJS module, use dynamic import
    const pdfParseModule = await import('pdf-parse');
    // Handle CommonJS default export - it might be in default or the module itself
    const pdfParseFn = (pdfParseModule as any).default || pdfParseModule;
    // Call the function - it might be a function or have a default property that's a function
    const pdfData = typeof pdfParseFn === 'function' 
      ? await pdfParseFn(pdfBuffer)
      : await (pdfParseFn as any).default(pdfBuffer);
    const pdfText = pdfData.text;

    // Step 2: Use AI to analyze the PDF and extract form fields
    const analysisPrompt = this.buildAnalysisPrompt(pdfText);
    const aiResponse = await this.model.generateContent(analysisPrompt);
    const analysisText = aiResponse.response.text();

    // Step 3: Parse AI response (JSON format)
    const analysis = this.parseAnalysisResponse(analysisText);

    // Step 4: Try to detect PDF form fields (if fillable PDF)
    const pdfFields = await this.detectPdfFormFields(pdfPath);
    
    // Step 5: Merge AI analysis with detected PDF fields
    return this.mergeAnalysis(analysis, pdfFields);
  }

  private buildAnalysisPrompt(pdfText: string): string {
    // Limit text to avoid token limits (first 5000 chars should be enough)
    const limitedText = pdfText.substring(0, 5000);
    
    return `You are analyzing a PDF form document. Extract all form fields and questions.

PDF Text Content:
${limitedText}

Analyze this form and return a JSON object with this structure:
{
  "formType": "short-name-like-change-of-major",
  "description": "brief description of what this form is for",
  "fields": [
    {
      "name": "studentName",
      "label": "Student Name",
      "type": "text",
      "isRequired": true,
      "question": "What is your full name?"
    },
    {
      "name": "studentId",
      "label": "Student ID",
      "type": "text",
      "isRequired": true,
      "question": "What is your student ID or Z-number?"
    }
  ],
  "requiredFields": ["studentName", "studentId"],
  "optionalFields": ["phone"]
}

Rules:
- Generate natural, conversational questions for each field
- Determine if fields are required based on context (asterisks, "required", etc.)
- Infer field types: text, email, phone, date, number, textarea, checkbox, select
- Use camelCase for field names
- Return ONLY valid JSON, no markdown formatting
- If you see fields like "Name", "Email", "Phone", "Date", extract them
- Look for patterns like "Student Name:", "Email Address:", etc.`;
  }

  private parseAnalysisResponse(response: string): any {
    // Extract JSON from response (handle markdown code blocks)
    let jsonStr = response;
    
    // Try to extract from markdown code block
    const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/) || 
                      response.match(/```\s*([\s\S]*?)\s*```/);
    
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    } else {
      // Try to find JSON object directly
      const objectMatch = response.match(/\{[\s\S]*\}/);
      if (objectMatch) {
        jsonStr = objectMatch[0];
      }
    }
    
    try {
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      console.error('Response was:', response);
      // Return a default structure if parsing fails
      return {
        formType: 'custom-form',
        description: 'Custom form uploaded by admin',
        fields: [],
        requiredFields: [],
        optionalFields: [],
      };
    }
  }

  private async detectPdfFormFields(pdfPath: string): Promise<Map<string, string>> {
    // Use pdf-lib to detect fillable form fields
    try {
      const { PDFDocument } = await import('pdf-lib');
      const pdfBytes = await fs.readFile(pdfPath);
      const pdfDoc = await PDFDocument.load(pdfBytes);
      
      const fields = new Map<string, string>();
      
      // Try to get form fields (if PDF has fillable fields)
      try {
        const form = pdfDoc.getForm();
        const formFields = form.getFields();
        
        formFields.forEach((field) => {
          const fieldName = field.getName();
          // Map PDF field name to our field name (simplified - would need better mapping)
          fields.set(fieldName.toLowerCase().replace(/\s+/g, ''), fieldName);
        });
      } catch (error) {
        // PDF might not have fillable fields, that's okay
        console.log('PDF does not have fillable form fields, will use text overlay');
      }
      
      return fields;
    } catch (error) {
      console.error('Error detecting PDF form fields:', error);
      return new Map();
    }
  }

  private mergeAnalysis(aiAnalysis: any, pdfFields: Map<string, string>): PdfAnalysisResult {
    // Merge AI analysis with detected PDF field names
    const fields: FormField[] = (aiAnalysis.fields || []).map((field: any) => {
      // Try to find matching PDF field
      const fieldKey = field.name.toLowerCase().replace(/\s+/g, '');
      const pdfFieldName = pdfFields.get(fieldKey) || undefined;
      
      return {
        name: field.name || 'unknown',
        label: field.label || field.name,
        type: field.type || 'text',
        isRequired: field.isRequired !== undefined ? field.isRequired : false,
        pdfFieldName,
        question: field.question || `Please provide ${field.label || field.name}`,
        validation: field.validation,
      };
    });

    return {
      fields,
      requiredFields: aiAnalysis.requiredFields || fields.filter(f => f.isRequired).map(f => f.name),
      optionalFields: aiAnalysis.optionalFields || fields.filter(f => !f.isRequired).map(f => f.name),
      formType: aiAnalysis.formType || 'custom-form',
      description: aiAnalysis.description || 'Custom form',
      confidence: 0.85, // Could be calculated based on analysis quality
    };
  }
}

export const pdfAnalysisService = new PdfAnalysisService();

