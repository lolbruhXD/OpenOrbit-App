@echo off
echo Fixing port 5000 conflict and starting servers...
echo.

echo 1. Killing any processes using port 5000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000') do (
    echo Killing process %%a
    taskkill /f /pid %%a 2>nul
)

echo 2. Waiting for port to be free...
timeout /t 2 /nobreak > nul

echo 3. Starting Backend Server...
start "Backend Server" cmd /k "cd CodersFlow\backend\backend && npm run dev"

echo 4. Waiting for backend to start...
timeout /t 5 /nobreak > nul

echo 5. Starting Frontend Server...
start "Frontend Server" cmd /k "cd CodersFlow\frontend2\Frontend && npm start"

echo.
echo ✅ Both servers should now be running!
echo Backend: http://127.0.0.1:5000
echo Frontend: Check the Expo CLI output
echo.
echo Test the NetworkTest component in your app now.
pause
