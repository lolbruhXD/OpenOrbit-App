@echo off
echo Getting your computer's IP address for Android development...
echo.

for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4 Address"') do (
    for /f "tokens=1" %%b in ("%%a") do (
        echo Your IP address is: %%b
        echo.
        echo Update your config/api.js file to use:
        echo BASE_URL: 'http://%%b:5000/api'
        echo WEBSOCKET_URL: 'http://%%b:5000'
        echo.
        pause
        exit /b
    )
)

echo Could not find IP address. Make sure you're connected to a network.
pause
