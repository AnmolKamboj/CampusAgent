import { FormType, FormConfig } from '../types.js';

// Hardcoded form configurations
const formConfigs: Map<FormType, FormConfig> = new Map([
  [
    FormType.CHANGE_OF_MAJOR,
    {
      type: FormType.CHANGE_OF_MAJOR,
      name: 'Change of Major',
      description: 'Request to change your academic major',
      requiredFields: ['studentName', 'studentId', 'currentMajor', 'desiredMajor', 'advisorName', 'department', 'email'],
      optionalFields: ['phone', 'reason'],
    },
  ],
  [
    FormType.GRADUATION_APPLICATION,
    {
      type: FormType.GRADUATION_APPLICATION,
      name: 'Graduation Application',
      description: 'Apply for graduation',
      requiredFields: ['studentName', 'studentId', 'expectedGraduationDate', 'degreeType', 'major', 'advisorName', 'department', 'email'],
      optionalFields: ['phone', 'minor', 'honorsProgram', 'thesisTitle'],
    },
  ],
  [
    FormType.ADD_DROP_COURSE,
    {
      type: FormType.ADD_DROP_COURSE,
      name: 'Add/Drop Course',
      description: 'Add or drop courses for a semester',
      requiredFields: ['studentName', 'studentId', 'semester', 'year', 'email'],
      optionalFields: ['phone', 'coursesToAdd', 'coursesToDrop', 'reason', 'advisorName'],
    },
  ],
]);

export class FormConfigService {
  getConfig(formType: FormType): FormConfig | undefined {
    return formConfigs.get(formType);
  }

  getAllConfigs(): FormConfig[] {
    return Array.from(formConfigs.values());
  }

  getRequiredFields(formType: FormType): string[] {
    return formConfigs.get(formType)?.requiredFields || [];
  }

  getOptionalFields(formType: FormType): string[] {
    return formConfigs.get(formType)?.optionalFields || [];
  }
}

export const formConfigService = new FormConfigService();
