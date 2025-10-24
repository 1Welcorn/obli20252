@echo off
echo Creating OBLI Fluency Pathfinder Backup...
echo.

REM Get current date and time
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "YY=%dt:~2,2%" & set "YYYY=%dt:~0,4%" & set "MM=%dt:~4,2%" & set "DD=%dt:~6,2%"
set "HH=%dt:~8,2%" & set "Min=%dt:~10,2%" & set "Sec=%dt:~12,2%"
set "timestamp=%YYYY%-%MM%-%DD%_%HH%-%Min%-%Sec%"

set "backupName=obli-fluency-pathfinder-backup-%timestamp%"
set "zipName=%backupName%.zip"

echo Backup name: %backupName%
echo.

REM Create backup directory
mkdir "%backupName%" 2>nul

REM Copy files (excluding node_modules, .git, dist)
echo Copying project files...
xcopy /E /I /H /Y /EXCLUDE:backup-exclude.txt . "%backupName%\" >nul

REM Create zip file using PowerShell
echo Creating zip archive...
powershell -Command "Compress-Archive -Path '%backupName%' -DestinationPath '%zipName%' -Force"

REM Remove temporary directory
rmdir /S /Q "%backupName%"

echo.
echo Backup created successfully: %zipName%
echo Backup info saved to: backup-info.txt
echo.
echo To restore:
echo 1. Extract the zip file
echo 2. Run: npm install
echo 3. Run: npm run dev
echo.
pause
