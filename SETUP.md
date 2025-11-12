# 🔧 CampusAgent Setup Guide

This guide will walk you through setting up CampusAgent on your local machine step by step.

---

## Step 1: Prerequisites

Before you begin, ensure you have:

1. **Node.js and npm** installed
   - Download from [nodejs.org](https://nodejs.org/)
   - Version 18 or higher recommended
   - Check with: `node --version` and `npm --version`

2. **Git** installed
   - Download from [git-scm.com](https://git-scm.com/)
   - Check with: `git --version`

3. **Google Gemini API Key**
   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Sign in with your Google account
   - Click "Create API Key"
   - Copy your key (you'll need it in Step 4)

4. **Code Editor** (recommended)
   - VS Code, WebStorm, or your preferred editor

---

## Step 2: Clone the Repository

```bash
# Clone the repository
git clone <repository-url>

# Navigate to project directory
cd CampusAgent
```

---

## Step 3: Install Dependencies

The project is set up as a monorepo with both frontend and backend.

```bash
# Install all dependencies (root, frontend, and backend)
npm run install:all
```

Or install manually:

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..

# Install backend dependencies
cd backend
npm install
cd ..
```

---

## Step 4: Configure Environment Variables

### Backend Environment

Create a `.env` file in the `backend/` directory:

```bash
cd backend
touch .env  # On Windows: type nul > .env
```

Add the following content to `backend/.env`:

```env
PORT=5000
GEMINI_API_KEY=your_actual_gemini_api_key_here
NODE_ENV=development
```

**Important:** Replace `your_actual_gemini_api_key_here` with your real Gemini API key!

### Frontend Environment (Optional)

If you need to change the API URL, create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

---

## Step 5: Verify Setup

Let's make sure everything is configured correctly:

### Check Backend Configuration

```bash
cd backend
cat .env  # On Windows: type .env
```

You should see your environment variables with your real API key.

### Check Dependencies

```bash
# From project root
cd frontend
npm list --depth=0

cd ../backend
npm list --depth=0
```

All packages should be installed without errors.

---

## Step 6: Start the Development Servers

You have two options:

### Option A: Start Both Servers Together (Recommended)

From the project root:

```bash
npm run dev
```

This will start both the frontend and backend concurrently.

### Option B: Start Servers Separately

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

Wait for the message: `🚀 CampusAgent backend running on http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Wait for the message showing the local URL (usually http://localhost:3000)

---

## Step 7: Access the Application

1. Open your browser
2. Go to http://localhost:3000
3. You should see the CampusAgent interface!

---

## Step 8: Test the Application

Let's make sure everything works:

1. **Test the Chat:**
   - You should see a welcome message from the agent
   - Type "I want to change to Computer Science"
   - The agent should respond

2. **Test Form Filling:**
   - Continue the conversation
   - Provide: name, student ID, current major, etc.
   - Watch the sidebar fill with information

3. **Test PDF Generation:**
   - Once you've provided required information
   - Click "Download PDF"
   - A PDF should download

4. **Test Email Generation:**
   - Click "Generate Email"
   - An email draft should appear in the chat

---

## Troubleshooting

### Problem: "GEMINI_API_KEY is not set"

**Solution:**
- Make sure you created `backend/.env`
- Verify the file contains `GEMINI_API_KEY=your_key`
- Restart the backend server
- Check for typos in the environment variable name

### Problem: Port 3000 or 5000 already in use

**Solution:**

For frontend (port 3000):
- Edit `frontend/vite.config.ts`
- Change `port: 3000` to another port like `port: 3001`

For backend (port 5000):
- Edit `backend/.env`
- Change `PORT=5000` to `PORT=5001`
- Update frontend proxy in `vite.config.ts` accordingly

### Problem: "Cannot find module"

**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules frontend/node_modules backend/node_modules
npm run install:all
```

### Problem: TypeScript errors

**Solution:**
```bash
# Rebuild TypeScript
cd frontend
npm run build

cd ../backend
npm run build
```

### Problem: Frontend can't connect to backend

**Solution:**
- Ensure backend is running (check terminal)
- Check backend URL in browser: http://localhost:5000/api/health
- Should return: `{"status":"ok","message":"CampusAgent API is running"}`
- Verify proxy settings in `frontend/vite.config.ts`

### Problem: Gemini API errors

**Solution:**
- Verify your API key is valid
- Check your API quota at Google AI Studio
- Ensure you're not hitting rate limits
- Try a different API key

---

## Development Tips

### Hot Reloading

Both frontend and backend support hot reloading:
- **Frontend:** Changes to React components reload automatically
- **Backend:** Changes to TypeScript files restart the server automatically

### Viewing Logs

- **Frontend logs:** Check browser console (F12)
- **Backend logs:** Check terminal where backend is running

### Testing API Endpoints

Use tools like:
- **Postman** - Download from [postman.com](https://www.postman.com/)
- **curl** - Command line HTTP client
- **VS Code REST Client** - Extension for VS Code

Example curl test:
```bash
curl http://localhost:5000/api/health
```

---

## Next Steps

Once everything is running:

1. ✅ Explore the code structure
2. ✅ Try customizing the UI in `frontend/src/components/`
3. ✅ Modify agent behavior in `backend/src/services/agentService.ts`
4. ✅ Add new form fields in `src/types.ts` (both frontend and backend)
5. ✅ Customize the PDF layout in `backend/src/services/pdfService.ts`

---

## Building for Production

### Frontend Build

```bash
cd frontend
npm run build
```

Output will be in `frontend/dist/`

### Backend Build

```bash
cd backend
npm run build
```

Output will be in `backend/dist/`

### Running Production Build

```bash
# Backend
cd backend
npm start

# Frontend - serve the dist folder with any static server
npx serve -s dist
```

---

## Getting Help

If you encounter issues:

1. Check this SETUP.md guide
2. Review the main README.md
3. Check the troubleshooting section above
4. Look at backend terminal logs for errors
5. Check browser console for frontend errors
6. Open an issue on GitHub

---

**Happy coding! 🚀**

