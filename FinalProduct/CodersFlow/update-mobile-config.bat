@echo off
echo Updating mobile app configuration...
echo.

echo Your computer's IP address: 10.41.182.148
echo Backend URL: http://10.41.182.148:5000
echo.

echo The API configuration has been updated to use your IP address.
echo This should fix the mobile app connection issues.
echo.

echo Make sure:
echo 1. Backend server is running on port 5000
echo 2. Your mobile device/emulator is on the same network
echo 3. Restart your React Native app to pick up the new config
echo.

echo Testing backend connection...
curl -s http://10.41.182.148:5000
echo.

echo If you see "Luniva Backend API Running 🚀" above, the backend is accessible.
echo.

pause
