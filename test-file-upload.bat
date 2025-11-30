@echo off
echo Testing file upload endpoint...
echo.

REM Create a test file
echo This is a test file for upload > test.txt

echo Testing file upload with curl...
curl -X POST -F "file=@test.txt" http://10.41.182.148:5000/api/upload

echo.
echo Cleaning up test file...
del test.txt

echo.
echo File upload test completed!
pause
