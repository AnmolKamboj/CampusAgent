import { getModel } from '../config/ai.js';
import { FormData, SessionState, DynamicFormData, FormField } from '../types.js';

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
      currentStep: 'waiting_for_pdf',
      isComplete: false,
    };
    sessions.set(sessionId, session);
    return session;
  }

  // Get session
  getSession(sessionId: string): SessionState | undefined {
    return sessions.get(sessionId);
  }

  // Store uploaded PDF and its analysis in session
  async storePdfInSession(sessionId: string, pdfBuffer: Buffer, analysis: any): Promise<void> {
    let session = this.getSession(sessionId);
    if (!session) {
      session = this.initSession(sessionId);
    }
    
    session.uploadedPdf = pdfBuffer;
    session.pdfAnalysis = analysis;
    session.currentStep = 'collecting_data';
    sessions.set(sessionId, session);
  }

  // Generate welcome message
  async generateWelcome(): Promise<string> {
    const welcome = `Hello! I'm your Smart PDF Form Assistant. I'm here to help you fill out any PDF form quickly and easily.\n\n` +
      `Here's how it works:\n` +
      `1. Upload your PDF form using the attachment button\n` +
      `2. I'll analyze the form and find all the fields that need to be filled\n` +
      `3. I'll ask you questions to collect the information\n` +
      `4. You'll get a completed PDF ready to submit\n\n` +
      `Let's get started! Please upload your PDF form.`;
    
    return welcome;
  }

  // Process user message and generate response
  async processMessage(
    sessionId: string,
    userMessage: string,
    currentFormData: FormData | DynamicFormData
  ): Promise<{ message: string; formData: FormData | DynamicFormData; isComplete: boolean }> {
    let session = this.getSession(sessionId);
    if (!session) {
      session = this.initSession(sessionId);
    }

    // Check if PDF has been uploaded
    if (!session.pdfAnalysis) {
      return {
        message: `I haven't received a PDF form yet. Please upload your PDF form using the 📎 attachment button so I can help you fill it out!`,
        formData: session.formData,
        isComplete: false,
      };
    }

    // Merge current form data from frontend with session form data
    const mergedFormData = { ...session.formData, ...currentFormData };

    // Update conversation history
    session.conversationHistory.push({
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    });

    // Execute agent workflow with merged form data
    const reasoningResult = await this.reason(session, userMessage, mergedFormData);
    const planResult = await this.plan(reasoningResult);
    const actionResult = await this.act(planResult);
    const reflectionResult = await this.reflect(actionResult);

    // Update session with merged form data
    session.formData = { ...session.formData, ...reflectionResult.formData };
    session.conversationHistory.push({
      role: 'agent',
      content: reflectionResult.message,
      timestamp: new Date(),
    });
    
    // Ensure formData in response includes all session data
    reflectionResult.formData = session.formData;

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

  // PLAN: Determine next steps based on PDF analysis
  private async plan(reasoningResult: any): Promise<any> {
    const { session, formData } = reasoningResult;
    
    // Get required fields from PDF analysis
    const requiredFields = session.pdfAnalysis?.requiredFields || [];
    
    // Determine what field we should be asking for next (before extraction)
    let nextField = null;
    for (const field of requiredFields) {
      if (!formData[field] || (typeof formData[field] === 'string' && formData[field].trim() === '')) {
        nextField = field;
        break;
      }
    }

    return {
      ...reasoningResult,
      nextField,  // What field we're currently asking for
      missingFields: requiredFields.filter((f: string) => !formData[f] || (typeof formData[f] === 'string' && formData[f].trim() === '')),
    };
  }

  // ACT: Generate response and extract data
  private async act(planResult: any): Promise<any> {
    const { session, userMessage, formData, aiAnalysis, nextField: askedField } = planResult;
    
    // Extract data from user message FIRST (pass askedField for context)
    const extractedData = await this.extractFormData(userMessage, formData, aiAnalysis, askedField);
    
    // Merge extracted data
    const updatedFormData = { ...formData, ...extractedData };
    
    // Get required fields from PDF analysis
    const requiredFields = session.pdfAnalysis?.requiredFields || [];
    const formName = session.pdfAnalysis?.formTitle || 'form';
    
    const missingFields: string[] = [];
    
      for (const field of requiredFields) {
      const value = (updatedFormData as any)[field as string];
      // Check if field is empty or just whitespace
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        missingFields.push(field as string);
      }
    }
    
    const nextField = missingFields[0] || null;
    
    // Generate next question or completion message
    let responseMessage: string;
    
    if (missingFields.length === 0) {
      responseMessage = `Perfect! I have all the information I need for your ${formName}.\n\n`;
      
      // Show collected information from PDF fields
      if (session.pdfAnalysis?.fields) {
        session.pdfAnalysis.fields.forEach((field: FormField) => {
          const value = (updatedFormData as any)[field.name];
          if (value !== undefined && value !== null && value !== '') {
            const label = field.label || field.name;
            responseMessage += `✓ ${label}: ${value}\n`;
          }
        });
      }
      
      responseMessage += `\nYou can now:\n` +
        `• Click "Download PDF" to get your filled form\n` +
        `• Click "Generate Email" to create a submission email`;
    } else if (nextField) {
      // ALWAYS build a conversational response - acknowledge what they said
      responseMessage = await this.buildConversationalResponse(
        userMessage,
        extractedData, 
        nextField,
        session
      );
    } else {
      responseMessage = 'Hmm, I need a bit more information to complete your form. Could you help me fill in the remaining details?';
    }
    
    return {
      ...planResult,
      formData: updatedFormData,
      message: responseMessage,
      missingFields,
      nextField,
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
    const formName = session.pdfAnalysis?.formTitle || 'form';
    const fieldList = session.pdfAnalysis?.requiredFields.join(', ') || 'form fields';
    
    return `You are an intelligent assistant helping a student fill out a "${formName}" form.

Current form data: ${JSON.stringify(formData, null, 2)}

Student's message: "${userMessage}"

Analyze this message and identify:
1. What information did the student provide?
2. What field(s) does this relate to (${fieldList})?
3. Is the information valid and complete?

Provide a brief analysis.`;
  }

  // Helper: Extract form data from user message
  private async extractFormData(
    userMessage: string, 
    currentData: FormData, 
    _aiAnalysis: string,
    nextFieldAsked?: string  // What field are we currently asking for?
  ): Promise<Partial<FormData>> {
    const extracted: Partial<FormData> = {};
    const lowerMessage = userMessage.toLowerCase().trim();
    const trimmedMessage = userMessage.trim();
    
    // Check if message is conversational/greeting first (BEFORE context-aware extraction)
    const conversationalPatterns = [
      /^(hi|hello|hey|greetings|good morning|good afternoon|good evening|sup|yo|wassup|what's up|whats up)$/i,
      /^(thanks|thank you|ty|thx|appreciate it|cool|ok|okay|alright|nice|great)$/i,
      /^(yes|no|yeah|nah|yep|nope|sure|fine)$/i,
      /^(lol|haha|hehe|lmao|xd)$/i,
      /^(how are you|what's up|whats up)$/i,
    ];
    
    const isConversational = conversationalPatterns.some(pattern => pattern.test(trimmedMessage));
    
    // Also check if message is VERY short and contains no substantive content
    const isVeryShort = trimmedMessage.length <= 3 && !/\d/.test(trimmedMessage);
    
    // CONTEXT-AWARE EXTRACTION: If we know what field we're asking for, try that first
    // BUT: Skip if message is conversational/greeting or very short
    if (nextFieldAsked && trimmedMessage.length > 0 && !/^\d+$/.test(trimmedMessage) && !isConversational && !isVeryShort) {
      // If asking for studentName, prioritize name extraction
      // Additional validation: name should have at least 2 chars and look like a name
      if (nextFieldAsked === 'studentName' && !currentData.studentName) {
        // Validate it looks like a name (at least 2 characters, contains letters)
        // The greeting check above already filters out "hi", "hey", etc.
        if (trimmedMessage.length >= 2 && /[a-zA-Z]/.test(trimmedMessage)) {
          extracted.studentName = trimmedMessage;
          return extracted; // Return immediately to avoid false positives
        }
      }
      
      // For any other field we're asking about, use the response directly
      if (nextFieldAsked) {
        (extracted as any)[nextFieldAsked] = trimmedMessage;
        return extracted;
      }
    }

    // Student name (look for "my name is" or "I'm" or "I am" or just a name pattern)
    // Only extract if name is not already set
    if (!currentData.studentName || (currentData.studentName && currentData.studentName.trim() === '')) {
      const namePatterns = [
        /my name is ([a-zA-Z\s]+)/i,
        /i'm ([a-zA-Z\s]+)/i,
        /i am ([a-zA-Z\s]+)/i,
        /this is ([a-zA-Z\s]+)/i,
        /name is ([a-zA-Z\s]+)/i,
      ];
      
      for (const pattern of namePatterns) {
        const match = userMessage.match(pattern);
        if (match && match[1]) {
          extracted.studentName = match[1].trim();
          break;
        }
      }
      
      // If message is just a name (1-4 words, all letters, no numbers, not all caps)
      // And it's not a number (to avoid confusing IDs with names)
      if (!extracted.studentName && 
          !extracted.studentId && // Don't extract as name if we already extracted as ID
          /^[A-Z][a-z]+(\s[A-Z][a-z]+){0,3}$/.test(trimmedMessage) && 
          !/\d/.test(trimmedMessage) &&
          trimmedMessage.length >= 2) {
        extracted.studentName = trimmedMessage;
      }
    }

    // Student ID (look for Z-number or numeric ID) - be more flexible
    // Only extract if ID is not already set
    if (!currentData.studentId || (currentData.studentId && currentData.studentId.trim() === '')) {
      const idPatterns = [
        /z[\s-]?(\d+)/i, // Z followed by any digits
        /student id[\s:]?(\d+)/i,
        /id[\s:]?(\d+)/i,
        /^(\d{1,10})$/, // Just numbers (1-10 digits, very flexible - handles "001", "00111", etc.)
      ];
      
      for (const pattern of idPatterns) {
        const match = userMessage.match(pattern);
        if (match) {
          // Extract the numeric part, removing Z prefix if present
          const idMatch = match[1] || match[0];
          const cleanId = idMatch.replace(/^z/i, '').trim();
          // Accept any numeric ID (even short ones like "001")
          if (/^\d+$/.test(cleanId) && cleanId.length >= 1) {
            extracted.studentId = cleanId;
            break;
          }
        }
      }
      
      // If message is just numbers and we haven't extracted as name, treat as ID
      // This handles cases like "001", "00111", etc.
      if (!extracted.studentId && !extracted.studentName && /^\d+$/.test(trimmedMessage)) {
        extracted.studentId = trimmedMessage;
      }
    }


    // Email
    if (!currentData.email || (currentData.email && currentData.email.trim() === '')) {
      const emailPattern = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/;
      const match = userMessage.match(emailPattern);
      if (match) {
        extracted.email = match[1];
      }
    }

    // Phone
    if (!currentData.phone || (currentData.phone && currentData.phone.trim() === '')) {
      const phonePattern = /(\d{3}[-.\s]?\d{3}[-.\s]?\d{4})/;
      const match = userMessage.match(phonePattern);
      if (match) {
        extracted.phone = match[1];
      }
    }

    // Advisor name
    if (!currentData.advisorName || (currentData.advisorName && currentData.advisorName.trim() === '')) {
      if (lowerMessage.includes('advisor') || lowerMessage.includes('professor') || lowerMessage.includes('dr.') || lowerMessage.includes('dr ')) {
        const advisorPatterns = [
          /advisor is? ([a-zA-Z\s]+)/i,
          /professor ([a-zA-Z\s]+)/i,
          /dr\.?\s+([a-zA-Z\s]+)/i,
        ];
        
        for (const pattern of advisorPatterns) {
          const match = userMessage.match(pattern);
          if (match && match[1]) {
            extracted.advisorName = match[1].trim();
            break;
          }
        }
        
        // If no pattern match, use the message
        if (!extracted.advisorName) {
          extracted.advisorName = trimmedMessage;
        }
      }
    }

    return extracted;
  }

  // Helper: Build conversational response - ALWAYS acknowledge what user said
  private async buildConversationalResponse(
    userMessage: string,
    extractedData: Partial<FormData>,
    nextField: string,
    session: SessionState
  ): Promise<string> {
    const lowerMessage = userMessage.toLowerCase().trim();
    let acknowledgment = '';
    
    // Check if message is off-topic/conversational first
    if (Object.keys(extractedData).length === 0) {
      // No data extracted - handle conversational messages
      if (/^(hi|hello|hey|greetings|good morning|good afternoon|good evening)/.test(lowerMessage)) {
        acknowledgment = 'Hello! Nice to meet you. ';
      } else if (/^(thanks|thank you|ty|thx|appreciate)/.test(lowerMessage)) {
        acknowledgment = 'You\'re welcome! Happy to help. ';
      } else if (/(how are you|what's up|whats up|wassup)/.test(lowerMessage)) {
        acknowledgment = 'I\'m doing great, thanks for asking! ';
      } else if (/(joke|funny|laugh|lol|haha|hehe)/.test(lowerMessage)) {
        acknowledgment = 'Haha, I appreciate your energy! ';
      } else if (/(confused|don't understand|what|huh|help)/.test(lowerMessage)) {
        acknowledgment = 'No worries at all! I\'m here to help make this easy for you. ';
      } else if (lowerMessage.length < 10) {
        acknowledgment = 'Got it! ';
      } else {
        acknowledgment = 'I hear you! ';
      }
    } else {
      // Data was extracted - acknowledge what we got
      const extractedFields = Object.keys(extractedData);
      
      if (extractedFields.includes('desiredMajor')) {
        const major = (extractedData as any).desiredMajor;
        acknowledgment = `Great choice! ${major} sounds like an excellent program. `;
      } else if (extractedFields.includes('studentName')) {
        const name = extractedData.studentName;
        acknowledgment = `Nice to meet you, ${name}! `;
      } else if (extractedFields.includes('studentId')) {
        acknowledgment = `Perfect, got your ID! `;
      } else if (extractedFields.includes('currentMajor')) {
        acknowledgment = `Got it, so you\'re currently in ${(extractedData as any).currentMajor}. `;
      } else if (extractedFields.includes('email')) {
        acknowledgment = `Awesome, I\'ll use that email to contact you. `;
      } else if (extractedFields.includes('advisorName')) {
        acknowledgment = `Great, ${(extractedData as any).advisorName} is your advisor. `;
      } else {
        acknowledgment = 'Perfect, got that information! ';
      }
    }
    
    // Now ask the next question naturally
    const nextQuestion = await this.generateNextQuestion(nextField, session);
    
    return acknowledgment + nextQuestion;
  }

  // Helper: Generate next question from PDF field analysis
  private async generateNextQuestion(nextField: string, session: SessionState): Promise<string> {
    // Get the field definition from PDF analysis
    const field = session.pdfAnalysis?.fields.find(f => f.name === nextField);
    
    if (field && field.question) {
      return field.question;
    }
    
    // Generate a natural question from the field name or label
    const label = field?.label || nextField;
    const formattedLabel = label.replace(/([A-Z])/g, ' $1').toLowerCase().trim();
    
    return `What is your ${formattedLabel}?`;
  }
}

export const agentService = new AgentService();
