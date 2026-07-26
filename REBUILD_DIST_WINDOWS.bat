@echo off
cd /d "%~dp0"
where node >nul 2>nul || (echo Node.js is required.& pause & exit /b 1)
call npm run build:static
if errorlevel 1 (echo Failed to rebuild dist.& pause & exit /b 1)
echo dist rebuild complete.
pause
