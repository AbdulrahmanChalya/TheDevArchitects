# TheDevArchitects - Getaway Hub

A trip planning app for searching destinations, flights, hotels, attractions, and generating travel packages.

## Local Setup

The app runs as three local services:

- Frontend: `http://localhost:3000`
- NestJS API: `http://localhost:8000/api`
- Scraper API: `http://localhost:5001`

## Prerequisites

- Node.js 20 or newer
- npm
- Docker Desktop, only if using Docker Compose

## Environment Variables

Create or update these files if they do not already exist.

`frontend/.env`

```bash
VITE_BACKEND_URL=http://localhost:8000
VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_token
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

`backend/.env`

```bash
PORT=8000
SCRAPER_BASE_URL=http://localhost:5001
DEEPSEEK_API_KEY=your_deepseek_api_key
OPENAI_API_KEY=your_openai_api_key
```

`backend/scraping_api/.env`

```bash
OXYLABS_USERNAME=your_oxylabs_username
OXYLABS_PASSWORD=your_oxylabs_password
GOOGLE_PLACES_API_KEY=your_google_places_api_key
DUFFEL_ACCESS_TOKEN=your_duffel_access_token
LITEAPI_KEY=your_liteapi_key
```

Some features can still load without every key, but live search, AI package generation, maps, flights, and payments need their related keys.

## Run Locally Without Docker

Install dependencies:

```bash
cd frontend
npm install

cd ../backend/nest-js-backend
npm install

cd ../scraping_api
npm install
```

Start the scraper API:

```bash
cd backend/scraping_api
npm run dev
```

Start the NestJS API in a second terminal:

```bash
cd backend/nest-js-backend
npm run start:dev
```

Start the frontend in a third terminal:

```bash
cd frontend
npm run dev
```

Open:

```text
http://localhost:3000
```

## Run With Docker

From the project root:

```bash
docker compose up --build
```

Open:

```text
http://localhost:3000
```

## Useful Endpoints

```text
Frontend:       http://localhost:3000
NestJS API:     http://localhost:8000/api
Search:         http://localhost:8000/api/search
AI packages:    http://localhost:8000/api/ai/vacation-packages
Scraper API:    http://localhost:5001
```

## Tech Stack

- React + TypeScript
- Vite
- Tailwind CSS
- NestJS
- Next.js scraper service
- DeepSeek / OpenAI API integrations
- Google Places
- Mapbox
- Stripe
