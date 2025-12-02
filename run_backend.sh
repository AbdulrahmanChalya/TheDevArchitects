#!/usr/bin/env bash
set -e

echo "==> Getaway Hub Backend – Cross-Platform Runner"

# Determine OS (macOS/Linux will match Darwin/Linux, Windows will match MINGW/MSYS/…)
OS="$(uname -s | tr '[:upper:]' '[:lower:]')"

if [[ "$OS" == "darwin" || "$OS" == "linux" ]]; then
  PLATFORM="unix"
elif [[ "$OS" == *"mingw"* || "$OS" == *"msys"* || "$OS" == *"cygwin"* ]]; then
  PLATFORM="windows"
else
  echo "!! Unsupported OS: $OS"
  exit 1
fi

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$REPO_ROOT"

# Choose Python interpreter
if [[ -n "${PYTHON:-}" ]]; then
  # If user set $PYTHON in their env, respect it
  :
elif command -v python3.13 >/dev/null 2>&1; then
  PYTHON="$(command -v python3.13)"
elif command -v python3 >/dev/null 2>&1; then
  PYTHON="$(command -v python3)"
elif command -v python >/dev/null 2>&1; then
  PYTHON="$(command -v python)"
else
  echo "!! No suitable python interpreter found (need 3.10+)."
  exit 1
fi
VENV_DIR=".venv"
REQ_FILE="backend/requirements.txt"
DJANGO_DIR="backend/django_api"
SCRAPER_DIR="backend/scraping_api"

USE_SCRAPER=false
if [[ "${1-}" == "--with-scraper" ]]; then
  USE_SCRAPER=true
fi

echo "==> OS Detected: $PLATFORM"
echo "==> Working directory: $REPO_ROOT"

# Create venv if missing
if [[ ! -d "$VENV_DIR" ]]; then
  echo "==> Creating Python venv"
  $PYTHON -m venv "$VENV_DIR"
fi

# Activate virtual environment + adjust Python command
if [[ "$PLATFORM" == "unix" ]]; then
  echo "==> Activating venv (Unix/macOS)"
  # shellcheck disable=SC1090
  source "$VENV_DIR/bin/activate"
elif [[ "$PLATFORM" == "windows" ]]; then
  PYTHON="python"
  echo "==> Activating venv (Windows)"
  # shellcheck disable=SC1090
  source "$VENV_DIR/Scripts/activate"
fi

# Install deps
echo "==> Installing backend Python dependencies"
pip install --upgrade pip
pip install -r "$REQ_FILE"

# Apply migrations before running
cd "$DJANGO_DIR"
echo "==> Applying migrations"
python manage.py migrate

# Optional scraper start
if $USE_SCRAPER; then
  echo "==> Starting Scraper API in background…"
  (
    cd "$REPO_ROOT/$SCRAPER_DIR"
    npm install
    npm run dev
  ) &
fi

echo "==> Launching Django Backend @ http://localhost:8000"
exec python manage.py runserver 8000


