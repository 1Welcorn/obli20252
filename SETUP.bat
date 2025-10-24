@echo off
echo ========================================
echo OBLI FLUENCY PATHFINDER - SETUP
echo ========================================
echo.

echo Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo Node.js found: 
node --version
echo.

echo Checking npm...
npm --version
echo.

echo Installing dependencies...
echo This may take a few minutes...
npm install

if %errorlevel% neq 0 (
    echo.
    echo ERROR: Failed to install dependencies!
    echo Please check your internet connection and try again.
    pause
    exit /b 1
)

echo.
echo ========================================
echo SETUP COMPLETE!
echo ========================================
echo.
echo To start development:
echo   npm run dev
echo.
echo To build for production:
echo   npm run build
echo.
echo Your app will be available at:
echo   http://localhost:5173
echo.
echo Live deployed version:
echo   https://1welcorn.github.io/obli-fluency-pathfinder/
echo.
pause
