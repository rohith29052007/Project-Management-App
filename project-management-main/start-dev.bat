@echo off
REM Start both frontend and backend servers for development (Windows)

echo Starting Project Management Application...
echo.

REM Check if .env files exist
if not exist "server\.env" (
    echo Warning: server\.env not found. Please create it with your database credentials.
    echo See server\.env.example for reference.
    pause
    exit /b 1
)

if not exist ".env" (
    echo Warning: .env not found. Creating from .env.example...
    if exist ".env.example" (
        copy .env.example .env
        echo Created .env file. Please update VITE_API_URL and VITE_CLERK_PUBLISHABLE_KEY
    )
)

REM Start backend
echo Starting backend server...
cd server
start "Backend Server" cmd /k "npm install && npm run dev"
cd ..

REM Wait a bit for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend
echo Starting frontend server...
start "Frontend Server" cmd /k "npm install && npm run dev"

echo.
echo Servers started!
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo Close the command windows to stop the servers.
pause

