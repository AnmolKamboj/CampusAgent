// Form Types
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
  degreeType?: string; // Bachelor's, Master's, etc.
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

// Student data for auto-fill (with consent)
export interface StudentData {
  studentId: string;
  studentName: string;
  email: string;
  phone?: string;
  currentMajor?: string;
  advisorName?: string;
  department?: string;
  enrollmentStatus?: string;
  gpa?: number;
  consentGiven: boolean;
  consentDate?: Date;
}

export interface ChatRequest {
  sessionId: string;
  message: string;
  formData: FormData;
  formType?: FormType;
  useAutoFill?: boolean;
}

export interface ChatResponse {
  message: string;
  formData?: FormData;
  formType?: FormType;
  isComplete?: boolean;
  pdfUrl?: string;
  emailDraft?: string;
  validationErrors?: string[];
  deadline?: Date;
  deadlineWarning?: boolean;
}

export interface SessionState {
  sessionId: string;
  formData: FormData | DynamicFormData;
  formType: FormType | string; // Supports both FormType enum and template ID (string)
  conversationHistory: ConversationMessage[];
  currentStep: string;
  isComplete: boolean;
  studentData?: StudentData;
  deadline?: Date;
  language?: string; // For multilingual support
}

export interface ConversationMessage {
  role: 'user' | 'agent';
  content: string;
  timestamp: Date;
}

export enum AgentPhase {
  REASON = 'reason',
  PLAN = 'plan',
  ACT = 'act',
  REFLECT = 'reflect',
}

// Deadline reminder
export interface DeadlineReminder {
  formType: FormType;
  studentId: string;
  deadline: Date;
  reminderSent: boolean;
  reminderDate?: Date;
}

// Language support
export enum SupportedLanguage {
  ENGLISH = 'en',
  SPANISH = 'es',
  FRENCH = 'fr',
}

// Form Template (uploaded PDF)
export interface FormTemplate {
  id: string;
  name: string;
  description?: string;
  fileName: string;
  filePath: string;
  uploadedAt: Date;
  isActive: boolean;
  
  // AI-extracted metadata
  fields: FormField[];
  requiredFields: string[];
  optionalFields: string[];
}

// Form field extracted from PDF
export interface FormField {
  name: string;              // Field name (e.g., "studentName")
  label: string;             // Display label (e.g., "Student Name")
  type: 'text' | 'email' | 'phone' | 'date' | 'number' | 'textarea' | 'checkbox' | 'select';
  isRequired: boolean;
  pdfFieldName?: string;      // Actual PDF form field name (if fillable)
  question?: string;          // AI-generated question to ask user
  validation?: {
    pattern?: string;
    minLength?: number;
    maxLength?: number;
  };
}

// PDF Analysis Result
export interface PdfAnalysisResult {
  fields: FormField[];
  requiredFields: string[];
  optionalFields: string[];
  formType: string;
  description: string;
  confidence: number;         // AI confidence in analysis
}

// Extended FormData to support dynamic forms
export type DynamicFormData = Record<string, any>;
