# Getaway Hub Backend - Local Setup

The backend is split into two local services:

- `nest-js-backend`: NestJS API server. Runs on `http://localhost:8000` and exposes routes under `/api`.
- `scraping_api`: Next.js scraping service. Runs on `http://localhost:5001` and is called by the NestJS API.

## Prerequisites

- Node.js 20 or newer
- npm
- pnpm, for the NestJS backend
- Oxylabs credentials for live scraping results

Install pnpm if you do not already have it:

```bash
npm install -g pnpm
```

## 1. Clone the repository

```bash
git clone https://github.com/AbdulrahmanChalya/TheDevArchitects.git
cd TheDevArchitects
```

## 2. Install the NestJS API dependencies

```bash
cd backend/nest-js-backend
pnpm install
```

## 3. Install the scraping API dependencies

Open a new terminal from the project root:

```bash
cd backend/scraping_api
npm install
```

## 4. Configure environment variables

Create `backend/scraping_api/.env`:

```bash
OXYLABS_USERNAME=your_oxylabs_username
OXYLABS_PASSWORD=your_oxylabs_password
```

Optional: create `backend/nest-js-backend/.env` if the scraper runs somewhere other than `http://localhost:5001`:

```bash
SCRAPER_BASE_URL=http://localhost:5001
PORT=8000
```

## 5. Start the scraping API

From `backend/scraping_api`:

```bash
npm run dev
```

The scraping API will run at `http://localhost:5001`.

## 6. Start the NestJS API

In a separate terminal, from `backend/nest-js-backend`:

```bash
pnpm run start:dev
```

The NestJS API will run at `http://localhost:8000`.

## Useful endpoints

- NestJS API: `http://localhost:8000/api`
- Combined search endpoint: `http://localhost:8000/api/search`
- Proxied hotels endpoint: `http://localhost:8000/api/hotels`
- Proxied flights endpoint: `http://localhost:8000/api/flights`
- Proxied attractions endpoint: `http://localhost:8000/api/attractions`
- Scraping hotels endpoint: `http://localhost:5001/api/hotels`
- Scraping flights endpoint: `http://localhost:5001/api/flights`
- Scraping attractions endpoint: `http://localhost:5001/api/attractions`

## Notes

- Start `scraping_api` before running searches through the NestJS API.
- The scraping endpoints require Oxylabs credentials for live Expedia data.
- `requirements.txt` and the old Django commands are legacy artifacts. The current backend services in this repository are Node-based.
