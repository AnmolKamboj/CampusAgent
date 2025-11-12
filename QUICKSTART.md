# ⚡ CampusAgent Quick Start

Get CampusAgent running in 5 minutes!

---

## Prerequisites

✅ Node.js 18+ installed  
✅ Google Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))

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
GEMINI_API_KEY=your_api_key_here
NODE_ENV=development
```

**⚠️ Replace `your_api_key_here` with your actual Gemini API key!**

### 3. Start the App

```bash
npm run dev
```

**Done!** Open http://localhost:3000

---

## First Conversation

Try this conversation:

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

---

## Troubleshooting

**Backend won't start?**
- Check if you added GEMINI_API_KEY to `backend/.env`
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

