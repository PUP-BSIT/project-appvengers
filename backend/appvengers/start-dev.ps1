# iBudget Local Development Startup Script (Windows PowerShell)
# This script starts SSH tunnel and Spring Boot backend

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  iBudget Local Development Startup" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check if SSH tunnel is already running
$tunnelExists = Get-Process | Where-Object {$_.ProcessName -eq "ssh" -and $_.CommandLine -like "*3307:localhost:3306*"}

if ($tunnelExists) {
    Write-Host "[INFO] SSH tunnel already running on port 3307" -ForegroundColor Yellow
} else {
    Write-Host "[STEP 1] Starting SSH tunnel to production VPS..." -ForegroundColor Green
    Write-Host "  Local Port: 3307 -> VPS MySQL: localhost:3306" -ForegroundColor Gray
    Write-Host "  You will be prompted for VPS password" -ForegroundColor Gray
    Write-Host ""
    
    # Start SSH tunnel in new window
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host 'SSH Tunnel Active - Keep this window open!' -ForegroundColor Green; ssh -L 3307:localhost:3306 root@72.61.114.163"
    
    Write-Host "[INFO] Waiting 5 seconds for SSH tunnel to establish..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
}

Write-Host ""
Write-Host "[STEP 2] Starting Spring Boot backend..." -ForegroundColor Green
Write-Host "  Backend will connect to production DB via SSH tunnel" -ForegroundColor Gray
Write-Host "  Database: ibudget_db on localhost:3307" -ForegroundColor Gray
Write-Host ""

# Start Spring Boot
.\mvnw.cmd spring-boot:run

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Development server stopped" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
