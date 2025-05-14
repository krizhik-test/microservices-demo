FROM node:18-slim AS build

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npx nest build data-ingestion-service

FROM node:18-slim

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY --from=build /app/dist ./dist
COPY --from=build /app/nest-cli.json ./

RUN mkdir -p uploads downloads

EXPOSE 3001

CMD ["node", "dist/apps/data-ingestion-service/main"]
