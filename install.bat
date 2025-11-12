@echo off
REM CampusAgent Installation Script for Windows
REM This script automates the setup process

echo.
echo 🏫 CampusAgent Setup Script
echo ============================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    echo    Download from: https://nodejs.org/
    exit /b 1
)

node --version
echo ✅ Node.js detected
echo.

REM Install dependencies
echo 📦 Installing dependencies...
call npm install

cd frontend
call npm install
cd ..

cd backend
call npm install
cd ..

echo.
echo ✅ Dependencies installed successfully!
echo.

REM Create backend .env if it doesn't exist
if not exist "backend\.env" (
    echo 🔧 Creating backend\.env file...
    (
        echo PORT=5000
        echo GEMINI_API_KEY=your_gemini_api_key_here
        echo NODE_ENV=development
    ) > backend\.env
    echo ✅ Created backend\.env
    echo.
    echo ⚠️  IMPORTANT: Edit backend\.env and add your Gemini API key!
    echo    Get one from: https://makersuite.google.com/app/apikey
) else (
    echo ✅ backend\.env already exists
)

echo.
echo 🎉 Setup complete!
echo.
echo Next steps:
echo   1. Add your GEMINI_API_KEY to backend\.env
echo   2. Run: npm run dev
echo   3. Open: http://localhost:3000
echo.
echo 📖 For more help, see QUICKSTART.md or SETUP.md
echo.
pause

