import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { FormData, FormType, ChangeOfMajorData, GraduationApplicationData, AddDropCourseData, DynamicFormData } from '../types.js';
import { pdfFillService } from './pdfFillService.js';

export class PdfService {
  // Generate PDF based on form type (supports both hardcoded and template-based forms)
  async generatePdf(formType: FormType | string, formData: FormData | DynamicFormData): Promise<Buffer> {
    // Check if this is a template ID (UUID format)
    const isTemplate = typeof formType === 'string' && formType.length === 36 && formType.includes('-');
    
    if (isTemplate) {
      // Use template-based PDF filling
      return pdfFillService.fillForm(formType, formData as DynamicFormData);
    }
    
    // Use hardcoded form generation
    const formTypeEnum = formType as FormType;
    switch (formTypeEnum) {
      case FormType.CHANGE_OF_MAJOR:
        return this.generateChangeOfMajorPdf(formData as ChangeOfMajorData);
      case FormType.GRADUATION_APPLICATION:
        return this.generateGraduationApplicationPdf(formData as GraduationApplicationData);
      case FormType.ADD_DROP_COURSE:
        return this.generateAddDropCoursePdf(formData as AddDropCourseData);
      default:
        throw new Error(`Unsupported form type: ${formType}`);
    }
  }

  // Generate a Change of Major PDF
  async generateChangeOfMajorPdf(formData: ChangeOfMajorData): Promise<Buffer> {
    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([612, 792]); // Letter size: 8.5" x 11"
    
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    const { width, height } = page.getSize();
    
    let y = height - 50;
    const leftMargin = 50;
    const lineHeight = 20;

    // Title
    page.drawText('CHANGE OF MAJOR REQUEST FORM', {
      x: leftMargin,
      y,
      size: 18,
      font: fontBold,
      color: rgb(0, 0, 0),
    });

    y -= 40;

    // University header (placeholder)
    page.drawText('University Academic Services', {
      x: leftMargin,
      y,
      size: 12,
      font: fontBold,
      color: rgb(0.2, 0.2, 0.2),
    });

    y -= 30;

    // Student Information Section
    page.drawText('STUDENT INFORMATION', {
      x: leftMargin,
      y,
      size: 14,
      font: fontBold,
      color: rgb(0, 0, 0),
    });

    y -= 25;

    // Draw form fields
    this.drawField(page, font, 'Student Name:', formData.studentName || 'N/A', leftMargin, y);
    y -= lineHeight;

    this.drawField(page, font, 'Student ID:', formData.studentId || 'N/A', leftMargin, y);
    y -= lineHeight;

    this.drawField(page, font, 'Email:', formData.email || 'N/A', leftMargin, y);
    y -= lineHeight;

    this.drawField(page, font, 'Phone:', formData.phone || 'N/A', leftMargin, y);
    y -= 35;

    // Major Change Section
    page.drawText('MAJOR CHANGE REQUEST', {
      x: leftMargin,
      y,
      size: 14,
      font: fontBold,
      color: rgb(0, 0, 0),
    });

    y -= 25;

    this.drawField(page, font, 'Current Major:', formData.currentMajor || 'N/A', leftMargin, y);
    y -= lineHeight;

    this.drawField(page, font, 'Desired Major:', formData.desiredMajor || 'N/A', leftMargin, y);
    y -= lineHeight;

    this.drawField(page, font, 'Department:', formData.department || 'N/A', leftMargin, y);
    y -= 35;

    // Advisor Section
    page.drawText('ACADEMIC ADVISOR', {
      x: leftMargin,
      y,
      size: 14,
      font: fontBold,
      color: rgb(0, 0, 0),
    });

    y -= 25;

    this.drawField(page, font, 'Advisor Name:', formData.advisorName || 'N/A', leftMargin, y);
    y -= 35;

    // Reason Section
    page.drawText('REASON FOR CHANGE', {
      x: leftMargin,
      y,
      size: 14,
      font: fontBold,
      color: rgb(0, 0, 0),
    });

    y -= 25;

    // Word wrap the reason text
    const reason = formData.reason || 'N/A';
    const maxWidth = width - (leftMargin * 2);
    const words = reason.split(' ');
    let line = '';
    
    for (const word of words) {
      const testLine = line + word + ' ';
      const testWidth = font.widthOfTextAtSize(testLine, 11);
      
      if (testWidth > maxWidth) {
        page.drawText(line, {
          x: leftMargin,
          y,
          size: 11,
          font,
          color: rgb(0, 0, 0),
        });
        line = word + ' ';
        y -= 15;
      } else {
        line = testLine;
      }
    }
    
    if (line) {
      page.drawText(line, {
        x: leftMargin,
        y,
        size: 11,
        font,
        color: rgb(0, 0, 0),
      });
    }

    y -= 50;

    // Signature Section
    page.drawText('SIGNATURES', {
      x: leftMargin,
      y,
      size: 14,
      font: fontBold,
      color: rgb(0, 0, 0),
    });

    y -= 30;

    page.drawText('Student Signature: _________________________________', {
      x: leftMargin,
      y,
      size: 11,
      font,
      color: rgb(0, 0, 0),
    });

    page.drawText(`Date: ______________`, {
      x: width - 200,
      y,
      size: 11,
      font,
      color: rgb(0, 0, 0),
    });

    y -= 30;

    page.drawText('Advisor Signature: _________________________________', {
      x: leftMargin,
      y,
      size: 11,
      font,
      color: rgb(0, 0, 0),
    });

    page.drawText(`Date: ______________`, {
      x: width - 200,
      y,
      size: 11,
      font,
      color: rgb(0, 0, 0),
    });

    y -= 50;

    // Footer
    page.drawText('Generated by CampusAgent - ' + new Date().toLocaleDateString(), {
      x: leftMargin,
      y: 30,
      size: 8,
      font,
      color: rgb(0.5, 0.5, 0.5),
    });

    // Save the PDF
    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }

  // Generate Graduation Application PDF
  async generateGraduationApplicationPdf(formData: GraduationApplicationData): Promise<Buffer> {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([612, 792]);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const { width, height } = page.getSize();
    let y = height - 50;
    const leftMargin = 50;
    const lineHeight = 20;

    page.drawText('GRADUATION APPLICATION', {
      x: leftMargin,
      y,
      size: 18,
      font: fontBold,
      color: rgb(0, 0, 0),
    });

    y -= 40;
    page.drawText('University Academic Services', {
      x: leftMargin,
      y,
      size: 12,
      font: fontBold,
      color: rgb(0.2, 0.2, 0.2),
    });

    y -= 30;
    page.drawText('STUDENT INFORMATION', {
      x: leftMargin,
      y,
      size: 14,
      font: fontBold,
      color: rgb(0, 0, 0),
    });

    y -= 25;
    this.drawField(page, font, 'Student Name:', formData.studentName || 'N/A', leftMargin, y);
    y -= lineHeight;
    this.drawField(page, font, 'Student ID:', formData.studentId || 'N/A', leftMargin, y);
    y -= lineHeight;
    this.drawField(page, font, 'Email:', formData.email || 'N/A', leftMargin, y);
    y -= 35;

    page.drawText('GRADUATION INFORMATION', {
      x: leftMargin,
      y,
      size: 14,
      font: fontBold,
      color: rgb(0, 0, 0),
    });

    y -= 25;
    this.drawField(page, font, 'Expected Graduation Date:', formData.expectedGraduationDate || 'N/A', leftMargin, y);
    y -= lineHeight;
    this.drawField(page, font, 'Degree Type:', formData.degreeType || 'N/A', leftMargin, y);
    y -= lineHeight;
    this.drawField(page, font, 'Major:', formData.major || 'N/A', leftMargin, y);
    y -= lineHeight;
    if (formData.minor) {
      this.drawField(page, font, 'Minor:', formData.minor, leftMargin, y);
      y -= lineHeight;
    }
    this.drawField(page, font, 'Honors Program:', formData.honorsProgram ? 'Yes' : 'No', leftMargin, y);
    y -= lineHeight;
    if (formData.thesisTitle) {
      this.drawField(page, font, 'Thesis Title:', formData.thesisTitle, leftMargin, y);
      y -= lineHeight;
    }
    this.drawField(page, font, 'Advisor:', formData.advisorName || 'N/A', leftMargin, y);
    y -= lineHeight;
    this.drawField(page, font, 'Department:', formData.department || 'N/A', leftMargin, y);
    y -= 50;

    page.drawText('SIGNATURES', {
      x: leftMargin,
      y,
      size: 14,
      font: fontBold,
      color: rgb(0, 0, 0),
    });

    y -= 30;
    page.drawText('Student Signature: _________________________________', {
      x: leftMargin,
      y,
      size: 11,
      font,
      color: rgb(0, 0, 0),
    });

    page.drawText(`Date: ______________`, {
      x: width - 200,
      y,
      size: 11,
      font,
      color: rgb(0, 0, 0),
    });

    page.drawText('Generated by Smart Academic Form Assistant - ' + new Date().toLocaleDateString(), {
      x: leftMargin,
      y: 30,
      size: 8,
      font,
      color: rgb(0.5, 0.5, 0.5),
    });

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }

  // Generate Add/Drop Course PDF
  async generateAddDropCoursePdf(formData: AddDropCourseData): Promise<Buffer> {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([612, 792]);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const { width, height } = page.getSize();
    let y = height - 50;
    const leftMargin = 50;
    const lineHeight = 20;

    page.drawText('ADD/DROP COURSE REQUEST FORM', {
      x: leftMargin,
      y,
      size: 18,
      font: fontBold,
      color: rgb(0, 0, 0),
    });

    y -= 40;
    page.drawText('University Academic Services', {
      x: leftMargin,
      y,
      size: 12,
      font: fontBold,
      color: rgb(0.2, 0.2, 0.2),
    });

    y -= 30;
    page.drawText('STUDENT INFORMATION', {
      x: leftMargin,
      y,
      size: 14,
      font: fontBold,
      color: rgb(0, 0, 0),
    });

    y -= 25;
    this.drawField(page, font, 'Student Name:', formData.studentName || 'N/A', leftMargin, y);
    y -= lineHeight;
    this.drawField(page, font, 'Student ID:', formData.studentId || 'N/A', leftMargin, y);
    y -= lineHeight;
    this.drawField(page, font, 'Semester:', formData.semester || 'N/A', leftMargin, y);
    y -= lineHeight;
    this.drawField(page, font, 'Year:', formData.year || 'N/A', leftMargin, y);
    y -= 35;

    if (formData.coursesToAdd && formData.coursesToAdd.length > 0) {
      page.drawText('COURSES TO ADD', {
        x: leftMargin,
        y,
        size: 14,
        font: fontBold,
        color: rgb(0, 0, 0),
      });
      y -= 25;
      formData.coursesToAdd.forEach(course => {
        page.drawText(`• ${course.courseCode} - ${course.courseName} (${course.credits} credits)`, {
          x: leftMargin,
          y,
          size: 11,
          font,
          color: rgb(0, 0, 0),
        });
        y -= lineHeight;
      });
      y -= 15;
    }

    if (formData.coursesToDrop && formData.coursesToDrop.length > 0) {
      page.drawText('COURSES TO DROP', {
        x: leftMargin,
        y,
        size: 14,
        font: fontBold,
        color: rgb(0, 0, 0),
      });
      y -= 25;
      formData.coursesToDrop.forEach(course => {
        page.drawText(`• ${course.courseCode} - ${course.courseName} (${course.credits} credits)`, {
          x: leftMargin,
          y,
          size: 11,
          font,
          color: rgb(0, 0, 0),
        });
        y -= lineHeight;
      });
      y -= 15;
    }

    if (formData.reason) {
      page.drawText('REASON', {
        x: leftMargin,
        y,
        size: 14,
        font: fontBold,
        color: rgb(0, 0, 0),
      });
      y -= 25;
      const words = formData.reason.split(' ');
      let line = '';
      for (const word of words) {
        const testLine = line + word + ' ';
        const testWidth = font.widthOfTextAtSize(testLine, 11);
        if (testWidth > width - (leftMargin * 2)) {
          page.drawText(line, { x: leftMargin, y, size: 11, font, color: rgb(0, 0, 0) });
          line = word + ' ';
          y -= 15;
        } else {
          line = testLine;
        }
      }
      if (line) {
        page.drawText(line, { x: leftMargin, y, size: 11, font, color: rgb(0, 0, 0) });
        y -= 20;
      }
    }

    y -= 20;
    page.drawText('SIGNATURES', {
      x: leftMargin,
      y,
      size: 14,
      font: fontBold,
      color: rgb(0, 0, 0),
    });

    y -= 30;
    page.drawText('Student Signature: _________________________________', {
      x: leftMargin,
      y,
      size: 11,
      font,
      color: rgb(0, 0, 0),
    });

    page.drawText(`Date: ______________`, {
      x: width - 200,
      y,
      size: 11,
      font,
      color: rgb(0, 0, 0),
    });

    page.drawText('Generated by Smart Academic Form Assistant - ' + new Date().toLocaleDateString(), {
      x: leftMargin,
      y: 30,
      size: 8,
      font,
      color: rgb(0.5, 0.5, 0.5),
    });

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }

  // Helper method to draw a field
  private drawField(page: any, font: any, label: string, value: string, x: number, y: number) {
    page.drawText(label, {
      x,
      y,
      size: 11,
      font,
      color: rgb(0.3, 0.3, 0.3),
    });

    page.drawText(value, {
      x: x + 120,
      y,
      size: 11,
      font,
      color: rgb(0, 0, 0),
    });
  }
}

export const pdfService = new PdfService();
