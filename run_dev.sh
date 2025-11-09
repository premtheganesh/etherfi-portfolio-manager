#!/bin/bash

# Development startup script for DeFi Oracle Duo v2

echo "🚀 Starting DeFi Oracle Duo v2 Development Servers..."
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  Warning: .env file not found!"
    echo "Creating .env template..."
    echo "ANTHROPIC_API_KEY=your_api_key_here" > .env
    echo "Please edit .env and add your Anthropic API key"
    echo ""
fi

# Function to check if port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo "⚠️  Port $1 is already in use"
        return 1
    fi
    return 0
}

# Check if ports are available
check_port 5000
BACKEND_PORT_OK=$?

check_port 3000
FRONTEND_PORT_OK=$?

if [ $BACKEND_PORT_OK -ne 0 ] || [ $FRONTEND_PORT_OK -ne 0 ]; then
    echo "Please free up the ports and try again"
    exit 1
fi

# Start backend
echo "📡 Starting Flask backend on port 5000..."
python3 api_server.py &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"
echo ""

# Wait a bit for backend to start
sleep 2

# Start frontend
echo "⚛️  Starting React frontend on port 3000..."
cd frontend
npm start &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"
echo ""

echo "✅ Both servers started!"
echo ""
echo "Backend API: http://localhost:5000"
echo "Frontend App: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID

