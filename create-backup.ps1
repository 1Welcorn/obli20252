# OBLI Fluency Pathfinder - Full Backup Script
# This script creates a complete backup of the project

$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$backupName = "obli-fluency-pathfinder-backup-$timestamp"
$backupPath = ".\$backupName"

Write-Host "Creating backup: $backupName" -ForegroundColor Green

# Create backup directory
New-Item -ItemType Directory -Path $backupPath -Force | Out-Null

# Copy all project files
Write-Host "Copying project files..." -ForegroundColor Yellow
Copy-Item -Path ".\*" -Destination $backupPath -Recurse -Exclude @("node_modules", ".git", "dist", "*.log", "*.tmp")

# Create a zip file
Write-Host "Creating zip archive..." -ForegroundColor Yellow
$zipPath = "$backupName.zip"
Compress-Archive -Path $backupPath -DestinationPath $zipPath -Force

# Remove the temporary directory
Remove-Item -Path $backupPath -Recurse -Force

Write-Host "Backup created successfully: $zipPath" -ForegroundColor Green
Write-Host "Backup size: $((Get-Item $zipPath).Length / 1MB) MB" -ForegroundColor Cyan

# Create backup info file
$backupInfo = @"
OBLI Fluency Pathfinder - Project Backup
========================================

Backup Date: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
Project Version: $(Get-Content package.json | ConvertFrom-Json | Select-Object -ExpandProperty version)
Git Commit: $(git rev-parse HEAD 2>$null)
Git Branch: $(git branch --show-current 2>$null)

Contents:
- All source code files
- Configuration files
- Documentation
- GitHub Actions workflow
- Package files (package.json, package-lock.json)

Excluded:
- node_modules (can be reinstalled with npm install)
- .git directory (version control history)
- dist directory (build output)
- Log files and temporary files

To restore:
1. Extract the zip file
2. Run: npm install
3. Run: npm run dev (for development)
4. Run: npm run build (for production)

Deployment URL: https://1welcorn.github.io/obli-fluency-pathfinder/
Repository: https://github.com/1Welcorn/obli-fluency-pathfinder
"@

$backupInfo | Out-File -FilePath "backup-info.txt" -Encoding UTF8

Write-Host "Backup info saved to: backup-info.txt" -ForegroundColor Cyan
Write-Host "Backup complete!" -ForegroundColor Green
