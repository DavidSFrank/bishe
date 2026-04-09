#!/usr/bin/env zsh
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
ADMIN_DIR="$ROOT_DIR/admin-web"
LOG_DIR="$ROOT_DIR/.runlogs"

BACKEND_PORT=8000
ADMIN_PORT=8080
BACKEND_PID=""
ADMIN_PID=""
STARTED_BACKEND=0
STARTED_ADMIN=0

mkdir -p "$LOG_DIR"

is_port_listening() {
  local port="$1"
  lsof -nP -iTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1
}

wait_for_port() {
  local port="$1"
  local retries="${2:-40}"
  local i=1
  while [ "$i" -le "$retries" ]; do
    if is_port_listening "$port"; then
      return 0
    fi
    sleep 0.5
    i=$((i + 1))
  done
  return 1
}

cleanup() {
  echo ""
  echo "Stopping services..."

  if [ "$STARTED_ADMIN" -eq 1 ] && [ -n "$ADMIN_PID" ]; then
    kill "$ADMIN_PID" >/dev/null 2>&1 || true
  fi
  if [ "$STARTED_BACKEND" -eq 1 ] && [ -n "$BACKEND_PID" ]; then
    kill "$BACKEND_PID" >/dev/null 2>&1 || true
  fi

  echo "Done."
}

trap cleanup INT TERM EXIT

echo "[1/3] Preparing environment..."
if [ ! -d "$BACKEND_DIR" ] || [ ! -d "$ADMIN_DIR" ]; then
  echo "Project folders not found. Expected: backend/ and admin-web/"
  exit 1
fi

if [ ! -d "$ADMIN_DIR/node_modules" ]; then
  echo "Installing admin-web dependencies (first run)..."
  (
    cd "$ADMIN_DIR"
    npm install --no-audit --no-fund
  )
fi

echo "[2/3] Starting backend (Django) on 127.0.0.1:$BACKEND_PORT..."
if is_port_listening "$BACKEND_PORT"; then
  echo "Backend port $BACKEND_PORT is already in use. Reusing existing service."
else
  (
    cd "$BACKEND_DIR"
    if [ -f "$ROOT_DIR/venv/bin/activate" ]; then
      source "$ROOT_DIR/venv/bin/activate"
    fi
    python manage.py runserver 127.0.0.1:$BACKEND_PORT
  ) > "$LOG_DIR/backend.log" 2>&1 &
  BACKEND_PID="$!"
  STARTED_BACKEND=1

  if ! wait_for_port "$BACKEND_PORT" 60; then
    echo "Failed to start backend. See log: $LOG_DIR/backend.log"
    exit 1
  fi
fi

echo "[3/3] Starting admin-web (Vite) on 127.0.0.1:$ADMIN_PORT..."
if is_port_listening "$ADMIN_PORT"; then
  echo "Admin port $ADMIN_PORT is already in use. Reusing existing service."
else
  (
    cd "$ADMIN_DIR"
    npm run dev -- --host 127.0.0.1 --port $ADMIN_PORT --strictPort
  ) > "$LOG_DIR/admin-web.log" 2>&1 &
  ADMIN_PID="$!"
  STARTED_ADMIN=1

  if ! wait_for_port "$ADMIN_PORT" 60; then
    echo "Failed to start admin-web. See log: $LOG_DIR/admin-web.log"
    exit 1
  fi
fi

echo ""
echo "Services are up:"
echo "- Admin Web: http://127.0.0.1:$ADMIN_PORT/#/login"
echo "- Backend API: http://127.0.0.1:$BACKEND_PORT/api/"
echo ""
echo "Logs:"
echo "- $LOG_DIR/backend.log"
echo "- $LOG_DIR/admin-web.log"
echo ""
echo "Press Ctrl+C to stop services started by this script."

while true; do
  sleep 1
done

