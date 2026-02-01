#!/bin/bash
# Mood Tracker Application Startup Script for Linux/Mac
# This script starts both the FastAPI FER server and Express backend

echo "========================================"
echo "Mood Tracker - Multi-Server Startup"
echo "========================================"

# Get the script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR" || exit 1

# Check if FER server should be started
START_FER=1
if [[ "$1" == "no-fer" ]]; then
    START_FER=0
fi

# Start FastAPI FER Server (Python)
if [ $START_FER -eq 1 ]; then
    echo ""
    echo "Starting FastAPI FER Server on port 8000..."
    echo "Note: Make sure Python and requirements are installed"
    echo "Run: cd backend/ai && pip install -r requirements.txt"
    echo ""
    
    if [ -f "backend/ai/main.py" ]; then
        cd backend/ai
        python main.py &
        FER_PID=$!
        cd - > /dev/null
    else
        echo "Warning: Could not find backend/ai/main.py"
        echo "Please ensure you are running this script from the project root"
    fi
    
    sleep 3
fi

# Start Express Backend Server (Node.js)
echo ""
echo "Starting Express Backend Server on port 5001..."
echo "Note: Make sure Node.js and dependencies are installed"
echo "Run: cd backend && npm install"
echo ""

if [ -f "backend/package.json" ]; then
    cd backend
    npm start &
    EXPRESS_PID=$!
    cd - > /dev/null
else
    echo "Warning: Could not find backend/package.json"
    echo "Please ensure you are running this script from the project root"
fi

sleep 3

# Start Frontend Server (React/Vite)
echo ""
echo "Starting Frontend Development Server on port 5173..."
echo "Note: Make sure Node.js and dependencies are installed"
echo "Run: cd frontend && npm install"
echo ""

if [ -f "frontend/package.json" ]; then
    cd frontend
    npm run dev &
    FRONTEND_PID=$!
    cd - > /dev/null
else
    echo "Warning: Could not find frontend/package.json"
    echo "Please ensure you are running this script from the project root"
fi

echo ""
echo "========================================"
echo "All servers started!"
echo "========================================"
echo ""
echo "Access points:"
echo "- Frontend:  http://localhost:5173"
echo "- Backend:   http://localhost:5001"
if [ $START_FER -eq 1 ]; then
    echo "- FER API:   http://localhost:8000"
fi
echo ""
echo "Process IDs:"
if [ $START_FER -eq 1 ]; then
    echo "- FER Server:      $FER_PID"
fi
echo "- Express Server:  $EXPRESS_PID"
echo "- Frontend Server: $FRONTEND_PID"
echo ""
echo "To stop all servers, run:"
echo "kill $FER_PID $EXPRESS_PID $FRONTEND_PID"
echo ""

# Wait for user interrupt
trap "echo 'Shutting down...'; kill $FER_PID $EXPRESS_PID $FRONTEND_PID 2>/dev/null; exit 0" SIGINT SIGTERM

wait
