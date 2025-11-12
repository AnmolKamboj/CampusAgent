import { getModel } from '../config/gemini.js';
import { FormData, SessionState, ConversationMessage, AgentPhase } from '../types.js';

// In-memory session storage (replace with Redis/DB in production)
const sessions = new Map<string, SessionState>();

export class AgentService {
  private model;

  constructor() {
    this.model = getModel();
  }

  // Initialize a new session
  initSession(sessionId: string): SessionState {
    const session: SessionState = {
      sessionId,
      formData: {},
      conversationHistory: [],
      currentStep: 'greeting',
      isComplete: false,
    };
    sessions.set(sessionId, session);
    return session;
  }

  // Get session
  getSession(sessionId: string): SessionState | undefined {
    return sessions.get(sessionId);
  }

  // Generate welcome message
  async generateWelcome(): Promise<string> {
    return `👋 Hello! I'm your CampusAgent assistant. I'm here to help you fill out your **Change of Major** form.

I'll guide you through the process step by step and collect all the necessary information. Once we're done, I can generate a filled PDF and an email draft for you.

To get started, could you tell me: **What major would you like to change to?**`;
  }

  // Process user message and generate response
  async processMessage(
    sessionId: string,
    userMessage: string,
    currentFormData: FormData
  ): Promise<{ message: string; formData: FormData; isComplete: boolean }> {
    let session = this.getSession(sessionId);
    if (!session) {
      session = this.initSession(sessionId);
    }

    // Update conversation history
    session.conversationHistory.push({
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    });

    // Execute agent workflow
    const reasoningResult = await this.reason(session, userMessage, currentFormData);
    const planResult = await this.plan(reasoningResult);
    const actionResult = await this.act(planResult);
    const reflectionResult = await this.reflect(actionResult);

    // Update session
    session.formData = { ...session.formData, ...reflectionResult.formData };
    session.conversationHistory.push({
      role: 'agent',
      content: reflectionResult.message,
      timestamp: new Date(),
    });

    sessions.set(sessionId, session);

    return {
      message: reflectionResult.message,
      formData: session.formData,
      isComplete: reflectionResult.isComplete,
    };
  }

  // REASON: Understand user intent and extract information
  private async reason(
    session: SessionState,
    userMessage: string,
    formData: FormData
  ): Promise<any> {
    const prompt = this.buildReasonPrompt(session, userMessage, formData);
    
    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      
      return {
        session,
        userMessage,
        formData,
        aiAnalysis: response,
      };
    } catch (error) {
      console.error('Error in reasoning phase:', error);
      return {
        session,
        userMessage,
        formData,
        aiAnalysis: 'Unable to analyze message',
      };
    }
  }

  // PLAN: Determine next steps
  private async plan(reasoningResult: any): Promise<any> {
    const { formData } = reasoningResult;
    
    // Determine what information is still needed
    const missingFields: string[] = [];
    
    if (!formData.desiredMajor) missingFields.push('desired major');
    if (!formData.studentName) missingFields.push('student name');
    if (!formData.studentId) missingFields.push('student ID or Z-number');
    if (!formData.currentMajor) missingFields.push('current major');
    if (!formData.advisorName) missingFields.push('advisor name');
    if (!formData.department) missingFields.push('department');
    if (!formData.email) missingFields.push('email address');
    if (!formData.reason) missingFields.push('reason for changing major');

    return {
      ...reasoningResult,
      missingFields,
      nextField: missingFields[0] || null,
    };
  }

  // ACT: Generate response and extract data
  private async act(planResult: any): Promise<any> {
    const { session, userMessage, formData, aiAnalysis, missingFields, nextField } = planResult;
    
    // Extract data from user message
    const extractedData = await this.extractFormData(userMessage, formData, aiAnalysis);
    
    // Merge extracted data
    const updatedFormData = { ...formData, ...extractedData };
    
    // Generate next question or completion message
    let responseMessage: string;
    
    if (missingFields.length === 0) {
      responseMessage = `Perfect! I have all the information I need:\n\n` +
        `✓ Student Name: ${updatedFormData.studentName}\n` +
        `✓ Student ID: ${updatedFormData.studentId}\n` +
        `✓ Current Major: ${updatedFormData.currentMajor}\n` +
        `✓ Desired Major: ${updatedFormData.desiredMajor}\n` +
        `✓ Advisor: ${updatedFormData.advisorName}\n` +
        `✓ Department: ${updatedFormData.department}\n` +
        `✓ Email: ${updatedFormData.email}\n` +
        `✓ Reason: ${updatedFormData.reason}\n\n` +
        `You can now:\n` +
        `📄 Click "Download PDF" to get your filled form\n` +
        `📧 Click "Generate Email" to create a submission email`;
    } else {
      responseMessage = await this.generateNextQuestion(nextField, updatedFormData);
    }
    
    return {
      ...planResult,
      formData: updatedFormData,
      message: responseMessage,
    };
  }

  // REFLECT: Validate and finalize response
  private async reflect(actionResult: any): Promise<any> {
    const { formData, message, missingFields } = actionResult;
    
    // Determine if form is complete
    const isComplete = missingFields.length === 0;
    
    return {
      formData,
      message,
      isComplete,
    };
  }

  // Helper: Build reasoning prompt
  private buildReasonPrompt(session: SessionState, userMessage: string, formData: FormData): string {
    return `You are an intelligent assistant helping a student fill out a "Change of Major" form.

Current form data: ${JSON.stringify(formData, null, 2)}

Student's message: "${userMessage}"

Analyze this message and identify:
1. What information did the student provide?
2. What field(s) does this relate to (studentName, studentId, currentMajor, desiredMajor, advisorName, department, email, phone, reason)?
3. Is the information valid and complete?

Provide a brief analysis.`;
  }

  // Helper: Extract form data from user message
  private async extractFormData(userMessage: string, currentData: FormData, aiAnalysis: string): Promise<Partial<FormData>> {
    const extracted: Partial<FormData> = {};
    const lowerMessage = userMessage.toLowerCase();

    // Simple extraction logic (can be enhanced with more AI)
    
    // Desired major (if not yet set)
    if (!currentData.desiredMajor) {
      const majorKeywords = ['computer science', 'biology', 'psychology', 'engineering', 'mathematics', 
                            'physics', 'chemistry', 'english', 'history', 'business', 'economics',
                            'cs', 'compsci', 'comp sci'];
      
      for (const keyword of majorKeywords) {
        if (lowerMessage.includes(keyword)) {
          extracted.desiredMajor = userMessage.trim();
          break;
        }
      }
    }

    // Student name (look for "my name is" or "I'm" or "I am")
    if (!currentData.studentName) {
      const namePatterns = [
        /my name is ([a-zA-Z\s]+)/i,
        /i'm ([a-zA-Z\s]+)/i,
        /i am ([a-zA-Z\s]+)/i,
        /this is ([a-zA-Z\s]+)/i,
      ];
      
      for (const pattern of namePatterns) {
        const match = userMessage.match(pattern);
        if (match) {
          extracted.studentName = match[1].trim();
          break;
        }
      }
      
      // If message is just a name (2-4 words, all capitalized first letters)
      if (!extracted.studentName && /^[A-Z][a-z]+(\s[A-Z][a-z]+){1,3}$/.test(userMessage.trim())) {
        extracted.studentName = userMessage.trim();
      }
    }

    // Student ID (look for Z-number or numeric ID)
    if (!currentData.studentId) {
      const idPatterns = [
        /z[\s-]?(\d{8})/i,
        /id[\s:]?(\d{8,10})/i,
        /(\d{8,10})/,
      ];
      
      for (const pattern of idPatterns) {
        const match = userMessage.match(pattern);
        if (match) {
          extracted.studentId = match[1] || match[0];
          break;
        }
      }
    }

    // Email
    if (!currentData.email) {
      const emailPattern = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/;
      const match = userMessage.match(emailPattern);
      if (match) {
        extracted.email = match[1];
      }
    }

    // Phone
    if (!currentData.phone) {
      const phonePattern = /(\d{3}[-.\s]?\d{3}[-.\s]?\d{4})/;
      const match = userMessage.match(phonePattern);
      if (match) {
        extracted.phone = match[1];
      }
    }

    // Current major
    if (!currentData.currentMajor && lowerMessage.includes('current')) {
      extracted.currentMajor = userMessage.trim();
    }

    // Advisor name
    if (!currentData.advisorName && (lowerMessage.includes('advisor') || lowerMessage.includes('professor'))) {
      extracted.advisorName = userMessage.trim();
    }

    // Department
    if (!currentData.department && lowerMessage.includes('department')) {
      extracted.department = userMessage.trim();
    }

    // Reason (usually longer text)
    if (!currentData.reason && userMessage.length > 20 && !Object.keys(extracted).length) {
      extracted.reason = userMessage.trim();
    }

    return extracted;
  }

  // Helper: Generate next question
  private async generateNextQuestion(nextField: string, formData: FormData): Promise<string> {
    const questions: Record<string, string> = {
      'desired major': '🎓 Great! What major would you like to change to?',
      'student name': '👤 What is your full name?',
      'student ID or Z-number': '🔢 What is your student ID or Z-number?',
      'current major': '📚 What is your current major?',
      'advisor name': '👨‍🏫 Who is your academic advisor?',
      'department': '🏢 What department is your new major in?',
      'email address': '📧 What is your email address?',
      'phone number': '📱 What is your phone number? (optional)',
      'reason for changing major': '💭 Finally, could you briefly explain your reason for changing majors?',
    };

    return questions[nextField] || 'Could you provide more information?';
  }
}

export const agentService = new AgentService();

