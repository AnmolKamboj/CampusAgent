import { getModel } from '../config/ai.js';
import { FormData, SessionState, FormType, ChangeOfMajorData, AddDropCourseData, DynamicFormData } from '../types.js';
import { formConfigService } from './formConfigService.js';
import { studentDataService } from './studentDataService.js';
import { deadlineService } from './deadlineService.js';
import { formTemplateService } from './formTemplateService.js';

// In-memory session storage (replace with Redis/DB in production)
const sessions = new Map<string, SessionState>();

export class AgentService {
  private model;

  constructor() {
    this.model = getModel();
  }

  // Initialize a new session with form type (supports both FormType and template ID)
  initSession(sessionId: string, formType?: FormType | string): SessionState {
    const session: SessionState = {
      sessionId,
      formData: {},
      formType: formType || FormType.CHANGE_OF_MAJOR, // Now supports string (template ID) or FormType
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

  // Generate welcome message (supports both FormType and template ID)
  async generateWelcome(formType?: FormType | string): Promise<string> {
    if (!formType) {
      // Get all available forms (hardcoded + templates)
      const hardcodedForms = formConfigService.getAllConfigs();
      const templates = formTemplateService.getActiveTemplates();
      
      let welcome = `👋 Hello! I'm your Smart Academic Form & Process Assistant. I can help you with:\n\n`;
      
      // List hardcoded forms
      hardcodedForms.forEach((form, idx) => {
        welcome += `${idx + 1}. **${form.name}** - ${form.description}\n`;
      });
      
      // List template forms
      templates.forEach((template, idx) => {
        welcome += `${hardcodedForms.length + idx + 1}. **${template.name}** - ${template.description || 'Custom form'}\n`;
      });
      
      welcome += `\nWhich form would you like to fill out? (Type the number or form name)`;
      return welcome;
    }

    // Check if it's a template ID (UUID format)
    const isTemplate = typeof formType === 'string' && formType.length === 36 && formType.includes('-');
    
    if (isTemplate) {
      // Handle template-based form
      const template = formTemplateService.getTemplate(formType);
      if (!template) {
        return `Sorry, I couldn't find that form. Please try again.`;
      }
      
      let welcome = `👋 Hello! I'm your Smart Academic Form & Process Assistant. I'm here to help you fill out your **${template.name}** form.\n\n`;
      welcome += `${template.description || 'Custom form'}\n\n`;
      welcome += `I'll guide you through the process step by step and collect all the necessary information. Once we're done, I can generate a filled PDF and an email draft for you.\n\n`;
      
      // Start with the first required field
      const requiredFields = template.requiredFields || [];
      if (requiredFields.length > 0) {
        const firstFieldName = requiredFields[0];
        const firstField = template.fields.find(f => f.name === firstFieldName);
        const question = firstField?.question || `Could you please provide ${firstField?.label || firstFieldName}?`;
        welcome += question;
      }
      
      return welcome;
    }

    // Handle hardcoded form
    const formTypeEnum = formType as FormType;
    const config = formConfigService.getConfig(formTypeEnum);
    const deadlineMsg = deadlineService.getDeadlineStatusMessage(formTypeEnum);
    
    let welcome = `👋 Hello! I'm your Smart Academic Form & Process Assistant. I'm here to help you fill out your **${config?.name}** form.\n\n`;
    welcome += `${config?.description}\n\n`;
    
    if (deadlineMsg) {
      welcome += `${deadlineMsg}\n\n`;
    }
    
    welcome += `I'll guide you through the process step by step and collect all the necessary information. Once we're done, I can generate a filled PDF and an email draft for you.\n\n`;
    
    // Start with the first required field instead of form-specific question
    const requiredFields = config?.requiredFields || [];
    if (requiredFields.length > 0) {
      const firstField = requiredFields[0];
      const question = await this.generateNextQuestion(firstField, {}, formTypeEnum);
      welcome += question;
    }
    
    return welcome;
  }

  // Process user message and generate response (supports both FormType and template ID)
  async processMessage(
    sessionId: string,
    userMessage: string,
    currentFormData: FormData | DynamicFormData,
    formType?: FormType | string,
    useAutoFill?: boolean
  ): Promise<{ message: string; formData: FormData | DynamicFormData; isComplete: boolean; formType: FormType | string; deadline?: Date; deadlineWarning?: boolean }> {
    let session = this.getSession(sessionId);
    if (!session) {
      session = this.initSession(sessionId, formType);
    }

    // Handle form type selection if not set
    if (!session.formType && !formType) {
      const selectedFormType = this.detectFormType(userMessage);
      if (selectedFormType) {
        session.formType = selectedFormType;
        const welcome = await this.generateWelcome(selectedFormType);
        return {
          message: welcome,
          formData: session.formData,
          isComplete: false,
          formType: selectedFormType,
        };
      }
    }

    // Set form type if provided
    if (formType && !session.formType) {
      session.formType = formType;
    }

    // Merge current form data from frontend with session form data
    // This ensures we don't lose any previously collected information
    const mergedFormData = { ...session.formData, ...currentFormData };

    // Auto-fill if requested and student ID is available
    // Only auto-fill for hardcoded forms (FormType enum), not template-based forms
    if (useAutoFill && mergedFormData.studentId && typeof session.formType !== 'string') {
      const autoFilled = await studentDataService.autoFillFormData(
        session.formType as FormType,
        mergedFormData.studentId,
        true,
        mergedFormData
      );
      Object.assign(mergedFormData, autoFilled);
    }

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

    // Update session with merged form data (ensure we keep all extracted data)
    session.formData = { ...session.formData, ...reflectionResult.formData };
    session.conversationHistory.push({
      role: 'agent',
      content: reflectionResult.message,
      timestamp: new Date(),
    });
    
    // Ensure formData in response includes all session data
    reflectionResult.formData = session.formData;

    // Check deadline (only for hardcoded forms, not template-based)
    let deadline: Date | null = null;
    let deadlineWarning = false;
    if (typeof session.formType !== 'string') {
      deadline = deadlineService.getDeadline(session.formType as FormType);
      deadlineWarning = deadline ? deadlineService.checkDeadlineWarning(session.formType as FormType, 7) : false;
    }

    sessions.set(sessionId, session);

    return {
      message: reflectionResult.message,
      formData: session.formData,
      isComplete: reflectionResult.isComplete,
      formType: session.formType,
      deadline: deadline || undefined,
      deadlineWarning,
    };
  }

  // Detect form type from user message
  private detectFormType(message: string): FormType | null {
    const lower = message.toLowerCase();
    if (lower.includes('change of major') || lower.includes('change major') || lower.includes('switch major') || message === '1') {
      return FormType.CHANGE_OF_MAJOR;
    }
    if (lower.includes('graduation') || lower.includes('graduate') || message === '2') {
      return FormType.GRADUATION_APPLICATION;
    }
    if (lower.includes('add') && lower.includes('drop') || lower.includes('add/drop') || message === '3') {
      return FormType.ADD_DROP_COURSE;
    }
    return null;
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

  // PLAN: Determine next steps (this will be recalculated after extraction)
  private async plan(reasoningResult: any): Promise<any> {
    const { session, formData } = reasoningResult;
    const formType = session.formType || FormType.CHANGE_OF_MAJOR;

    // Determine what fields are required for this form type
    let requiredFields: string[] = ['studentName', 'studentId'];
    
    if (formType === FormType.CHANGE_OF_MAJOR) {
      requiredFields = ['studentName', 'studentId', 'currentMajor', 'desiredMajor', 'advisorName'];
    } else if (formType === FormType.GRADUATION_APPLICATION) {
      requiredFields = ['studentName', 'studentId', 'expectedGraduationDate', 'degreeType'];
    } else if (formType === FormType.ADD_DROP_COURSE) {
      requiredFields = ['studentName', 'studentId', 'courseAction', 'courseName', 'courseCode'];
    }
    
    // Determine what field we should be asking for next (before extraction)
    let nextField = null;
    for (const field of requiredFields) {
      if (!formData[field] || (formData[field] && formData[field].trim() === '')) {
        nextField = field;
        break;
      }
    }

    return {
      ...reasoningResult,
      formType,
      nextField,  // What field we're currently asking for
      missingFields: requiredFields.filter(f => !formData[f] || formData[f].trim() === ''),
    };
  }

  // ACT: Generate response and extract data
  private async act(planResult: any): Promise<any> {
    const { session, userMessage, formData, aiAnalysis, formType, nextField: askedField } = planResult;
    
    // Extract data from user message FIRST (pass askedField for context)
    const extractedData = await this.extractFormData(userMessage, formData, aiAnalysis, formType, askedField);
    
    // Merge extracted data
    const updatedFormData = { ...formData, ...extractedData };
    
    // NOW calculate missing fields AFTER extraction
    // Check if this is a template-based form
    const isTemplate = typeof formType === 'string' && formType.length === 36 && formType.includes('-');
    let requiredFields: string[] = [];
    let formName = 'form';
    
    if (isTemplate) {
      const template = formTemplateService.getTemplate(formType);
      if (template) {
        requiredFields = template.requiredFields || [];
        formName = template.name;
      }
    } else {
      const config = formConfigService.getConfig(formType as FormType);
      requiredFields = config?.requiredFields || [];
      formName = config?.name || 'form';
    }
    
    const missingFields: string[] = [];
    
    for (const field of requiredFields) {
      const value = (updatedFormData as any)[field];
      // Check if field is empty or just whitespace
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        missingFields.push(field);
      }
    }
    
    const nextField = missingFields[0] || null;
    
    // Generate next question or completion message
    let responseMessage: string;
    
    if (missingFields.length === 0) {
      responseMessage = `Perfect! I have all the information I need for your ${formName}.\n\n`;
      
      // Show collected information based on form type
      if (isTemplate) {
        const template = formTemplateService.getTemplate(formType);
        if (template) {
          // Show all collected fields
          template.fields.forEach(field => {
            const value = (updatedFormData as any)[field.name];
            if (value !== undefined && value !== null && value !== '') {
              responseMessage += `✓ ${field.label}: ${value}\n`;
            }
          });
        }
      } else if (session.formType === FormType.CHANGE_OF_MAJOR) {
        const data = updatedFormData as any;
        responseMessage += `✓ Student Name: ${data.studentName}\n` +
          `✓ Student ID: ${data.studentId}\n` +
          `✓ Current Major: ${data.currentMajor}\n` +
          `✓ Desired Major: ${data.desiredMajor}\n` +
          `✓ Advisor: ${data.advisorName}\n` +
          `✓ Department: ${data.department}\n` +
          `✓ Email: ${data.email}\n`;
        if (data.reason) responseMessage += `✓ Reason: ${data.reason}\n`;
      } else if (session.formType === FormType.GRADUATION_APPLICATION) {
        const data = updatedFormData as any;
        responseMessage += `✓ Student Name: ${data.studentName}\n` +
          `✓ Student ID: ${data.studentId}\n` +
          `✓ Expected Graduation Date: ${data.expectedGraduationDate}\n` +
          `✓ Degree Type: ${data.degreeType}\n` +
          `✓ Major: ${data.major}\n`;
        if (data.minor) responseMessage += `✓ Minor: ${data.minor}\n`;
        if (data.honorsProgram) responseMessage += `✓ Honors Program: Yes\n`;
        responseMessage += `✓ Advisor: ${data.advisorName}\n` +
          `✓ Email: ${data.email}\n`;
      } else if (session.formType === FormType.ADD_DROP_COURSE) {
        const data = updatedFormData as any;
        responseMessage += `✓ Student Name: ${data.studentName}\n` +
          `✓ Student ID: ${data.studentId}\n` +
          `✓ Semester: ${data.semester}\n` +
          `✓ Year: ${data.year}\n`;
        if (data.coursesToAdd?.length) {
          responseMessage += `✓ Courses to Add: ${data.coursesToAdd.map((c: any) => c.courseCode).join(', ')}\n`;
        }
        if (data.coursesToDrop?.length) {
          responseMessage += `✓ Courses to Drop: ${data.coursesToDrop.map((c: any) => c.courseCode).join(', ')}\n`;
        }
        responseMessage += `✓ Email: ${data.email}\n`;
      }
      
      responseMessage += `\nYou can now:\n` +
        `📄 Click "Download PDF" to get your filled form\n` +
        `📧 Click "Generate Email" to create a submission email`;
    } else if (nextField) {
      // ALWAYS build a conversational response - acknowledge what they said
      responseMessage = await this.buildConversationalResponse(
        userMessage,
        extractedData, 
        nextField,
        updatedFormData,
        formType
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
    const formType = session.formType || FormType.CHANGE_OF_MAJOR;
    // Only get config for hardcoded forms (FormType enum)
    const config = typeof formType !== 'string' ? formConfigService.getConfig(formType as FormType) : null;
    const formName = config?.name || 'form';
    
    let fieldList = '';
    if (formType === FormType.CHANGE_OF_MAJOR) {
      fieldList = 'studentName, studentId, currentMajor, desiredMajor, advisorName, department, email, phone, reason';
    } else if (formType === FormType.GRADUATION_APPLICATION) {
      fieldList = 'studentName, studentId, expectedGraduationDate, degreeType, major, minor, honorsProgram, thesisTitle, advisorName, department, email, phone';
    } else if (formType === FormType.ADD_DROP_COURSE) {
      fieldList = 'studentName, studentId, semester, year, coursesToAdd, coursesToDrop, reason, advisorName, email, phone';
    }
    
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
    formType?: FormType,
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
      /^(lol|haha|hehe|lmao|xd|😂|😄|😊)$/i,
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
      
      // If asking for currentMajor, treat response as current major
      if (nextFieldAsked === 'currentMajor' && formType === FormType.CHANGE_OF_MAJOR) {
        (extracted as any).currentMajor = trimmedMessage;
        return extracted;
      }
      
      // If asking for desiredMajor, treat response as desired major
      if (nextFieldAsked === 'desiredMajor' && formType === FormType.CHANGE_OF_MAJOR) {
        (extracted as any).desiredMajor = trimmedMessage;
        return extracted;
      }
      
      // If asking for email, advisorName, department, etc., use the response directly
      if (nextFieldAsked === 'advisorName' || nextFieldAsked === 'department') {
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

    // Desired major (if not yet set) - only for Change of Major
    if (formType === FormType.CHANGE_OF_MAJOR) {
      const changeMajorData = currentData as ChangeOfMajorData;
      if (!changeMajorData.desiredMajor || (changeMajorData.desiredMajor && changeMajorData.desiredMajor.trim() === '')) {
        // Enhanced major detection - much more flexible
        const majorKeywords = [
          'computer science', 'biology', 'psychology', 'engineering', 'mathematics', 
          'physics', 'chemistry', 'english', 'history', 'business', 'economics',
          'cs', 'compsci', 'comp sci', 'computer', 'science', 'math', 'statistics',
          'accounting', 'finance', 'marketing', 'management', 'nursing', 'education',
          'master', 'bachelor', 'phd', 'doctorate', 'mba', 'ms', 'bs', 'ba', 'ma'
        ];
        
        // Check if message contains major keywords - improved extraction
        let foundMajor = false;
        for (const keyword of majorKeywords) {
          if (lowerMessage.includes(keyword)) {
            // Just use the whole message as the major (includes "Master in Computer Science", etc.)
            (extracted as ChangeOfMajorData).desiredMajor = trimmedMessage;
            foundMajor = true;
            break;
          }
        }
        
        // If no keyword match but message looks like a major name (capitalized words, 3+ words, no numbers)
        // This handles things like "Software Engineering" or "Information Technology"
        if (!foundMajor && 
            /^[A-Z][a-zA-Z]+(\s+[A-Za-z]+)+$/.test(trimmedMessage) && 
            !/\d/.test(trimmedMessage) &&
            trimmedMessage.length > 5 &&
            trimmedMessage.split(' ').length >= 2) {
          (extracted as ChangeOfMajorData).desiredMajor = trimmedMessage;
        }
      }

      // Current major (only for Change of Major)
      if (!changeMajorData.currentMajor || (changeMajorData.currentMajor && changeMajorData.currentMajor.trim() === '')) {
        if (lowerMessage.includes('current') || lowerMessage.includes('my major is') || lowerMessage.includes('i study')) {
          // Try to extract the major after "current major is" or similar
          const currentMajorPatterns = [
            /current major is? ([a-zA-Z\s]+)/i,
            /my major is ([a-zA-Z\s]+)/i,
            /i study ([a-zA-Z\s]+)/i,
          ];
          
          for (const pattern of currentMajorPatterns) {
            const match = userMessage.match(pattern);
            if (match && match[1]) {
              (extracted as ChangeOfMajorData).currentMajor = match[1].trim();
          break;
            }
          }
          
          // If no pattern match but contains "current", use the message
          if (!(extracted as ChangeOfMajorData).currentMajor) {
            (extracted as ChangeOfMajorData).currentMajor = trimmedMessage;
          }
        }
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

    // Department (only for Change of Major and Graduation)
    if (formType === FormType.CHANGE_OF_MAJOR || formType === FormType.GRADUATION_APPLICATION) {
      const changeMajorData = currentData as ChangeOfMajorData;
      if (!changeMajorData.department || (changeMajorData.department && changeMajorData.department.trim() === '')) {
        if (lowerMessage.includes('department')) {
          const deptPattern = /department is? ([a-zA-Z\s]+)/i;
          const match = userMessage.match(deptPattern);
          if (match && match[1]) {
            (extracted as ChangeOfMajorData).department = match[1].trim();
          } else {
            (extracted as ChangeOfMajorData).department = trimmedMessage;
          }
        }
      }
    }

    // Reason (usually longer text) - for Change of Major and Add/Drop Course
    if (formType === FormType.CHANGE_OF_MAJOR || formType === FormType.ADD_DROP_COURSE) {
      const changeMajorData = currentData as ChangeOfMajorData;
      const addDropData = currentData as AddDropCourseData;
      const reason = formType === FormType.CHANGE_OF_MAJOR ? changeMajorData.reason : addDropData.reason;
      
      if (!reason || (reason && reason.trim() === '')) {
        // If message is longer and doesn't match other patterns, it might be a reason
        if (userMessage.length > 20 && !extracted.studentName && !extracted.studentId && !extracted.email) {
          if (formType === FormType.CHANGE_OF_MAJOR) {
            (extracted as ChangeOfMajorData).reason = trimmedMessage;
          } else {
            (extracted as AddDropCourseData).reason = trimmedMessage;
          }
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
    formData: FormData,
    formType?: FormType | string
  ): Promise<string> {
    const lowerMessage = userMessage.toLowerCase().trim();
    let acknowledgment = '';
    
    // Check if message is off-topic/conversational first
    if (Object.keys(extractedData).length === 0) {
      // No data extracted - handle conversational messages
      if (/^(hi|hello|hey|greetings|good morning|good afternoon|good evening)/.test(lowerMessage)) {
        acknowledgment = '👋 Hello there! Nice to meet you! ';
      } else if (/^(thanks|thank you|ty|thx|appreciate)/.test(lowerMessage)) {
        acknowledgment = '😊 You\'re very welcome! Happy to help! ';
      } else if (/(how are you|what's up|whats up|wassup)/.test(lowerMessage)) {
        acknowledgment = '😊 I\'m doing great, thanks for asking! ';
      } else if (/(joke|funny|laugh|lol|haha|hehe)/.test(lowerMessage)) {
        acknowledgment = '😄 Haha, I love your energy! ';
      } else if (/(confused|don't understand|what|huh|help)/.test(lowerMessage)) {
        acknowledgment = '🤔 No worries at all! I\'m here to help make this easy for you. ';
      } else if (lowerMessage.length < 10) {
        acknowledgment = '😊 Got it! ';
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
    const nextQuestion = await this.generateNextQuestion(nextField, formData, formType);
    
    return acknowledgment + nextQuestion;
  }

  // Helper: Generate next question (supports both FormType and template ID)
  private async generateNextQuestion(nextField: string, _formData: FormData | DynamicFormData, formType?: FormType | string): Promise<string> {
    // Check if it's a template
    const isTemplate = typeof formType === 'string' && formType.length === 36 && formType.includes('-');
    
    if (isTemplate) {
      const template = formTemplateService.getTemplate(formType);
      if (template) {
        const field = template.fields.find(f => f.name === nextField);
        if (field && field.question) {
          return field.question;
        }
        // Fallback for template fields without questions
        return `Could you please provide ${field?.label || nextField}?`;
      }
    }
    
    // Hardcoded questions for hardcoded forms - natural and conversational
    const formTypeEnum = formType as FormType;
    const questions: Record<string, Record<FormType, string>> = {
      'desiredMajor': {
        [FormType.CHANGE_OF_MAJOR]: 'What major are you thinking of switching to? 🎓',
        [FormType.GRADUATION_APPLICATION]: '',
        [FormType.ADD_DROP_COURSE]: '',
      },
      'studentName': {
        [FormType.CHANGE_OF_MAJOR]: 'What\'s your full name?',
        [FormType.GRADUATION_APPLICATION]: 'What\'s your full name?',
        [FormType.ADD_DROP_COURSE]: 'What\'s your full name?',
      },
      'studentId': {
        [FormType.CHANGE_OF_MAJOR]: 'And what\'s your student ID? (You can include the Z if you have one)',
        [FormType.GRADUATION_APPLICATION]: 'What\'s your student ID? (You can include the Z if you have one)',
        [FormType.ADD_DROP_COURSE]: 'What\'s your student ID? (You can include the Z if you have one)',
      },
      'currentMajor': {
        [FormType.CHANGE_OF_MAJOR]: 'What major are you in right now? 📚',
        [FormType.GRADUATION_APPLICATION]: '',
        [FormType.ADD_DROP_COURSE]: '',
      },
      'expectedGraduationDate': {
        [FormType.CHANGE_OF_MAJOR]: '',
        [FormType.GRADUATION_APPLICATION]: '📅 What is your expected graduation date? (e.g., "Spring 2024" or "May 2024")',
        [FormType.ADD_DROP_COURSE]: '',
      },
      'degreeType': {
        [FormType.CHANGE_OF_MAJOR]: '',
        [FormType.GRADUATION_APPLICATION]: '🎓 What type of degree? (Bachelor\'s, Master\'s, Doctorate, etc.)',
        [FormType.ADD_DROP_COURSE]: '',
      },
      'major': {
        [FormType.CHANGE_OF_MAJOR]: '',
        [FormType.GRADUATION_APPLICATION]: '📚 What is your major?',
        [FormType.ADD_DROP_COURSE]: '',
      },
      'semester': {
        [FormType.CHANGE_OF_MAJOR]: '',
        [FormType.GRADUATION_APPLICATION]: '',
        [FormType.ADD_DROP_COURSE]: '📅 What semester? (Fall, Spring, Summer)',
      },
      'year': {
        [FormType.CHANGE_OF_MAJOR]: '',
        [FormType.GRADUATION_APPLICATION]: '',
        [FormType.ADD_DROP_COURSE]: '📅 What year? (e.g., 2024)',
      },
      'advisorName': {
        [FormType.CHANGE_OF_MAJOR]: 'Who\'s your academic advisor? 👨‍🏫',
        [FormType.GRADUATION_APPLICATION]: 'Who\'s your academic advisor? 👨‍🏫',
        [FormType.ADD_DROP_COURSE]: 'Who\'s your academic advisor? 👨‍🏫',
      },
      'department': {
        [FormType.CHANGE_OF_MAJOR]: 'Which department is that major in? (like "Computer Science Department")',
        [FormType.GRADUATION_APPLICATION]: 'Which department?',
        [FormType.ADD_DROP_COURSE]: '',
      },
      'email': {
        [FormType.CHANGE_OF_MAJOR]: 'What\'s the best email to reach you at? 📧',
        [FormType.GRADUATION_APPLICATION]: 'What\'s the best email to reach you at? 📧',
        [FormType.ADD_DROP_COURSE]: 'What\'s the best email to reach you at? 📧',
      },
      'phone': {
        [FormType.CHANGE_OF_MAJOR]: 'Got a phone number? (Totally optional)',
        [FormType.GRADUATION_APPLICATION]: 'Got a phone number? (Totally optional)',
        [FormType.ADD_DROP_COURSE]: 'Got a phone number? (Totally optional)',
      },
      'reason': {
        [FormType.CHANGE_OF_MAJOR]: 'Finally, could you share why you want to make this change? Just a quick explanation is fine! 💭',
        [FormType.GRADUATION_APPLICATION]: '',
        [FormType.ADD_DROP_COURSE]: 'Mind sharing why you\'re making these course changes? (Optional)',
      },
    };

    const formTypeToUse = formTypeEnum || FormType.CHANGE_OF_MAJOR;
    const question = questions[nextField]?.[formTypeToUse];
    
    if (question) {
      return question;
    }
    
    // Fallback
    return `Could you please provide your ${nextField.replace(/([A-Z])/g, ' $1').toLowerCase()}?`;
  }
}

export const agentService = new AgentService();
