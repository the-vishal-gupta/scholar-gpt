@echo off
echo ========================================
echo   ScholarAI Research Platform
echo   Production-Ready Launch
echo ========================================
echo.

echo [1/3] Checking Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js not found! Please install Node.js first.
    pause
    exit /b 1
)
echo ✓ Node.js found

echo.
echo [2/3] Checking dependencies...
if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install
    if errorlevel 1 (
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
)
echo ✓ Dependencies ready

echo.
echo [3/3] Starting development server...
echo.
echo ========================================
echo   Opening at http://localhost:5173
echo   Press Ctrl+C to stop
echo ========================================
echo.

call npm run dev
