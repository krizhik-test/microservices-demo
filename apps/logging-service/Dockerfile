# Build stage
FROM node:18-slim AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npx nest build logging-service

# Production stage
FROM node:18-slim

WORKDIR /app

# Install dependencies required for canvas (for PDF generation)
RUN apt-get update && apt-get install -y \
    build-essential \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    && rm -rf /var/lib/apt/lists/*

# Create symbolic link for libjpeg
RUN ln -s /usr/lib/x86_64-linux-gnu/libjpeg.so /usr/lib/x86_64-linux-gnu/libjpeg.so.8

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy built application from build stage
COPY --from=build /app/dist ./dist
COPY --from=build /app/nest-cli.json ./

# Expose port
EXPOSE 3002

# Start application
CMD ["node", "dist/apps/logging-service/main"]
