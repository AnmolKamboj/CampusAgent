# CampusAgent Backend

Backend API for the CampusAgent intelligent forms assistant.

## Tech Stack

- Node.js + Express
- TypeScript
- Google Gemini AI
- pdf-lib

## Project Structure

```
src/
├── config/         # Configuration (Gemini setup)
├── services/       # Business logic
│   ├── agentService.ts    # AI agent workflow
│   ├── pdfService.ts      # PDF generation
│   └── emailService.ts    # Email drafting
├── routes/         # API endpoints
│   ├── chat.ts     # Chat routes
│   ├── pdf.ts      # PDF routes
│   └── email.ts    # Email routes
├── types.ts        # TypeScript types
└── server.ts       # Express server
```

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env` file:
   ```env
   PORT=5000
   GEMINI_API_KEY=your_key_here
   NODE_ENV=development
   ```

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
| GEMINI_API_KEY | Google Gemini API key | Yes |
| NODE_ENV | Environment (development/production) | No |

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

**"GEMINI_API_KEY is not set"**
- Create `.env` file in backend directory
- Add your API key
- Restart server

**Port already in use**
- Change PORT in `.env`
- Or kill process using port 5000

**TypeScript errors**
- Run `npm run build` to check errors
- Fix type issues

**Module not found**
- Delete `node_modules` and `package-lock.json`
- Run `npm install`

