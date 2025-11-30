@echo off
echo Starting CodersFlow Development Servers...
echo.

echo Starting Backend Server...
start "Backend Server" cmd /k "cd backend\backend && npm run dev"

timeout /t 3 /nobreak > nul

echo Starting Frontend Server...
start "Frontend Server" cmd /k "cd frontend2\Frontend && npm start"

echo.
echo Both servers are starting...
echo Backend: http://localhost:5000
echo Frontend: Check the Expo CLI output for the URL
echo.
pause
