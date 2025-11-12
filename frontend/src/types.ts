export interface Message {
  id: string;
  role: 'user' | 'agent';
  content: string;
  timestamp: Date;
}

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

export interface ChatSession {
  sessionId: string;
  messages: Message[];
  formData: FormData;
  status: 'active' | 'completed' | 'error';
}

export interface ApiResponse {
  message: string;
  formData?: FormData;
  isComplete?: boolean;
  pdfUrl?: string;
  emailDraft?: string;
}

