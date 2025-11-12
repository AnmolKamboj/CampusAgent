import { getModel } from '../config/ai.js';
import { FormData, FormType, ChangeOfMajorData, GraduationApplicationData, AddDropCourseData } from '../types.js';
import { formConfigService } from './formConfigService.js';

export class EmailService {
  private model;

  constructor() {
    this.model = getModel();
  }

  // Generate email draft for form submission
  async generateEmailDraft(formType: FormType, formData: FormData): Promise<string> {
    const prompt = this.buildEmailPrompt(formType, formData);

    try {
      const result = await this.model.generateContent(prompt);
      const emailDraft = result.response.text();
      return emailDraft;
    } catch (error) {
      console.error('Error generating email:', error);
      return this.generateFallbackEmail(formType, formData);
    }
  }

  // Build prompt for email generation
  private buildEmailPrompt(formType: FormType, formData: FormData): string {
    const config = formConfigService.getConfig(formType);
    const formName = config?.name || 'form';
    
    let infoSection = '';
    if (formType === FormType.CHANGE_OF_MAJOR) {
      const data = formData as ChangeOfMajorData;
      infoSection = `- Name: ${data.studentName}
- Student ID: ${data.studentId}
- Current Major: ${data.currentMajor}
- Desired Major: ${data.desiredMajor}
- Advisor: ${data.advisorName}
- Department: ${data.department}
- Reason: ${data.reason}`;
    } else if (formType === FormType.GRADUATION_APPLICATION) {
      const data = formData as GraduationApplicationData;
      infoSection = `- Name: ${data.studentName}
- Student ID: ${data.studentId}
- Expected Graduation Date: ${data.expectedGraduationDate}
- Degree Type: ${data.degreeType}
- Major: ${data.major}
- Minor: ${data.minor || 'N/A'}
- Honors Program: ${data.honorsProgram ? 'Yes' : 'No'}
- Advisor: ${data.advisorName}
- Department: ${data.department}`;
    } else if (formType === FormType.ADD_DROP_COURSE) {
      const data = formData as AddDropCourseData;
      infoSection = `- Name: ${data.studentName}
- Student ID: ${data.studentId}
- Semester: ${data.semester}
- Year: ${data.year}
- Courses to Add: ${data.coursesToAdd?.map(c => c.courseCode).join(', ') || 'None'}
- Courses to Drop: ${data.coursesToDrop?.map(c => c.courseCode).join(', ') || 'None'}
- Reason: ${data.reason || 'N/A'}`;
    }
    
    return `Generate a professional email for a university student submitting a ${formName}. 

Student Information:
${infoSection}

Write a formal, polite email that:
1. Has an appropriate subject line
2. Introduces the student and their request
3. Mentions the attached ${formName}
4. Provides relevant details from the form
5. Requests approval and next steps
6. Has a professional closing

Format the email as plain text with proper spacing.`;
  }

  // Fallback email template if AI generation fails
  private generateFallbackEmail(formType: FormType, formData: FormData): string {
    if (formType === FormType.CHANGE_OF_MAJOR) {
      const data = formData as ChangeOfMajorData;
      return `Subject: Change of Major Request - ${data.studentName} (${data.studentId})

Dear Academic Advisor,

I am writing to formally request a change of major from ${data.currentMajor || '[Current Major]'} to ${data.desiredMajor || '[Desired Major]'}. Please find the completed Change of Major form attached to this email.

${data.reason ? `My reason for this change: ${data.reason}` : ''}

I have discussed this decision with my advisor, ${data.advisorName || '[Advisor Name]'}, and have carefully considered the implications of this change.

Could you please review my request and let me know the next steps in the process?

Thank you for your time and consideration.

Best regards,
${data.studentName || '[Your Name]'}
Student ID: ${data.studentId || '[Your ID]'}
Email: ${data.email || '[Your Email]'}`;
    } else if (formType === FormType.GRADUATION_APPLICATION) {
      const data = formData as GraduationApplicationData;
      return `Subject: Graduation Application - ${data.studentName} (${data.studentId})

Dear Registrar's Office,

I am writing to formally submit my graduation application. Please find the completed Graduation Application form attached to this email.

Expected Graduation Date: ${data.expectedGraduationDate}
Degree Type: ${data.degreeType}
Major: ${data.major}
${data.minor ? `Minor: ${data.minor}` : ''}

I have reviewed all degree requirements and believe I am on track to complete them by the expected graduation date.

Could you please confirm receipt of my application and let me know if any additional information is required?

Thank you for your assistance.

Best regards,
${data.studentName || '[Your Name]'}
Student ID: ${data.studentId || '[Your ID]'}
Email: ${data.email || '[Your Email]'}`;
    } else {
      const data = formData as AddDropCourseData;
      return `Subject: Add/Drop Course Request - ${data.studentName} (${data.studentId})

Dear Registrar's Office,

I am writing to request course changes for ${data.semester} ${data.year}. Please find the completed Add/Drop Course form attached to this email.

${data.coursesToAdd && data.coursesToAdd.length > 0 ? `Courses to Add: ${data.coursesToAdd.map(c => c.courseCode).join(', ')}` : ''}
${data.coursesToDrop && data.coursesToDrop.length > 0 ? `Courses to Drop: ${data.coursesToDrop.map(c => c.courseCode).join(', ')}` : ''}
${data.reason ? `Reason: ${data.reason}` : ''}

Could you please process this request and confirm the changes?

Thank you for your assistance.

Best regards,
${data.studentName || '[Your Name]'}
Student ID: ${data.studentId || '[Your ID]'}
Email: ${data.email || '[Your Email]'}`;
    }
  }
}

export const emailService = new EmailService();
