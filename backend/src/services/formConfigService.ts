import { FormType, FormConfig } from '../types.js';

export class FormConfigService {
  private formConfigs: Map<FormType, FormConfig>;

  constructor() {
    this.formConfigs = new Map();
    this.initializeConfigs();
  }

  private initializeConfigs() {
    // Change of Major Form
    this.formConfigs.set(FormType.CHANGE_OF_MAJOR, {
      type: FormType.CHANGE_OF_MAJOR,
      name: 'Change of Major',
      description: 'Request to change your academic major',
      requiredFields: ['studentName', 'studentId', 'currentMajor', 'desiredMajor', 'advisorName', 'email'],
      optionalFields: ['phone', 'department', 'reason'],
      deadline: this.getNextSemesterDeadline(),
      deadlineReminderDays: [30, 14, 7, 1], // Remind 30, 14, 7, and 1 day before
    });

    // Graduation Application
    this.formConfigs.set(FormType.GRADUATION_APPLICATION, {
      type: FormType.GRADUATION_APPLICATION,
      name: 'Graduation Application',
      description: 'Apply for graduation and degree conferral',
      requiredFields: ['studentName', 'studentId', 'expectedGraduationDate', 'degreeType', 'major', 'email'],
      optionalFields: ['minor', 'honorsProgram', 'thesisTitle', 'advisorName', 'department', 'phone'],
      deadline: this.getGraduationDeadline(),
      deadlineReminderDays: [60, 30, 14, 7], // Earlier reminders for graduation
    });

    // Add/Drop Course
    this.formConfigs.set(FormType.ADD_DROP_COURSE, {
      type: FormType.ADD_DROP_COURSE,
      name: 'Add/Drop Course',
      description: 'Add or drop courses for the current semester',
      requiredFields: ['studentName', 'studentId', 'semester', 'year', 'email'],
      optionalFields: ['coursesToAdd', 'coursesToDrop', 'reason', 'advisorName', 'phone'],
      deadline: this.getAddDropDeadline(),
      deadlineReminderDays: [7, 3, 1], // Short window for add/drop
    });
  }

  getConfig(formType: FormType): FormConfig | undefined {
    return this.formConfigs.get(formType);
  }

  getAllConfigs(): FormConfig[] {
    return Array.from(this.formConfigs.values());
  }

  getRequiredFields(formType: FormType): string[] {
    const config = this.getConfig(formType);
    return config?.requiredFields || [];
  }

  getOptionalFields(formType: FormType): string[] {
    const config = this.getConfig(formType);
    return config?.optionalFields || [];
  }

  getDeadline(formType: FormType): Date | undefined {
    const config = this.getConfig(formType);
    return config?.deadline;
  }

  // Helper methods to calculate deadlines
  private getNextSemesterDeadline(): Date {
    const now = new Date();
    const nextSemester = new Date(now);
    nextSemester.setMonth(now.getMonth() + 3); // 3 months from now
    return nextSemester;
  }

  private getGraduationDeadline(): Date {
    const now = new Date();
    const deadline = new Date(now);
    // Graduation applications typically due 2 months before semester end
    deadline.setMonth(now.getMonth() + 2);
    return deadline;
  }

  private getAddDropDeadline(): Date {
    const now = new Date();
    const deadline = new Date(now);
    // Add/drop usually has a 2-week window
    deadline.setDate(now.getDate() + 14);
    return deadline;
  }
}

export const formConfigService = new FormConfigService();

