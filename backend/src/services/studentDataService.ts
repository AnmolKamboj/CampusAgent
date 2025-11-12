import { StudentData, FormData, FormType, ChangeOfMajorData, GraduationApplicationData, AddDropCourseData } from '../types.js';

export class StudentDataService {
  // In-memory storage (replace with database in production)
  private studentDatabase: Map<string, StudentData>;

  constructor() {
    this.studentDatabase = new Map();
    // Initialize with some sample data for demo
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Sample student data for demonstration
    const sampleStudent: StudentData = {
      studentId: 'Z12345678',
      studentName: 'John Doe',
      email: 'john.doe@fau.edu',
      phone: '555-123-4567',
      currentMajor: 'Biology',
      advisorName: 'Dr. Jane Smith',
      department: 'Biology Department',
      enrollmentStatus: 'Full-time',
      gpa: 3.5,
      consentGiven: false, // Requires explicit consent
      consentDate: undefined,
    };
    this.studentDatabase.set('Z12345678', sampleStudent);
  }

  // Get student data by ID (requires consent)
  async getStudentData(studentId: string, consentGiven: boolean): Promise<StudentData | null> {
    if (!consentGiven) {
      return null;
    }

    const studentData = this.studentDatabase.get(studentId);
    if (!studentData) {
      return null;
    }

    // Update consent if provided
    if (consentGiven && !studentData.consentGiven) {
      studentData.consentGiven = true;
      studentData.consentDate = new Date();
      this.studentDatabase.set(studentId, studentData);
    }

    return studentData;
  }

  // Store or update student data
  async saveStudentData(studentData: StudentData): Promise<void> {
    this.studentDatabase.set(studentData.studentId, studentData);
  }

  // Auto-fill form data from student database
  async autoFillFormData(
    formType: FormType,
    studentId: string,
    consentGiven: boolean,
    existingFormData: FormData
  ): Promise<Partial<FormData>> {
    if (!consentGiven) {
      return {};
    }

    const studentData = await this.getStudentData(studentId, consentGiven);
    if (!studentData) {
      return {};
    }

    const autoFilled: Partial<FormData> = {};

    // Common fields
    if (!existingFormData.studentName) {
      autoFilled.studentName = studentData.studentName;
    }
    if (!existingFormData.email) {
      autoFilled.email = studentData.email;
    }
    if (!existingFormData.phone && studentData.phone) {
      autoFilled.phone = studentData.phone;
    }

    // Form-specific auto-fill
    switch (formType) {
      case FormType.CHANGE_OF_MAJOR:
        const changeMajorData = existingFormData as ChangeOfMajorData;
        if (!changeMajorData.currentMajor && studentData.currentMajor) {
          (autoFilled as ChangeOfMajorData).currentMajor = studentData.currentMajor;
        }
        if (!changeMajorData.advisorName && studentData.advisorName) {
          (autoFilled as ChangeOfMajorData).advisorName = studentData.advisorName;
        }
        if (!changeMajorData.department && studentData.department) {
          (autoFilled as ChangeOfMajorData).department = studentData.department;
        }
        break;

      case FormType.GRADUATION_APPLICATION:
        const gradData = existingFormData as GraduationApplicationData;
        if (!gradData.major && studentData.currentMajor) {
          (autoFilled as GraduationApplicationData).major = studentData.currentMajor;
        }
        if (!gradData.advisorName && studentData.advisorName) {
          (autoFilled as GraduationApplicationData).advisorName = studentData.advisorName;
        }
        if (!gradData.department && studentData.department) {
          (autoFilled as GraduationApplicationData).department = studentData.department;
        }
        break;

      case FormType.ADD_DROP_COURSE:
        const addDropData = existingFormData as AddDropCourseData;
        if (!addDropData.advisorName && studentData.advisorName) {
          (autoFilled as AddDropCourseData).advisorName = studentData.advisorName;
        }
        break;
    }

    return autoFilled;
  }

  // Request consent from student
  async requestConsent(studentId: string): Promise<{ message: string; requiresConsent: boolean }> {
    const studentData = this.studentDatabase.get(studentId);
    
    if (!studentData) {
      return {
        message: 'Student data not found. Please enter your information manually.',
        requiresConsent: false,
      };
    }

    if (studentData.consentGiven) {
      return {
        message: 'You have already given consent. I can auto-fill your information.',
        requiresConsent: false,
      };
    }

    return {
      message: `I found your student record (${studentData.studentName}). Would you like me to auto-fill your form with your saved information? This will save you time. Type "yes" to consent, or "no" to enter information manually.`,
      requiresConsent: true,
    };
  }
}

export const studentDataService = new StudentDataService();

