# CampusAgent Backend

Backend API for the CampusAgent intelligent forms assistant.

## Tech Stack

- Node.js + Express
- TypeScript
- OpenAI or Google Gemini AI (auto-detects)
- pdf-lib (PDF generation and filling)
- pdf-parse (PDF analysis)
- multer (file uploads)

## Project Structure

```
src/
├── config/         # Configuration
│   ├── ai.ts       # Unified AI interface (OpenAI/Gemini)
│   ├── gemini.ts   # Gemini setup
│   └── openai.ts   # OpenAI setup
├── services/       # Business logic
│   ├── agentService.ts         # AI agent workflow
│   ├── pdfService.ts           # PDF generation
│   ├── emailService.ts         # Email drafting
│   ├── formConfigService.ts   # Hardcoded form configs
│   ├── formTemplateService.ts # Template management
│   ├── pdfAnalysisService.ts  # PDF analysis
│   ├── pdfFillService.ts      # PDF filling
│   ├── studentDataService.ts  # Student data auto-fill
│   └── deadlineService.ts     # Deadline tracking
├── routes/         # API endpoints
│   ├── chat.ts     # Chat routes
│   ├── pdf.ts      # PDF routes
│   ├── email.ts    # Email routes
│   └── admin.ts    # Admin routes
├── types.ts        # TypeScript types
└── server.ts       # Express server
```

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env` file:
   ```bash
   cp .env.example .env
   ```
   
   Then edit `.env` and add your API key(s):
   ```env
   PORT=5000
   
   # You need at least ONE of these:
   OPENAI_API_KEY=your_openai_key_here
   # OR
   GEMINI_API_KEY=your_gemini_key_here
   
   NODE_ENV=development
   ```
   
   **Get API Keys:**
   - OpenAI: https://platform.openai.com/api-keys
   - Gemini: https://makersuite.google.com/app/apikey
   
   **Note:** The app will use OpenAI if available, otherwise fall back to Gemini. You can provide both keys if you want a fallback.

3. Start development server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Chat

**POST** `/api/chat/start`
- Start new session
- Returns welcome message

**POST** `/api/chat`
- Process user message
- Body: `{ sessionId, message, formData }`

### PDF

**POST** `/api/pdf/generate`
- Generate filled PDF
- Body: `{ formData }`
- Returns PDF file

### Email

**POST** `/api/email/generate`
- Generate email draft
- Body: `{ formData }`
- Returns `{ emailDraft }`

### Admin

**GET** `/api/admin/forms`
- Get all form templates

**GET** `/api/admin/forms/active`
- Get active form templates

**GET** `/api/admin/forms/:id`
- Get single form template

**POST** `/api/admin/forms/upload`
- Upload new PDF form template (multipart/form-data)

**PATCH** `/api/admin/forms/:id`
- Update form template

**DELETE** `/api/admin/forms/:id`
- Delete form template

**PATCH** `/api/admin/forms/:id/toggle`
- Toggle form active status

### Health Check

**GET** `/api/health`
- Check API status

## Development

```bash
# Run in development mode (with auto-reload)
npm run dev

# Build for production
npm run build

# Run production build
npm start
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| PORT | Server port | No (default: 5000) |
| OPENAI_API_KEY | OpenAI API key | Yes* |
| GEMINI_API_KEY | Google Gemini API key | Yes* |
| NODE_ENV | Environment (development/production) | No |

*You need at least ONE of OPENAI_API_KEY or GEMINI_API_KEY. OpenAI is preferred and will be used if available, otherwise Gemini will be used as fallback.

## Adding New Features

### New Form Type

1. Add fields to `types.ts`
2. Update `agentService.ts` to handle new questions
3. Create new PDF template in `pdfService.ts`
4. Update routes if needed

### New Service

1. Create file in `services/`
2. Export service instance
3. Import in routes
4. Add route handlers

## Testing

```bash
# Test with curl
curl http://localhost:5000/api/health

# Test chat start
curl -X POST http://localhost:5000/api/chat/start

# Test chat message
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"test","message":"Computer Science","formData":{}}'
```

## Deployment

1. Build the project:
   ```bash
   npm run build
   ```

2. Set environment variables on your hosting platform

3. Start the server:
   ```bash
   npm start
   ```

## Troubleshooting

**"AI API key is not set"**
- Create `.env` file in backend directory
- Add either `OPENAI_API_KEY` or `GEMINI_API_KEY` (or both)
- Restart server
- The app will use OpenAI if available, otherwise Gemini

**Port already in use**
- Change PORT in `.env`
- Or kill process using port 5000

**TypeScript errors**
- Run `npm run build` to check errors
- Fix type issues

**Module not found**
- Delete `node_modules` and `package-lock.json`
- Run `npm install`

