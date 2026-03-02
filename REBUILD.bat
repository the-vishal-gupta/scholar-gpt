@echo off
echo Rebuilding ScholarGPT...
cd /d "%~dp0"
call npm run build
echo.
echo Build complete! Now run: npm run dev
pause
