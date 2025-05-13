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
RUN npx nest build data-ingestion-service

# Production stage
FROM node:18-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy built application from build stage
COPY --from=build /app/dist ./dist
COPY --from=build /app/nest-cli.json ./

# Create directories for file storage
RUN mkdir -p uploads downloads

# Expose port
EXPOSE 3001

# Start application
CMD ["node", "dist/apps/data-ingestion-service/main"]
