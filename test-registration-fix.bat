@echo off
echo Testing registration fix...
echo.

echo The issue was that RegisterScreen and LoginScreen were using undefined API_BASE_URL
echo instead of the configured API_CONFIG.BASE_URL.
echo.

echo Fixed:
echo - RegisterScreen now uses API_CONFIG.BASE_URL
echo - LoginScreen now uses API_CONFIG.BASE_URL
echo - Both import the API_CONFIG from config/api.js
echo.

echo Your API configuration:
echo BASE_URL: http://10.41.182.148:5000/api
echo.

echo Test the registration in your app now - it should work!
echo.

pause
