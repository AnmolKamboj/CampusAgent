// Form Types (matching backend)
export enum FormType {
  CHANGE_OF_MAJOR = 'change-of-major',
  GRADUATION_APPLICATION = 'graduation-application',
  ADD_DROP_COURSE = 'add-drop-course',
}

// Base form data shared across all forms
export interface BaseFormData {
  studentName?: string;
  studentId?: string;
  email?: string;
  phone?: string;
}

// Change of Major specific fields
export interface ChangeOfMajorData extends BaseFormData {
  currentMajor?: string;
  desiredMajor?: string;
  advisorName?: string;
  department?: string;
  reason?: string;
}

// Graduation Application specific fields
export interface GraduationApplicationData extends BaseFormData {
  expectedGraduationDate?: string;
  degreeType?: string;
  major?: string;
  minor?: string;
  honorsProgram?: boolean;
  thesisTitle?: string;
  advisorName?: string;
  department?: string;
}

// Add/Drop Course specific fields
export interface AddDropCourseData extends BaseFormData {
  semester?: string;
  year?: string;
  coursesToAdd?: Array<{ courseCode: string; courseName: string; credits: number }>;
  coursesToDrop?: Array<{ courseCode: string; courseName: string; credits: number }>;
  reason?: string;
  advisorName?: string;
}

// Union type for all form data
export type FormData = ChangeOfMajorData | GraduationApplicationData | AddDropCourseData;

// Form configuration
export interface FormConfig {
  type: FormType;
  name: string;
  description: string;
  requiredFields: string[];
  optionalFields: string[];
  deadline?: Date;
  deadlineReminderDays?: number[];
}

export interface Message {
  id: string;
  role: 'user' | 'agent';
  content: string;
  timestamp: Date;
}

export interface ChatSession {
  sessionId: string;
  messages: Message[];
  formData: FormData;
  formType?: FormType;
  status: 'active' | 'completed' | 'error';
}

export interface ApiResponse {
  message: string;
  formData?: FormData;
  formType?: FormType | string; // Supports both FormType enum and template ID (string)
  isComplete?: boolean;
  pdfUrl?: string;
  emailDraft?: string;
  validationErrors?: string[];
  deadline?: Date;
  deadlineWarning?: boolean;
}
