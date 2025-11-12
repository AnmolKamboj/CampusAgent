import { getModel } from '../config/gemini.js';
import { FormData } from '../types.js';

export class EmailService {
  private model;

  constructor() {
    this.model = getModel();
  }

  // Generate email draft for form submission
  async generateEmailDraft(formData: FormData): Promise<string> {
    const prompt = this.buildEmailPrompt(formData);

    try {
      const result = await this.model.generateContent(prompt);
      const emailDraft = result.response.text();
      return emailDraft;
    } catch (error) {
      console.error('Error generating email:', error);
      return this.generateFallbackEmail(formData);
    }
  }

  // Build prompt for email generation
  private buildEmailPrompt(formData: FormData): string {
    return `Generate a professional email for a university student submitting a Change of Major form. 

Student Information:
- Name: ${formData.studentName}
- Student ID: ${formData.studentId}
- Current Major: ${formData.currentMajor}
- Desired Major: ${formData.desiredMajor}
- Advisor: ${formData.advisorName}
- Department: ${formData.department}
- Reason: ${formData.reason}

Write a formal, polite email that:
1. Has an appropriate subject line
2. Introduces the student and their request
3. Mentions the attached Change of Major form
4. Briefly states the reason for the change
5. Requests approval and next steps
6. Has a professional closing

Format the email as plain text with proper spacing.`;
  }

  // Fallback email template if AI generation fails
  private generateFallbackEmail(formData: FormData): string {
    return `Subject: Change of Major Request - ${formData.studentName} (${formData.studentId})

Dear Academic Advisor,

I am writing to formally request a change of major from ${formData.currentMajor || '[Current Major]'} to ${formData.desiredMajor || '[Desired Major]'}. Please find the completed Change of Major form attached to this email.

${formData.reason ? `My reason for this change: ${formData.reason}` : ''}

I have discussed this decision with my advisor, ${formData.advisorName || '[Advisor Name]'}, and have carefully considered the implications of this change. I am committed to succeeding in my new major and completing all necessary requirements.

Could you please review my request and let me know the next steps in the process? I am happy to provide any additional information or documentation that may be required.

Thank you for your time and consideration.

Best regards,
${formData.studentName || '[Your Name]'}
Student ID: ${formData.studentId || '[Your ID]'}
Email: ${formData.email || '[Your Email]'}
${formData.phone ? `Phone: ${formData.phone}` : ''}`;
  }
}

export const emailService = new EmailService();

