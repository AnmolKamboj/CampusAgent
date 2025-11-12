# ⚡ CampusAgent Quick Start

Get CampusAgent running in 5 minutes!

---

## Prerequisites

✅ Node.js 18+ installed  
✅ OpenAI API key OR Google Gemini API key
  - OpenAI: https://platform.openai.com/api-keys
  - Gemini: https://makersuite.google.com/app/apikey

---

## Installation (3 steps)

### 1. Install Dependencies

```bash
npm run install:all
```

### 2. Configure Backend

Create `backend/.env`:

```env
PORT=5000

# You need at least ONE of these:
OPENAI_API_KEY=your_openai_key_here
# OR
GEMINI_API_KEY=your_gemini_key_here

NODE_ENV=development
```

**⚠️ Replace with your actual API key! The app will use OpenAI if available, otherwise Gemini.**

### 3. Start the App

```bash
npm run dev
```

**Done!** Open http://localhost:3000

---

## First Steps

1. **Select a form** - Choose from Change of Major, Graduation Application, or Add/Drop Course
2. **Start the conversation** - The agent will guide you through the form
3. **Answer naturally** - Just type your responses

### Example Conversation (Change of Major)

```
Agent: What major would you like to change to?
You:   Computer Science

Agent: What is your full name?
You:   John Smith

Agent: What is your student ID or Z-number?
You:   Z23456789

Agent: What is your current major?
You:   Biology

Agent: Who is your academic advisor?
You:   Dr. Johnson

Agent: What department is your new major in?
You:   Computer Science Department

Agent: What is your email address?
You:   john.smith@university.edu

Agent: Could you briefly explain your reason for changing majors?
You:   I've discovered a passion for programming and want to pursue a career in software development.
```

Now click **Download PDF** or **Generate Email**!

### Admin Panel

Click the **⚙️ Admin** button to:
- Upload custom PDF forms
- Manage form templates
- Activate/deactivate forms

---

## Troubleshooting

**Backend won't start?**
- Check if you added OPENAI_API_KEY or GEMINI_API_KEY to `backend/.env`
- Make sure port 5000 is not in use

**Frontend won't start?**
- Make sure port 3000 is not in use
- Check if backend is running

**Can't download PDF?**
- Ensure you've provided all required fields
- Check backend logs for errors

---

## Next Steps

- 📖 Read [README.md](README.md) for full documentation
- 🔧 Check [SETUP.md](SETUP.md) for detailed setup
- 🏛️ Explore [ARCHITECTURE.md](ARCHITECTURE.md) for technical details
- 🤝 See [CONTRIBUTING.md](CONTRIBUTING.md) to contribute

---

**Need help?** Open an issue on GitHub!

