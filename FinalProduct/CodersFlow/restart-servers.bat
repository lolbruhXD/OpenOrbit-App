@echo off
echo Stopping all Node.js processes...
taskkill /f /im node.exe 2>nul

echo Waiting for processes to stop...
timeout /t 2 /nobreak > nul

echo Starting Backend Server...
start "Backend Server" cmd /k "cd CodersFlow\backend\backend && npm run dev"

echo Waiting for backend to start...
timeout /t 5 /nobreak > nul

echo Starting Frontend Server...
start "Frontend Server" cmd /k "cd CodersFlow\frontend2\Frontend && npm start"

echo.
echo Both servers are starting...
echo Backend: http://127.0.0.1:5000
echo Frontend: Check the Expo CLI output for the URL
echo.
echo The NetworkTest component will help you verify the connection.
pause
