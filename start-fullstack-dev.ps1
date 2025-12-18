# iBudget Full Stack Local Development Startup Script (Windows PowerShell)
# This script starts SSH tunnel, Spring Boot backend, and Angular frontend

# ASCII Art Banner
Write-Host ""
Write-Host "  ██╗██████╗ ██╗   ██╗██████╗  ██████╗ ███████╗████████╗      ██████╗ ███████╗██╗   ██╗" -ForegroundColor Cyan
Write-Host "  ██║██╔══██╗██║   ██║██╔══██╗██╔════╝ ██╔════╝╚══██╔══╝      ██╔══██╗██╔════╝██║   ██║" -ForegroundColor Cyan
Write-Host "  ██║██████╔╝██║   ██║██║  ██║██║  ███╗█████╗     ██║   █████╗██║  ██║█████╗  ██║   ██║" -ForegroundColor Cyan
Write-Host "  ██║██╔══██╗██║   ██║██║  ██║██║   ██║██╔══╝     ██║   ╚════╝██║  ██║██╔══╝  ╚██╗ ██╔╝" -ForegroundColor Cyan
Write-Host "  ██║██████╔╝╚██████╔╝██████╔╝╚██████╔╝███████╗   ██║         ██████╔╝███████╗ ╚████╔╝ " -ForegroundColor Cyan
Write-Host "  ╚═╝╚═════╝  ╚═════╝ ╚═════╝  ╚═════╝ ╚══════╝   ╚═╝         ╚═════╝ ╚══════╝  ╚═══╝  " -ForegroundColor Cyan
Write-Host ""
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host "  Full Stack Development Environment Startup" -ForegroundColor Cyan
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host ""

# Check if SSH tunnel is already running
$tunnelExists = Get-Process | Where-Object {$_.ProcessName -eq "ssh" -and $_.CommandLine -like "*3307:localhost:3306*"}

if ($tunnelExists) {
    Write-Host "[INFO] SSH tunnel already running on port 3307" -ForegroundColor Yellow
} else {
    Write-Host "[STEP 1/3] Starting SSH tunnel to production VPS..." -ForegroundColor Green
    Write-Host "  Local Port: 3307 -> VPS MySQL: localhost:3306" -ForegroundColor Gray
    Write-Host "  You will be prompted for VPS password" -ForegroundColor Gray
    Write-Host ""
    
    # Start SSH tunnel in new window
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host '═══════════════════════════════════════════════════════════' -ForegroundColor Cyan; Write-Host '  SSH TUNNEL - Keep this window open!' -ForegroundColor Green; Write-Host '  Port: 3307 -> VPS MySQL: localhost:3306' -ForegroundColor Gray; Write-Host '═══════════════════════════════════════════════════════════' -ForegroundColor Cyan; Write-Host ''; ssh -L 3307:localhost:3306 root@72.61.114.163"
    
    Write-Host "[INFO] Waiting 5 seconds for SSH tunnel to establish..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
}

Write-Host ""
Write-Host "[STEP 2/3] Starting Spring Boot backend..." -ForegroundColor Green
Write-Host "  Backend will connect to production DB via SSH tunnel" -ForegroundColor Gray
Write-Host "  Database: ibudget_db on localhost:3307" -ForegroundColor Gray
Write-Host "  API URL: http://localhost:8080" -ForegroundColor Gray
Write-Host ""

# Start Spring Boot backend in new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host '═══════════════════════════════════════════════════════════' -ForegroundColor Cyan; Write-Host '  SPRING BOOT BACKEND' -ForegroundColor Green; Write-Host '  API: http://localhost:8080' -ForegroundColor Yellow; Write-Host '═══════════════════════════════════════════════════════════' -ForegroundColor Cyan; Write-Host ''; cd backend/appvengers; .\mvnw.cmd spring-boot:run"

Write-Host "[INFO] Waiting 10 seconds for backend to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host ""
Write-Host "[STEP 3/3] Starting Angular frontend..." -ForegroundColor Green
Write-Host "  Frontend URL: http://localhost:4200" -ForegroundColor Gray
Write-Host ""

# Start Angular frontend in new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host '═══════════════════════════════════════════════════════════' -ForegroundColor Cyan; Write-Host '  ANGULAR FRONTEND' -ForegroundColor Green; Write-Host '  URL: http://localhost:4200' -ForegroundColor Yellow; Write-Host '═══════════════════════════════════════════════════════════' -ForegroundColor Cyan; Write-Host ''; cd frontend/ibudget; npm start"

Write-Host ""
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host "  Development Environment Started!" -ForegroundColor Green
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Services Running:" -ForegroundColor White
Write-Host "  ├─ SSH Tunnel:  localhost:3307 -> VPS MySQL" -ForegroundColor Gray
Write-Host "  ├─ Backend API: http://localhost:8080" -ForegroundColor Yellow
Write-Host "  └─ Frontend:    http://localhost:4200" -ForegroundColor Yellow
Write-Host ""
Write-Host "  To stop all services, close each PowerShell window or press Ctrl+C" -ForegroundColor Gray
Write-Host ""
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to close this window (services will continue running)..." -ForegroundColor White
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
