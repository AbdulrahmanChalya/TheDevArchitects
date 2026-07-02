
FROM node:22-alpine

WORKDIR /app

COPY scraping_api/package*.json ./
RUN npm ci

COPY scraping_api/. .
COPY destinations.json ./destinations.json

EXPOSE 5001

CMD ["npm", "run", "dev"]
