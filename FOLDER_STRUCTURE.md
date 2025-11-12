# 📁 CampusAgent Folder Structure

Complete visual representation of the project structure.

---

## Root Directory

```
CampusAgent/
│
├── 📁 frontend/                    # React + TypeScript frontend
├── 📁 backend/                     # Node.js + Express backend
│
├── 📄 package.json                 # Root package (monorepo scripts)
├── 📄 .gitignore                   # Git ignore rules
├── 📄 .prettierrc                  # Code formatting config
├── 📄 .eslintrc.json               # Linting configuration
├── 📄 LICENSE                      # MIT License
│
├── 📖 README.md                    # Main documentation
├── 📖 QUICKSTART.md               # 5-minute setup guide
├── 📖 SETUP.md                    # Detailed setup instructions
├── 📖 ARCHITECTURE.md             # Technical documentation
├── 📖 CONTRIBUTING.md             # Contribution guidelines
├── 📖 PROJECT_SUMMARY.md          # Project overview
└── 📖 FOLDER_STRUCTURE.md         # This file
```

---

## Frontend Directory

```
frontend/
│
├── 📁 src/
│   ├── 📁 components/              # React components
│   │   ├── ChatContainer.tsx       # Main chat interface
│   │   ├── ChatMessage.tsx         # Message bubble component
│   │   ├── ChatInput.tsx           # Input field + send button
│   │   └── Sidebar.tsx             # Form progress sidebar
│   │
│   ├── 📁 api/
│   │   └── client.ts               # Axios API client
│   │
│   ├── types.ts                    # TypeScript interfaces
│   ├── App.tsx                     # Root React component
│   ├── main.tsx                    # Entry point
│   └── index.css                   # Global styles + Tailwind
│
├── 📁 public/                      # Static assets (if needed)
│
├── index.html                      # HTML template
├── package.json                    # Frontend dependencies
├── vite.config.ts                  # Vite configuration
├── tailwind.config.js              # Tailwind configuration
├── postcss.config.js               # PostCSS configuration
├── tsconfig.json                   # TypeScript configuration
├── tsconfig.node.json              # TypeScript for Node files
└── 📖 README.md                    # Frontend-specific docs
```

---

## Backend Directory

```
backend/
│
├── 📁 src/
│   ├── 📁 config/
│   │   └── gemini.ts               # Gemini AI configuration
│   │
│   ├── 📁 services/                # Business logic layer
│   │   ├── agentService.ts         # AI agent workflow (RAPR)
│   │   ├── pdfService.ts           # PDF generation logic
│   │   └── emailService.ts         # Email draft generation
│   │
│   ├── 📁 routes/                  # API route handlers
│   │   ├── chat.ts                 # Chat endpoints
│   │   ├── pdf.ts                  # PDF endpoints
│   │   └── email.ts                # Email endpoints
│   │
│   ├── types.ts                    # TypeScript interfaces
│   └── server.ts                   # Express server setup
│
├── 📁 dist/                        # Compiled JavaScript (generated)
│
├── .env.example                    # Environment template
├── .env                            # Environment variables (create this)
├── package.json                    # Backend dependencies
├── tsconfig.json                   # TypeScript configuration
└── 📖 README.md                    # Backend-specific docs
```

---

## File Descriptions

### Root Files

| File | Purpose |
|------|---------|
| `package.json` | Monorepo scripts, runs frontend and backend together |
| `.gitignore` | Specifies files Git should ignore (node_modules, .env, etc.) |
| `.prettierrc` | Code formatting rules (semi-colons, quotes, etc.) |
| `.eslintrc.json` | Linting rules for code quality |
| `LICENSE` | MIT License - open source |

### Documentation Files

| File | Purpose | Audience |
|------|---------|----------|
| `README.md` | Complete project overview | Everyone |
| `QUICKSTART.md` | 5-minute setup guide | New users |
| `SETUP.md` | Detailed setup + troubleshooting | Developers |
| `ARCHITECTURE.md` | Technical deep dive | Advanced developers |
| `CONTRIBUTING.md` | How to contribute | Contributors |
| `PROJECT_SUMMARY.md` | Project completion summary | Overview seekers |
| `FOLDER_STRUCTURE.md` | This file! | Anyone navigating code |

### Frontend Files

#### Components

| File | Purpose | Props |
|------|---------|-------|
| `ChatContainer.tsx` | Main chat UI, manages messages | messages, onSendMessage, isLoading |
| `ChatMessage.tsx` | Individual message bubble | message |
| `ChatInput.tsx` | Input field for typing | onSendMessage, isLoading |
| `Sidebar.tsx` | Shows form progress | formData, onStartNew, onDownloadPdf, etc. |

#### Core Files

| File | Purpose |
|------|---------|
| `App.tsx` | Root component, manages global state |
| `main.tsx` | React entry point, renders App |
| `types.ts` | TypeScript interfaces (Message, FormData, etc.) |
| `api/client.ts` | Axios setup and API methods |
| `index.css` | Tailwind directives + custom styles |

#### Config Files

| File | Purpose |
|------|---------|
| `vite.config.ts` | Vite configuration (port, proxy, etc.) |
| `tailwind.config.js` | Tailwind theme customization |
| `postcss.config.js` | PostCSS plugins (Tailwind, Autoprefixer) |
| `tsconfig.json` | TypeScript compiler options |

### Backend Files

#### Services (Business Logic)

| File | Purpose |
|------|---------|
| `agentService.ts` | AI agent workflow (Reason, Plan, Act, Reflect) |
| `pdfService.ts` | Generate filled PDF forms with pdf-lib |
| `emailService.ts` | Generate email drafts using Gemini AI |

#### Routes (API Endpoints)

| File | Endpoints |
|------|-----------|
| `chat.ts` | POST /api/chat/start, POST /api/chat |
| `pdf.ts` | POST /api/pdf/generate |
| `email.ts` | POST /api/email/generate |

#### Core Files

| File | Purpose |
|------|---------|
| `server.ts` | Express server setup, middleware, routes |
| `types.ts` | TypeScript interfaces (FormData, SessionState, etc.) |
| `config/gemini.ts` | Gemini AI initialization |

#### Config Files

| File | Purpose |
|------|---------|
| `.env` | Environment variables (API key, port) - **CREATE THIS** |
| `.env.example` | Template for .env file |
| `tsconfig.json` | TypeScript compiler options |

---

## Generated Directories (Not in Git)

These are created when you install/build:

```
📁 node_modules/           # Root dependencies
📁 frontend/node_modules/  # Frontend dependencies
📁 frontend/dist/          # Production build output
📁 backend/node_modules/   # Backend dependencies
📁 backend/dist/           # Compiled TypeScript
```

---

## File Count by Type

| Type | Count |
|------|-------|
| TypeScript/TSX | 14 |
| JSON Config | 7 |
| Markdown Docs | 9 |
| CSS | 1 |
| HTML | 1 |
| JavaScript Config | 3 |
| **Total** | **35+** |

---

## Lines of Code

| Section | Approx. Lines |
|---------|---------------|
| Frontend Components | ~500 |
| Frontend API | ~100 |
| Backend Services | ~600 |
| Backend Routes | ~150 |
| Backend Server | ~50 |
| Configuration | ~200 |
| Documentation | ~3000 |
| **Total** | **~4600+** |

---

## Key Files Quick Reference

### Want to...

**Modify the UI?**
→ `frontend/src/components/`

**Change agent behavior?**
→ `backend/src/services/agentService.ts`

**Customize PDF layout?**
→ `backend/src/services/pdfService.ts`

**Add new API endpoints?**
→ `backend/src/routes/`

**Change styling?**
→ `frontend/src/index.css` and `frontend/tailwind.config.js`

**Add form fields?**
→ `frontend/src/types.ts` and `backend/src/types.ts`

**Configure environment?**
→ `backend/.env`

---

## Dependency Tree

```
Root
├── Frontend Dependencies
│   ├── react, react-dom
│   ├── axios
│   ├── lucide-react
│   ├── uuid
│   └── Dev: vite, typescript, tailwindcss, eslint, etc.
│
└── Backend Dependencies
    ├── express
    ├── cors
    ├── dotenv
    ├── @google/generative-ai
    ├── pdf-lib
    ├── uuid
    └── Dev: typescript, tsx, eslint, etc.
```

---

## Workflow: Where Code Executes

```
User Browser
    ↓
  React App (frontend/)
    ↓
  Axios API Call
    ↓
  Express Server (backend/)
    ↓
  AgentService → Gemini AI
    ↓
  PdfService → pdf-lib
    ↓
  EmailService → Gemini AI
    ↓
  Response back to React
    ↓
  UI Updates
```

---

## Navigation Guide

### For Beginners
1. Start with `README.md`
2. Follow `QUICKSTART.md` to run the app
3. Explore `frontend/src/App.tsx`
4. Look at `backend/src/server.ts`

### For Developers
1. Read `ARCHITECTURE.md`
2. Study `backend/src/services/agentService.ts`
3. Review `frontend/src/components/`
4. Check `backend/src/routes/`

### For Contributors
1. Read `CONTRIBUTING.md`
2. Check `SETUP.md` for development setup
3. Review code in `src/` directories
4. Follow code style in `.prettierrc` and `.eslintrc.json`

---

## Git Ignored Files

These files are NOT tracked in Git:

```
node_modules/          # Dependencies (large)
dist/                  # Build output (regenerable)
.env                   # Secrets (API keys)
*.log                  # Log files
.DS_Store              # Mac OS files
```

---

## Important: Before First Run

You MUST create:
- `backend/.env` with your `GEMINI_API_KEY`

Everything else is included!

---

**Happy coding! 🚀**

