
FROM node:22-alpine AS build

WORKDIR /app

COPY scraping_api/package*.json ./
RUN npm ci

COPY scraping_api/. .
COPY destinations.json ./destinations.json
RUN npm run build

FROM node:22-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production

COPY scraping_api/package*.json ./
RUN npm ci --omit=dev

COPY --from=build /app/.next ./.next
COPY --from=build /app/destinations.json ./destinations.json

CMD ["npm", "start"]
