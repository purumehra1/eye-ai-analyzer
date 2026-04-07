#!/bin/bash
# EyeAI Analyzer — Start both frontend and backend

echo "🚀 Starting EyeAI Analyzer..."
echo ""

# Check python
if ! command -v python3 &>/dev/null; then
  echo "❌ Python3 not found. Please install Python 3.10+"
  exit 1
fi

# Check node
if ! command -v node &>/dev/null; then
  echo "❌ Node.js not found. Please install Node.js 18+"
  exit 1
fi

# Install backend deps
echo "📦 Installing backend dependencies..."
cd backend
pip install -r requirements.txt -q
cd ..

# Install frontend deps
echo "📦 Installing frontend dependencies..."
cd frontend
npm install --silent
cd ..

echo ""
echo "✅ All dependencies installed!"
echo ""
echo "🔬 Starting backend on http://localhost:8000"
echo "🌐 Starting frontend on http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop both servers."
echo ""

# Start backend
cd backend
python3 main.py &
BACKEND_PID=$!
cd ..

# Wait for backend
sleep 3

# Start frontend
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

# Trap Ctrl+C
trap "echo ''; echo 'Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" INT

echo "✅ Both servers running!"
echo "   → Frontend: http://localhost:5173"
echo "   → Backend API: http://localhost:8000"
echo "   → API Docs: http://localhost:8000/docs"
echo ""

wait
