#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting Travel Booking Application...${NC}"
echo ""

# Function to cleanup on exit
cleanup() {
    echo -e "\n${BLUE}Shutting down servers...${NC}"
    kill 0
    exit
}

trap cleanup SIGINT SIGTERM

# Start Django backend
echo -e "${BLUE}Starting Django backend on http://127.0.0.1:8000${NC}"
cd backend/django_api && python3 manage.py runserver &
BACKEND_PID=$!

# Start Scraping API
echo -e "${BLUE}Starting ScrapingAPI"
cd backend/scraping_api && npm run dev &
SCRAPING_PID=$!

# Start frontend
echo -e "${BLUE}Starting frontend on http://localhost:3000${NC}"
cd frontend && npm run dev &
FRONTEND_PID=$!

echo ""
echo -e "${GREEN}✓ Both servers are starting...${NC}"
echo -e "${GREEN}✓ Frontend: http://localhost:3000${NC}"
echo -e "${GREEN}✓ Backend: http://127.0.0.1:8000${NC}"
echo ""
echo -e "Press ${BLUE}Ctrl+C${NC} to stop both servers"

# Wait for both processes
wait
