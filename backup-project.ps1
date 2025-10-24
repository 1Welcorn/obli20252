# OBLI Pathfinder - Git Backup Script (PowerShell)
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   OBLI Pathfinder - Git Backup Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/5] Checking Git status..." -ForegroundColor Yellow
git status
Write-Host ""

Write-Host "[2/5] Adding all changes..." -ForegroundColor Yellow
git add .
Write-Host ""

Write-Host "[3/5] Committing changes..." -ForegroundColor Yellow
$commitMsg = Read-Host "Enter commit message"
git commit -m $commitMsg
Write-Host ""

Write-Host "[4/5] Pulling remote changes..." -ForegroundColor Yellow
git pull origin main
Write-Host ""

Write-Host "[5/5] Pushing to GitHub..." -ForegroundColor Yellow
git push origin main
Write-Host ""

Write-Host "========================================" -ForegroundColor Green
Write-Host "   Backup completed successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Your project is now backed up to GitHub!" -ForegroundColor Green






