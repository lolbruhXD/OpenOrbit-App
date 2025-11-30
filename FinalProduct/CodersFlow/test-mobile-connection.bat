@echo off
echo Testing mobile app connection...
echo.

echo 1. Testing backend server...
curl http://127.0.0.1:5000
echo.

echo 2. Testing from Android emulator perspective (10.0.2.2)...
echo Note: This will timeout from host machine, but should work from Android emulator
ping -n 1 10.0.2.2
echo.

echo 3. Testing from iOS simulator perspective (127.0.0.1)...
curl http://127.0.0.1:5000
echo.

echo 4. Testing from physical device perspective...
curl http://10.41.182.148:5000
echo.

echo Connection tests completed!
echo.
echo For Android Emulator: Use 10.0.2.2:5000
echo For iOS Simulator: Use 127.0.0.1:5000  
echo For Physical Device: Use 10.41.182.148:5000
echo.
pause
