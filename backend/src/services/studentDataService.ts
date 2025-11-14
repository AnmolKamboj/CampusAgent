import { FormType, StudentData, FormData } from '../types.js';

// In-memory storage for student data (replace with database in production)
const studentDataStore: Map<string, StudentData> = new Map();

export class StudentDataService {
  // Get student data by ID
  getStudentData(studentId: string): StudentData | undefined {
    return studentDataStore.get(studentId);
  }

  // Store student data (with consent)
  storeStudentData(studentData: StudentData): void {
    if (studentData.consentGiven) {
      studentDataStore.set(studentData.studentId, studentData);
    }
  }

  // Auto-fill form data from stored student data
  async autoFillFormData(
    formType: FormType,
    studentId: string,
    withConsent: boolean,
    existingData: FormData
  ): Promise<Partial<FormData>> {
    if (!withConsent) {
      return {};
    }

    const studentData = this.getStudentData(studentId);
    if (!studentData || !studentData.consentGiven) {
      return {};
    }

    // Auto-fill common fields
    const autoFilled: Partial<FormData> = {
      studentName: existingData.studentName || studentData.studentName,
      studentId: existingData.studentId || studentData.studentId,
      email: existingData.email || studentData.email,
      phone: existingData.phone || studentData.phone,
    };

    // Form-specific auto-fill
    if (formType === FormType.CHANGE_OF_MAJOR && 'currentMajor' in existingData) {
      const changeData = autoFilled as any;
      const existingChangeData = existingData as any;
      changeData.currentMajor = existingChangeData.currentMajor || studentData.currentMajor;
      changeData.advisorName = existingChangeData.advisorName || studentData.advisorName;
      changeData.department = existingChangeData.department || studentData.department;
    }

    return autoFilled;
  }

  // Clear student data (for privacy)
  clearStudentData(studentId: string): void {
    studentDataStore.delete(studentId);
  }
}

export const studentDataService = new StudentDataService();
