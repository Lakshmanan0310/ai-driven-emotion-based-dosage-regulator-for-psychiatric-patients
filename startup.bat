@echo off
REM Mood Tracker Application Startup Script for Windows
REM This script starts both the FastAPI FER server and Express backend

echo ========================================
echo Mood Tracker - Multi-Server Startup
echo ========================================

REM Get the current directory
set SCRIPT_DIR=%~dp0

REM Check if FastAPI server should be started
set START_FER=1
if "%1"=="no-fer" set START_FER=0

REM Start FastAPI FER Server (Python)
if %START_FER% equ 1 (
    echo.
    echo Starting FastAPI FER Server on port 8000...
    echo Note: Make sure Python and requirements are installed
    echo Run: cd backend\ai && pip install -r requirements.txt
    echo.
    
    REM Check if we're in the right directory
    if exist "backend\ai\main.py" (
        start "FER Server" cmd /k cd backend\ai && python main.py
    ) else if exist "..\ai\main.py" (
        start "FER Server" cmd /k cd ..\ai && python main.py
    ) else (
        echo Warning: Could not find backend/ai/main.py
        echo Please ensure you are running this script from the project root
    )
    
    timeout /t 3 >nul
)

REM Start Express Backend Server (Node.js)
echo.
echo Starting Express Backend Server on port 5001...
echo Note: Make sure Node.js and dependencies are installed
echo Run: cd backend && npm install
echo.

if exist "backend\package.json" (
    start "Express Server" cmd /k cd backend && npm start
) else if exist "..\package.json" (
    start "Express Server" cmd /k cd .. && npm start
) else (
    echo Warning: Could not find backend/package.json
    echo Please ensure you are running this script from the project root
)

timeout /t 3 >nul

REM Start Frontend Server (React/Vite)
echo.
echo Starting Frontend Development Server on port 5173...
echo Note: Make sure Node.js and dependencies are installed
echo Run: cd frontend && npm install
echo.

if exist "frontend\package.json" (
    start "Frontend Server" cmd /k cd frontend && npm run dev
) else if exist "..\frontend\package.json" (
    start "Frontend Server" cmd /k cd ..\frontend && npm run dev
) else (
    echo Warning: Could not find frontend/package.json
    echo Please ensure you are running this script from the project root
)

echo.
echo ========================================
echo All servers started!
echo ========================================
echo.
echo Access points:
echo - Frontend:  http://localhost:5173
echo - Backend:   http://localhost:5001
echo - FER API:   http://localhost:8000
echo.
echo Press Ctrl+C to stop any server window
echo.
pause
