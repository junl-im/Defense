@echo off
setlocal
chcp 65001 >nul
cd /d "%~dp0.."
where node >nul 2>nul || (echo [오류] Node.js가 필요합니다.& pause & exit /b 1)
call npm run build:static
if errorlevel 1 (echo [오류] dist 재생성에 실패했습니다.& pause & exit /b 1)
echo [완료] dist 폴더를 재생성했습니다.
pause
