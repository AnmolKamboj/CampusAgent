export interface FormData {
  studentName?: string;
  studentId?: string;
  currentMajor?: string;
  desiredMajor?: string;
  advisorName?: string;
  department?: string;
  email?: string;
  phone?: string;
  reason?: string;
}

export interface ChatRequest {
  sessionId: string;
  message: string;
  formData: FormData;
}

export interface ChatResponse {
  message: string;
  formData?: FormData;
  isComplete?: boolean;
  pdfUrl?: string;
  emailDraft?: string;
}

export interface SessionState {
  sessionId: string;
  formData: FormData;
  conversationHistory: ConversationMessage[];
  currentStep: string;
  isComplete: boolean;
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

