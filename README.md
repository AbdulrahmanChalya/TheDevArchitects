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
   ```

3. **Start the development server:**
   ```bash
   npm run start
   ```

4. **Open your browser:**
   - Go to `http://localhost:3000`

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

## Summary of Recent Changes

Added Stripe payment system with secure card fields using @stripe/react-stripe-js.
Created a Django API backend to process Stripe PaymentIntents.
Added environment variables for Stripe keys (.env setup for frontend + Django settings).
Fixed CORS and allowed origins to enable frontend–backend communication.
Updated the frontend routing to use the new /payment flow.
Implemented automatic backend startup through:

npm run start


which runs both frontend and backend with one command.
Cleaned and corrected Django settings to remove syntax errors.
Installed missing backend dependencies such as corsheaders.
