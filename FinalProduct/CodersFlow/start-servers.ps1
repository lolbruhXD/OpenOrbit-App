# PowerShell script to start CodersFlow servers
Write-Host "Starting CodersFlow Development Servers..." -ForegroundColor Green
Write-Host ""

# Kill any processes using port 5000
Write-Host "1. Checking for processes using port 5000..." -ForegroundColor Yellow
$processes = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue
if ($processes) {
    foreach ($process in $processes) {
        $pid = $process.OwningProcess
        Write-Host "Killing process $pid using port 5000" -ForegroundColor Red
        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
    }
    Start-Sleep -Seconds 2
}

# Start backend server
Write-Host "2. Starting Backend Server..." -ForegroundColor Yellow
$backendPath = "CodersFlow\backend\backend"
if (Test-Path $backendPath) {
    Start-Process -FilePath "cmd" -ArgumentList "/k", "cd /d $backendPath && npm run dev" -WindowStyle Normal
    Write-Host "Backend server starting..." -ForegroundColor Green
} else {
    Write-Host "Backend path not found: $backendPath" -ForegroundColor Red
}

# Wait for backend to start
Start-Sleep -Seconds 5

# Start frontend server
Write-Host "3. Starting Frontend Server..." -ForegroundColor Yellow
$frontendPath = "CodersFlow\frontend2\Frontend"
if (Test-Path $frontendPath) {
    Start-Process -FilePath "cmd" -ArgumentList "/k", "cd /d $frontendPath && npm start" -WindowStyle Normal
    Write-Host "Frontend server starting..." -ForegroundColor Green
} else {
    Write-Host "Frontend path not found: $frontendPath" -ForegroundColor Red
}

Write-Host ""
Write-Host "✅ Both servers are starting!" -ForegroundColor Green
Write-Host "Backend: http://127.0.0.1:5000" -ForegroundColor Cyan
Write-Host "Frontend: Check the Expo CLI output for the URL" -ForegroundColor Cyan
Write-Host ""
Write-Host "The NetworkTest component will help you verify the connection." -ForegroundColor Yellow
Write-Host "Press any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
