@echo off
echo Testing API endpoints...
echo.

echo 1. Testing backend connection...
curl -s http://127.0.0.1:5000
echo.
echo.

echo 2. Testing registration endpoint...
powershell -Command "try { $response = Invoke-RestMethod -Uri 'http://127.0.0.1:5000/api/users/register' -Method POST -ContentType 'application/json' -Body '{\"name\":\"Test User\",\"email\":\"test%RANDOM%@example.com\",\"password\":\"password123\"}'; Write-Host 'Success:' $response } catch { Write-Host 'Error:' $_.Exception.Message }"

echo.
echo 3. Testing login endpoint...
powershell -Command "try { $response = Invoke-RestMethod -Uri 'http://127.0.0.1:5000/api/users/login' -Method POST -ContentType 'application/json' -Body '{\"email\":\"test@example.com\",\"password\":\"password123\"}'; Write-Host 'Success:' $response } catch { Write-Host 'Error:' $_.Exception.Message }"

echo.
echo API test complete!
pause
