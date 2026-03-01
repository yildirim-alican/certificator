#!/usr/bin/env bash
set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"

cd "$BACKEND_DIR"
if [ ! -f "venv/Scripts/python.exe" ] && [ ! -f "venv/bin/python" ]; then
  echo "[backend] Creating virtual environment..."
  if command -v py >/dev/null 2>&1; then
    py -3.12 -m venv venv || python -m venv venv
  else
    python -m venv venv
  fi
fi

if [ -f "venv/Scripts/activate" ]; then
  source venv/Scripts/activate
else
  source venv/bin/activate
fi

python -m pip install --upgrade pip setuptools wheel
python -m pip install -r requirements.txt
python -m playwright install chromium

echo "Starting backend..."
python main.py &
BACK_PID=$!

cd "$FRONTEND_DIR"
npm install

echo "Starting frontend..."
npm run dev &
FRONT_PID=$!

echo "Backend:  http://localhost:8000/api/v1"
echo "Frontend: http://localhost:3000"
echo "Press Ctrl+C to stop both"

cleanup() {
  echo "Stopping services..."
  kill $BACK_PID $FRONT_PID >/dev/null 2>&1 || true
}
trap cleanup EXIT INT TERM

wait
