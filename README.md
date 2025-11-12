# 🏫 CampusAgent

An intelligent AI assistant that helps university students complete complex academic forms through natural conversation. CampusAgent supports multiple form types (Change of Major, Graduation Application, Add/Drop Course) and custom uploaded forms. It guides students step-by-step, validates inputs, and generates both filled PDFs and ready-to-send emails.

---

## ✨ Features

- 🤖 **AI-Powered Conversational Interface** - Natural dialogue powered by OpenAI or Google Gemini AI
- 📝 **Smart Form Filling** - Automatically extracts and validates information from conversation
- 📄 **PDF Generation** - Creates professional, filled PDF forms ready for submission
- 📧 **Email Draft Generation** - Generates formal submission emails
- 🎨 **Modern UI** - Beautiful, responsive interface built with React and Tailwind CSS
- 🔄 **Real-time Progress Tracking** - Visual display of collected information
- 🧠 **Agentic Workflow** - Implements Reason → Plan → Act → Reflect pattern
- 📋 **Multiple Form Types** - Supports Change of Major, Graduation Application, and Add/Drop Course forms
- 🎯 **Custom Form Templates** - Upload and manage custom PDF forms via Admin Panel
- 🤖 **Auto-fill Capabilities** - Optional student data auto-fill with consent
- ⏰ **Deadline Tracking** - Automatic deadline reminders for form submissions
- 🔧 **Admin Panel** - Upload, manage, and configure form templates

---

## 🏗️ Architecture

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for modern, responsive UI
- **Axios** for API communication
- **Lucide React** for icons

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **OpenAI or Google Gemini AI** for intelligent conversation and reasoning (auto-detects available API)
- **pdf-lib** for PDF generation and filling
- **pdf-parse** for PDF analysis
- **multer** for file uploads
- RESTful API architecture
- Session management with in-memory storage

### Agent Workflow
The agent follows a sophisticated 4-phase workflow for each interaction:

1. **REASON** - Understand user intent and extract information from their message
2. **PLAN** - Determine what information is still needed and what to ask next
3. **ACT** - Generate response, extract data, and update form state
4. **REFLECT** - Validate information and determine if form is complete

---

## 📁 Project Structure

```
CampusAgent/
├── frontend/                  # React frontend application
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── ChatContainer.tsx
│   │   │   ├── ChatMessage.tsx
│   │   │   ├── ChatInput.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── FormSelector.tsx
│   │   │   └── AdminPanel.tsx
│   │   ├── api/              # API client
│   │   │   └── client.ts
│   │   ├── types.ts          # TypeScript types
│   │   ├── App.tsx           # Main app component
│   │   ├── main.tsx          # Entry point
│   │   └── index.css         # Global styles
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── tsconfig.json
│
├── backend/                   # Node.js backend API
│   ├── src/
│   │   ├── config/           # Configuration
│   │   │   ├── ai.ts         # Unified AI interface (OpenAI/Gemini)
│   │   │   ├── gemini.ts
│   │   │   └── openai.ts
│   │   ├── services/         # Business logic
│   │   │   ├── agentService.ts
│   │   │   ├── pdfService.ts
│   │   │   ├── emailService.ts
│   │   │   ├── formConfigService.ts
│   │   │   ├── formTemplateService.ts
│   │   │   ├── pdfAnalysisService.ts
│   │   │   ├── pdfFillService.ts
│   │   │   ├── studentDataService.ts
│   │   │   └── deadlineService.ts
│   │   ├── routes/           # API routes
│   │   │   ├── chat.ts
│   │   │   ├── pdf.ts
│   │   │   ├── email.ts
│   │   │   └── admin.ts
│   │   ├── types.ts          # TypeScript types
│   │   └── server.ts         # Express server
│   ├── package.json
│   └── tsconfig.json
│
├── storage/                   # File storage
│   └── forms/                 # Uploaded form templates
│
├── package.json              # Root package for monorepo
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **Google Gemini API Key** - Get one from [Google AI Studio](https://makersuite.google.com/app/apikey)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd CampusAgent
   ```

2. **Install all dependencies**
   ```bash
   npm run install:all
   ```

3. **Set up environment variables**

   Create `backend/.env` file:
   ```env
   PORT=5000
   
   # You need at least ONE of these AI API keys:
   OPENAI_API_KEY=your_openai_api_key_here
   # OR
   GEMINI_API_KEY=your_gemini_api_key_here
   
   NODE_ENV=development
   ```
   
   **Get API Keys:**
   - OpenAI: https://platform.openai.com/api-keys
   - Gemini: https://makersuite.google.com/app/apikey
   
   **Note:** The app will use OpenAI if available, otherwise fall back to Gemini.

   Optionally create `frontend/.env` (if not using default):
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

4. **Start development servers**
   ```bash
   npm run dev
   ```

   This runs both frontend (http://localhost:3000) and backend (http://localhost:5000) concurrently.

   Or start them separately:
   ```bash
   # Terminal 1 - Frontend
   npm run dev:frontend

   # Terminal 2 - Backend
   npm run dev:backend
   ```

---

## 🎯 How to Use

1. **Open the application** at http://localhost:3000
2. **Select a form type** - Choose from available forms (Change of Major, Graduation Application, Add/Drop Course, or custom uploaded forms)
3. **Start the conversation** - The agent will greet you and guide you through the form
4. **Answer naturally** - Just type your responses in plain language
5. **Track progress** - Watch the sidebar fill with your information
6. **Download PDF** - Click "Download PDF" once all required fields are collected
7. **Generate Email** - Click "Generate Email" to create a submission email draft

### Admin Panel

Access the admin panel by clicking the "⚙️ Admin" button in the top-right corner. From there you can:
- Upload custom PDF form templates
- View all form templates
- Activate/deactivate forms
- Edit form metadata
- Delete forms

### Example Conversation

```
Agent: 👋 Hello! I'm your CampusAgent assistant...
       What major would you like to change to?

You: I want to switch to Computer Science

Agent: 🎓 Great! What is your full name?

You: John Smith

Agent: 🔢 What is your student ID or Z-number?

You: Z23456789

Agent: 📚 What is your current major?

You: Biology

... (continues until all information is collected)
```

---

## 🔌 API Endpoints

### Chat API

**GET** `/api/chat/forms`
- Get all available forms (hardcoded + templates)
- Returns list of forms with metadata

**POST** `/api/chat/start`
- Start a new chat session
- Request body: `{ "formType"?: "FormType | string" }` (optional)
- Returns welcome message and session ID

**POST** `/api/chat`
- Process user message
- Request body:
  ```json
  {
    "sessionId": "string",
    "message": "string",
    "formData": { ... },
    "formType"?: "FormType | string",
    "useAutoFill"?: boolean
  }
  ```
- Returns AI response with updated form data

### PDF API

**POST** `/api/pdf/generate`
- Generate filled PDF form
- Request body:
  ```json
  {
    "formData": { ... },
    "formType": "FormType | string"
  }
  ```
- Returns PDF file (supports both hardcoded forms and template-based forms)

### Email API

**POST** `/api/email/generate`
- Generate email draft
- Request body:
  ```json
  {
    "formData": { ... },
    "formType": "FormType | string"
  }
  ```
- Returns:
  ```json
  {
    "emailDraft": "string"
  }
  ```

### Admin API

**GET** `/api/admin/forms`
- Get all form templates

**GET** `/api/admin/forms/active`
- Get active form templates only

**GET** `/api/admin/forms/:id`
- Get single form template

**POST** `/api/admin/forms/upload`
- Upload new PDF form template
- Multipart form data: `pdf` (file), `name`, `description` (optional)

**PATCH** `/api/admin/forms/:id`
- Update form template metadata
- Body: `name`, `description`, `isActive`

**DELETE** `/api/admin/forms/:id`
- Delete form template

**PATCH** `/api/admin/forms/:id/toggle`
- Toggle form active status

---

## 🧠 Agent Logic

The agent uses a sophisticated workflow to handle conversations:

### Information Extraction
The agent can extract various types of information:
- Student names (from "My name is..." or standalone names)
- Student IDs (Z-numbers or numeric IDs)
- Email addresses
- Phone numbers
- Major names
- Reasons for change

### Validation
- Ensures required fields are collected
- Validates format of emails, phone numbers, IDs
- Confirms information before completion

### Context Awareness
- Maintains conversation history
- Remembers previously collected information
- Asks follow-up questions based on context

---

## 🎨 UI Features

### Chat Interface
- **Message bubbles** - Distinct styling for user vs agent messages
- **Timestamps** - Track conversation flow
- **Loading indicators** - Animated dots while AI processes
- **Auto-scroll** - Always shows latest message

### Sidebar
- **Real-time progress** - Shows collected information
- **Action buttons** - Start new form, download PDF, generate email
- **Field validation** - Visual feedback for required vs optional fields

### Responsive Design
- Works seamlessly on desktop, tablet, and mobile
- Tailwind CSS for consistent, modern styling

---

## 🔧 Configuration

### Frontend Configuration
Located in `frontend/vite.config.ts`:
- Development server port: 3000
- API proxy configuration

### Backend Configuration
Located in `backend/src/config/ai.ts`:
- **OpenAI** (if available): Model `gpt-3.5-turbo`, Temperature 0.7, Max tokens 1024
- **Gemini** (fallback): Model `gemini-pro`, Temperature 0.7, Max tokens 1024
- Auto-detects which API key is available and uses it

### Customization
You can customize:
- Form fields in `src/types.ts` (both frontend and backend)
- Form configurations in `formConfigService.ts`
- Agent questions in `agentService.ts`
- PDF layout in `pdfService.ts`
- Email template in `emailService.ts`
- Upload custom PDF forms via Admin Panel

---

## 🐛 Troubleshooting

### "AI API key is not set" error
- Ensure you created `backend/.env` file
- Add either `OPENAI_API_KEY` or `GEMINI_API_KEY` (or both)
- Restart the backend server
- The app will use OpenAI if available, otherwise Gemini

### Port already in use
- Change ports in `vite.config.ts` (frontend) or `.env` (backend)
- Or kill the process using the port

### PDF generation fails
- Ensure all required fields are filled
- Check backend logs for specific errors

### Frontend can't connect to backend
- Ensure backend is running on port 5000
- Check CORS settings in `backend/src/server.ts`

---

## 🚢 Deployment

### Frontend
Build for production:
```bash
cd frontend
npm run build
```

Deploy the `dist/` folder to:
- Vercel
- Netlify
- GitHub Pages
- Any static hosting service

### Backend
Build for production:
```bash
cd backend
npm run build
```

Deploy to:
- Heroku
- Railway
- AWS EC2
- DigitalOcean
- Any Node.js hosting service

**Important:** Set environment variables on your hosting platform.

---

## 🔮 Future Enhancements

- [x] Support for multiple form types (Change of Major, Graduation Application, Add/Drop Course)
- [x] Admin dashboard for form management
- [x] Custom form template uploads
- [x] PDF form analysis and auto-filling
- [ ] User authentication and saved sessions
- [ ] Real email sending integration
- [ ] File upload for supporting documents
- [ ] Multi-language support
- [ ] Voice input
- [ ] Mobile app (React Native)
- [ ] Database integration for persistence (currently in-memory)
- [ ] Advanced form template builder with visual editor
- [ ] Form submission tracking and analytics
- [ ] Integration with university systems

---

## 📄 License

MIT License - feel free to use this project for your own purposes.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 🙏 Acknowledgments

- **Google Gemini AI** - Powering the intelligent conversation
- **pdf-lib** - PDF generation library
- **Tailwind CSS** - Beautiful UI framework
- **Lucide** - Icon library

---

## 📞 Support

If you have questions or need help:
1. Check this README
2. Review the code comments
3. Open an issue on GitHub

---

**Built with ❤️ for students everywhere**
