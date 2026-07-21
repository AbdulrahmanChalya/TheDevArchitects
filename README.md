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
# Set this to the private Cloud Run scraper URL in production.
# Leave it unset for local development.
SCRAPER_AUTH_AUDIENCE=
DEEPSEEK_API_KEY=your_deepseek_api_key
OPENAI_API_KEY=your_openai_api_key
```

`backend/scraping_api/.env`

```bash
GOOGLE_PLACES_API_KEY=your_google_places_api_key
DUFFEL_ACCESS_TOKEN=your_duffel_access_token
LITEAPI_KEY=your_liteapi_key
```

The frontend sends the signed-in user's Firebase ID token to protected API routes. The
NestJS API verifies that token before allowing search, flight, hotel, AI package, or
assistant requests. Public discovery routes, such as place and airport suggestions,
remain available without signing in and are rate limited.

In production, set `SCRAPER_AUTH_AUDIENCE` to the same HTTPS URL used for
`SCRAPER_BASE_URL`. The NestJS API will then use its Cloud Run service identity when
calling the scraper. Grant that service identity the Cloud Run Invoker role before
removing public access from the scraper.

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
