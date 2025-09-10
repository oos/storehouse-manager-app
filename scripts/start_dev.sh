#!/bin/bash

# Script to start both backend and frontend in development mode

echo "Starting Storehouse Manager Development Environment..."

# Check if Python virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install Python dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Set up database
echo "Setting up database..."
python scripts/setup_db.py

# Start backend in background
echo "Starting backend server..."
python run_backend.py &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Please install Node.js to run the frontend."
    kill $BACKEND_PID
    exit 1
fi

# Install Node.js dependencies
echo "Installing Node.js dependencies..."
npm install

# Start frontend
echo "Starting frontend server..."
npm start &
FRONTEND_PID=$!

echo "Development environment started!"
echo "Backend: http://localhost:8001"
echo "Frontend: http://localhost:3002"
echo "API Docs: http://localhost:8001/docs"
echo ""
echo "Press Ctrl+C to stop both servers"

# Function to cleanup on exit
cleanup() {
    echo "Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Wait for both processes
wait
