# 🏫 CampusAgent

An intelligent AI assistant that helps university students complete complex academic forms through natural conversation. Starting with the **Change of Major** form, CampusAgent guides students step-by-step, validates inputs, and generates both a filled PDF and a ready-to-send email.

---

## ✨ Features

- 🤖 **AI-Powered Conversational Interface** - Natural dialogue powered by Google Gemini AI
- 📝 **Smart Form Filling** - Automatically extracts and validates information from conversation
- 📄 **PDF Generation** - Creates professional, filled PDF forms ready for submission
- 📧 **Email Draft Generation** - Generates formal submission emails
- 🎨 **Modern UI** - Beautiful, responsive interface built with React and Tailwind CSS
- 🔄 **Real-time Progress Tracking** - Visual display of collected information
- 🧠 **Agentic Workflow** - Implements Reason → Plan → Act → Reflect pattern

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
- **Google Gemini AI** for intelligent conversation and reasoning
- **pdf-lib** for PDF generation
- RESTful API architecture

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
│   │   │   └── Sidebar.tsx
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
│   │   │   └── gemini.ts
│   │   ├── services/         # Business logic
│   │   │   ├── agentService.ts
│   │   │   ├── pdfService.ts
│   │   │   └── emailService.ts
│   │   ├── routes/           # API routes
│   │   │   ├── chat.ts
│   │   │   ├── pdf.ts
│   │   │   └── email.ts
│   │   ├── types.ts          # TypeScript types
│   │   └── server.ts         # Express server
│   ├── package.json
│   └── tsconfig.json
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
   GEMINI_API_KEY=your_gemini_api_key_here
   NODE_ENV=development
   ```

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
2. **Start the conversation** - The agent will greet you and ask about your desired major
3. **Answer naturally** - Just type your responses in plain language
4. **Track progress** - Watch the sidebar fill with your information
5. **Download PDF** - Click "Download PDF" once all required fields are collected
6. **Generate Email** - Click "Generate Email" to create a submission email draft

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

**POST** `/api/chat/start`
- Start a new chat session
- Returns welcome message

**POST** `/api/chat`
- Process user message
- Request body:
  ```json
  {
    "sessionId": "string",
    "message": "string",
    "formData": { ... }
  }
  ```
- Returns AI response with updated form data

### PDF API

**POST** `/api/pdf/generate`
- Generate filled PDF form
- Request body:
  ```json
  {
    "formData": {
      "studentName": "string",
      "studentId": "string",
      "currentMajor": "string",
      "desiredMajor": "string",
      ...
    }
  }
  ```
- Returns PDF file

### Email API

**POST** `/api/email/generate`
- Generate email draft
- Request body: same as PDF API
- Returns:
  ```json
  {
    "emailDraft": "string"
  }
  ```

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
Located in `backend/src/config/gemini.ts`:
- Model: `gemini-pro`
- Temperature: 0.7 (balanced creativity/consistency)
- Max tokens: 1024

### Customization
You can customize:
- Form fields in `src/types.ts`
- Agent questions in `agentService.ts`
- PDF layout in `pdfService.ts`
- Email template in `emailService.ts`

---

## 🐛 Troubleshooting

### "GEMINI_API_KEY is not set" error
- Ensure you created `backend/.env` file
- Add your Gemini API key
- Restart the backend server

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

- [ ] Support for multiple form types (Add/Drop, Grade Appeal, etc.)
- [ ] User authentication and saved sessions
- [ ] Real email sending integration
- [ ] File upload for supporting documents
- [ ] Multi-language support
- [ ] Voice input
- [ ] Mobile app (React Native)
- [ ] Database integration for persistence
- [ ] Admin dashboard
- [ ] Form template builder

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
