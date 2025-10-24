@echo off
echo ========================================
echo    OBLI Pathfinder - Git Backup Script
echo ========================================
echo.

echo [1/5] Checking Git status...
git status
echo.

echo [2/5] Adding all changes...
git add .
echo.

echo [3/5] Committing changes...
set /p commit_msg="Enter commit message: "
git commit -m "%commit_msg%"
echo.

echo [4/5] Pulling remote changes...
git pull origin main
echo.

echo [5/5] Pushing to GitHub...
git push origin main
echo.

echo ========================================
echo    Backup completed successfully!
echo ========================================
pause






