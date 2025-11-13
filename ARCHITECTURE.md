# 🏛️ CampusAgent Architecture

This document provides a detailed overview of the CampusAgent architecture, design decisions, and technical implementation.

---

## System Overview

CampusAgent is a full-stack web application that uses AI to help students fill out academic forms through natural conversation.

```
┌─────────────┐      ┌─────────────┐      ┌──────────────┐
│   Browser   │ ──── │   Backend   │ ──── │  AI Service  │
│  (React)    │ HTTP │  (Express)  │ API  │ (OpenAI/     │
└─────────────┘      └─────────────┘      │  Gemini)     │
      │                     │              └──────────────┘
      │                     │
      ▼                     ▼
  Local State         In-Memory Store
  (useState)          (Sessions Map)
                          │
                          ▼
                    File Storage
                    (PDF Templates)
```

---

## Frontend Architecture

### Technology Stack

- **React 18** - UI library with hooks
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **Axios** - HTTP client
- **Lucide React** - Icon library

### Component Hierarchy

```
App
├── Sidebar
│   ├── FormField (multiple)
│   └── Action Buttons
└── ChatContainer
    ├── ChatMessage (multiple)
    └── ChatInput
```

### State Management

**Approach:** React useState hooks (no Redux/Zustand needed for MVP)

**State Location:**
- `App.tsx` - Central state management
  - `sessionId` - Current session identifier
  - `messages` - Conversation history
  - `formData` - Collected form information
  - `formType` - Current form type (FormType enum or template ID string)
  - `isLoading` - Loading state
  - `showAdmin` - Admin panel visibility

**Data Flow:**
```
User Input → ChatInput → App.handleSendMessage 
  → API Call → Update State → Re-render Components
```

### API Client Layer

**Location:** `frontend/src/api/client.ts`

**Design:**
- Centralized Axios instance
- Typed request/response interfaces
- Error handling at client level
- Automatic baseURL configuration

**Endpoints:**
```typescript
chatApi.getForms()               // GET /api/chat/forms
chatApi.startNewSession(...)    // POST /api/chat/start
chatApi.sendMessage(...)         // POST /api/chat
chatApi.generatePdf(...)         // POST /api/pdf/generate
chatApi.generateEmail(...)       // POST /api/email/generate

adminApi.getForms()              // GET /api/admin/forms
adminApi.uploadForm(...)         // POST /api/admin/forms/upload
adminApi.updateForm(...)         // PATCH /api/admin/forms/:id
adminApi.deleteForm(...)         // DELETE /api/admin/forms/:id
adminApi.toggleForm(...)         // PATCH /api/admin/forms/:id/toggle
```

### Component Design Patterns

#### 1. Container/Presentational Pattern

**ChatContainer** (Container)
- Manages message list state
- Handles scrolling behavior
- Coordinates child components

**ChatMessage** (Presentational)
- Pure component
- Receives props only
- No state management
- Reusable and testable

#### 2. Controlled Components

**ChatInput**
- Controlled input (value from state)
- Keyboard event handling
- Disabled state during loading

#### 3. Composition

**Sidebar** composes **FormField**
- Flexible and reusable
- Easy to add new fields
- Consistent styling

---

## Backend Architecture

### Technology Stack

- **Node.js** - Runtime
- **Express** - Web framework
- **TypeScript** - Type safety
- **OpenAI or Gemini AI** - Language model (auto-detects)
- **pdf-lib** - PDF generation and filling
- **pdf-parse** - PDF text extraction and analysis
- **multer** - File upload handling

### Application Structure

```
Express App
├── Middleware (CORS, JSON parsing, file upload)
├── Routes
│   ├── /api/chat
│   ├── /api/pdf
│   ├── /api/email
│   └── /api/admin
└── Services
    ├── AgentService
    ├── PdfService
    ├── EmailService
    ├── FormConfigService
    ├── FormTemplateService
    ├── PdfAnalysisService
    ├── PdfFillService
    ├── StudentDataService
    └── DeadlineService
```

### Design Patterns

#### 1. Service Layer Pattern

**Benefits:**
- Separation of concerns
- Testable business logic
- Reusable across routes
- Easy to mock for testing

**Services:**
```
AgentService         → Handles AI conversation logic (RAPR pattern)
PdfService          → Handles PDF generation (hardcoded forms)
EmailService        → Handles email drafting
FormConfigService   → Manages hardcoded form configurations
FormTemplateService → Manages uploaded PDF form templates
PdfAnalysisService  → Analyzes uploaded PDFs to extract fields
PdfFillService      → Fills template-based PDFs with data
StudentDataService  → Handles student data auto-fill (with consent)
DeadlineService     → Tracks form submission deadlines
```

#### 2. Session Management

**Current:** In-memory Map
```typescript
const sessions = new Map<string, SessionState>();
```

**Production Consideration:**
- Replace with Redis for scalability
- Add session expiration
- Enable multiple server instances

#### 3. Error Handling

**Layers:**
1. Try-catch in route handlers
2. Service-level error handling
3. Global error middleware
4. Graceful degradation

---

## Agent Workflow (RAPR Pattern)

The heart of CampusAgent is its agentic workflow.

### Four Phases

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  REASON  │ ──>│   PLAN   │ ──>│   ACT    │ ──>│ REFLECT  │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
```

### Phase 1: REASON

**Goal:** Understand user intent and extract information

**Process:**
1. Receive user message
2. Build context prompt with current form data
3. Call Gemini AI for analysis
4. Extract insights about user intent

**Output:** Analysis of what the user provided

### Phase 2: PLAN

**Goal:** Determine what to do next

**Process:**
1. Check which fields are still missing
2. Prioritize next field to collect
3. Determine if form is complete

**Output:** Next action plan

### Phase 3: ACT

**Goal:** Execute the plan

**Process:**
1. Extract data from user message (regex + AI)
2. Update form data
3. Generate next question or completion message

**Output:** Updated form data + response message

### Phase 4: REFLECT

**Goal:** Validate and finalize

**Process:**
1. Validate extracted data
2. Check form completeness
3. Determine next state

**Output:** Final response to user

### Data Extraction Strategy

**Hybrid Approach:** Regex + AI

**Pattern Matching (Fast):**
```typescript
// Email: regex pattern
/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/

// Phone: regex pattern
/(\d{3}[-.\s]?\d{3}[-.\s]?\d{4})/

// Student ID: regex pattern
/z[\s-]?(\d{8})/i
```

**AI Analysis (Flexible):**
- Complex field extraction
- Context understanding
- Validation logic

---

## PDF Generation

### Library: pdf-lib

**Why pdf-lib?**
- Pure JavaScript (no native dependencies)
- Works in Node.js
- Programmatic PDF creation
- Font embedding support

### PDF Structure

```
┌─────────────────────────────────────┐
│  CHANGE OF MAJOR REQUEST FORM       │
│  ─────────────────────────────────  │
│                                     │
│  STUDENT INFORMATION                │
│  • Student Name: [value]            │
│  • Student ID: [value]              │
│  • Email: [value]                   │
│                                     │
│  MAJOR CHANGE REQUEST               │
│  • Current Major: [value]           │
│  • Desired Major: [value]           │
│                                     │
│  REASON FOR CHANGE                  │
│  [text block]                       │
│                                     │
│  SIGNATURES                         │
│  Student: ___________  Date: ____   │
│  Advisor: ___________  Date: ____   │
└─────────────────────────────────────┘
```

### PDF Generation Flow

```
FormData → PdfService.generateChangeOfMajorPdf()
  → Create PDF Document
  → Add Pages
  → Embed Fonts
  → Draw Text
  → Return Buffer
  → Send to Client
```

---

## Email Generation

### AI-Powered Drafting

**Process:**
1. Collect form data
2. Build structured prompt
3. Call Gemini AI
4. Generate formal email
5. Return draft to user

**Prompt Structure:**
```
Context: Student submitting Change of Major
Data: [form fields]
Task: Generate professional email
Requirements:
  - Subject line
  - Formal greeting
  - Clear request
  - Reason statement
  - Professional closing
```

**Fallback:** Template-based email if AI fails

---

## Data Flow

### Complete User Journey

```
1. User opens app
   → Frontend calls /api/chat/start
   → Backend returns welcome message
   → Frontend displays in chat

2. User types message
   → Frontend sends to /api/chat
   → Backend: REASON → PLAN → ACT → REFLECT
   → Backend returns response + updated form data
   → Frontend updates state and UI

3. Form complete
   → User clicks "Download PDF"
   → Frontend calls /api/pdf/generate
   → Backend generates PDF
   → Frontend downloads file

4. User clicks "Generate Email"
   → Frontend calls /api/email/generate
   → Backend uses AI to create draft
   → Frontend displays email
```

---

## Security Considerations

### Current Implementation

1. **API Key Security**
   - Stored in environment variables
   - Never exposed to frontend
   - Backend-only access

2. **CORS**
   - Configured for local development
   - Should be restricted in production

3. **Input Validation**
   - Type checking with TypeScript
   - Basic format validation (email, phone)
   - Should add sanitization

### Production Recommendations

1. **Authentication**
   - Add user authentication (JWT)
   - Session management
   - Rate limiting

2. **Input Sanitization**
   - Sanitize all user inputs
   - Prevent XSS attacks
   - Validate file uploads

3. **HTTPS**
   - Use HTTPS in production
   - Secure cookie flags
   - HSTS headers

4. **Rate Limiting**
   - Prevent API abuse
   - Protect Gemini API quota
   - DDoS protection

---

## Performance Considerations

### Frontend Optimization

1. **Component Rendering**
   - React.memo for expensive components
   - useCallback for event handlers
   - useMemo for computed values

2. **Code Splitting**
   - Lazy loading for routes
   - Dynamic imports
   - Smaller bundle sizes

3. **Asset Optimization**
   - Image optimization
   - Font subsetting
   - CSS purging (Tailwind)

### Backend Optimization

1. **Session Storage**
   - Current: In-memory (fast, not scalable)
   - Production: Redis (fast + scalable)

2. **AI Calls**
   - Cache common responses
   - Batch requests where possible
   - Implement retry logic

3. **PDF Generation**
   - Consider caching generated PDFs
   - Stream large PDFs
   - Async processing for large forms

---

## Scalability

### Current Limitations

- In-memory session storage (single instance)
- No database (loses data on restart)
- Synchronous PDF generation
- No caching layer

### Scaling Strategy

**Horizontal Scaling:**
```
Load Balancer
├── App Instance 1 ─┐
├── App Instance 2 ─┼──> Redis (Sessions)
└── App Instance 3 ─┘

All instances can share sessions via Redis
```

**Database Integration:**
```
PostgreSQL
├── Users table
├── Sessions table
├── Forms table
└── FormSubmissions table
```

**Caching Layer:**
```
Redis
├── Session data
├── AI response cache
└── Frequently accessed data
```

---

## Future Architecture

### Microservices Approach

```
┌──────────────┐
│   Frontend   │
└──────┬───────┘
       │
┌──────▼───────────────────────────┐
│      API Gateway (Express)        │
└──────┬───────────────────────────┘
       │
       ├──> Chat Service (AI logic)
       ├──> PDF Service (Generation)
       ├──> Email Service (Drafting)
       ├──> Auth Service (Users)
       └──> Storage Service (Files)
```

### Event-Driven Architecture

```
User Action → Event Bus → Multiple Services
                │
                ├──> Logging Service
                ├──> Analytics Service
                └──> Notification Service
```

---

## Testing Strategy

### Unit Tests

**Frontend:**
- Component rendering
- Event handlers
- State management
- API client

**Backend:**
- Service methods
- Data extraction logic
- Validation functions
- Route handlers

### Integration Tests

- API endpoints
- Service interactions
- Database operations

### E2E Tests

- Complete user flows
- Form filling process
- PDF generation
- Error scenarios

---

## Monitoring & Logging

### Logging Levels

```
ERROR   - Critical failures
WARN    - Degraded functionality
INFO    - Important events
DEBUG   - Detailed information
```

### What to Log

- API requests/responses
- AI calls (input/output)
- Errors and stack traces
- Performance metrics
- User actions

### Tools (Production)

- **Application:** Winston, Pino
- **Infrastructure:** DataDog, New Relic
- **Errors:** Sentry
- **Analytics:** Google Analytics, Mixpanel

---

## Deployment Architecture

### Development

```
localhost:3000 (Frontend) ──> localhost:5000 (Backend)
```

### Production

```
CDN (Frontend Assets)
  ↓
Vercel/Netlify (Static Hosting)
  ↓ API Calls
Railway/Heroku (Backend)
  ↓
Gemini AI API
```

---

## Design Decisions

### Why React Hooks (No Redux)?

**Reasoning:**
- Simple state management needs
- Local state sufficient for MVP
- Reduced complexity
- Better performance for small apps

### Why Express (Not Fastify)?

**Reasoning:**
- Larger ecosystem
- Better documentation
- More tutorials/examples
- Easier for beginners

### Why In-Memory Sessions (No Database)?

**Reasoning:**
- MVP/prototype stage
- Faster development
- No infrastructure setup needed
- Easy to replace later

### Why pdf-lib (Not PDFKit)?

**Reasoning:**
- No native dependencies
- Works in browser too
- Modern API
- TypeScript support

---

## Conclusion

CampusAgent is designed with:
- **Simplicity** - Easy to understand and extend
- **Modularity** - Clean separation of concerns
- **Flexibility** - Ready to scale and add features
- **Best Practices** - Following industry standards

The architecture supports both rapid prototyping and future growth.

---

**Questions? Check the README or open an issue!**

