$ErrorActionPreference = "Stop"

Write-Host "Installing scriptory..." -ForegroundColor Cyan

$npmPath = Get-Command npm -ErrorAction SilentlyContinue

if ($npmPath) {
    Write-Host "Installing via npm..." -ForegroundColor Yellow
    npm install -g scriptory

    Write-Host ""
    Write-Host "✓ scriptory installed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Run 'scriptory' to get started" -ForegroundColor Cyan
} else {
    Write-Host "Error: npm not found." -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Node.js and npm first:" -ForegroundColor Yellow
    Write-Host "  • Download from: https://nodejs.org/" -ForegroundColor White
    Write-Host "  • Or using Chocolatey: choco install nodejs" -ForegroundColor White
    Write-Host "  • Or using Scoop: scoop install nodejs" -ForegroundColor White
    Write-Host ""
    exit 1
}
