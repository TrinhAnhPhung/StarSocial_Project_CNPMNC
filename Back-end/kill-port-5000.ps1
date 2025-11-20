# Script PowerShell để kill process đang sử dụng port 5000

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Kill Process on Port 5000" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Tìm process đang dùng port 5000
$port = 5000
$process = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -First 1

if ($process) {
    $pid = $process.OwningProcess
    $processInfo = Get-Process -Id $pid -ErrorAction SilentlyContinue
    
    if ($processInfo) {
        Write-Host "Found process using port ${port}:" -ForegroundColor Yellow
        Write-Host "  PID: $pid" -ForegroundColor Yellow
        Write-Host "  Name: $($processInfo.ProcessName)" -ForegroundColor Yellow
        Write-Host "  Path: $($processInfo.Path)" -ForegroundColor Yellow
        Write-Host ""
        
        Write-Host "Killing process..." -ForegroundColor Yellow
        try {
            Stop-Process -Id $pid -Force
            Write-Host "✅ Successfully killed process on port ${port}" -ForegroundColor Green
        }
        catch {
            Write-Host "❌ Failed to kill process: $_" -ForegroundColor Red
            Write-Host "Try running PowerShell as Administrator" -ForegroundColor Red
        }
    }
} else {
    Write-Host "ℹ️  No process found using port ${port}" -ForegroundColor Green
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
