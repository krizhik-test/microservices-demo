FROM node:18-slim AS build

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npx nest build logging-service

FROM node:18-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    build-essential \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    && rm -rf /var/lib/apt/lists/*

RUN ln -s /usr/lib/x86_64-linux-gnu/libjpeg.so /usr/lib/x86_64-linux-gnu/libjpeg.so.8

COPY package*.json ./

RUN npm ci --only=production

COPY --from=build /app/dist ./dist
COPY --from=build /app/nest-cli.json ./
EXPOSE 3002

CMD ["node", "dist/apps/logging-service/main"]
