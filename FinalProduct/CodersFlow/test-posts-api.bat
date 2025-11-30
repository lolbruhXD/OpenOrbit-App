@echo off
echo Testing Posts API endpoint...
echo.

echo 1. Testing basic backend connection...
curl http://127.0.0.1:5000
echo.

echo 2. Testing posts feed endpoint...
curl http://127.0.0.1:5000/api/posts/feed
echo.

echo 3. Testing from Android emulator perspective (10.0.2.2)...
echo Note: This will timeout from host machine, but should work from Android emulator
echo.

echo 4. Testing from physical device perspective...
curl http://10.41.182.148:5000/api/posts/feed
echo.

echo Posts API test completed!
echo.
echo If any of these fail, check:
echo - Backend server is running on port 5000
echo - Firewall is not blocking connections
echo - Mobile device is on the same network
echo.
pause
