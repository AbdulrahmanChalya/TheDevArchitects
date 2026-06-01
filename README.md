# TheDevArchitects - Getaway Hub

A trip planning application for booking flights, hotels, and creating travel itineraries.

## How to Run the App

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   npm install stripe dotenv
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   - Go to `http://localhost:3000`

## Running With Docker

This project can also be run with Docker Compose from the project root.

### Prerequisites

- Docker Desktop installed and running

### Start the App

```bash
docker compose up --build
```

Then open:

```text
http://localhost:3000
```

Services:

```text
Frontend: http://localhost:3000
API:      http://localhost:8000/api
Scraper:  http://localhost:5001
```

### Stop the App

Press `Ctrl + C` in the terminal running Docker Compose, then run:

```bash
docker compose down
```

### Useful Commands

Run in the background:

```bash
docker compose up -d --build
```

View logs:

```bash
docker compose logs -f
```

Rebuild from scratch:

```bash
docker compose build --no-cache
docker compose up
```

Check running containers:

```bash
docker compose ps
```

## Features

- Search destinations with autocomplete
- Date range picker for check-in/check-out
- Guest and room selection with automatic room adjustment
- Budget planning
- Real-time validation
- Integrated Stripe payment system
- Django backend for payment processing

## Tech Stack

- React + TypeScript
- Tailwind CSS
- Express.js
- Vite
- Django + Python backend
- Stripe Payments
