# NestJS Microservices Project

This project consists of two NestJS microservices that communicate via Redis Pub/Sub:

1. **Data Ingestion Service**: Handles data ingestion from public APIs, file operations, and MongoDB storage.
2. **Logging Service**: Subscribes to events from Data Ingestion Service and provides reporting functionality.

## Architecture

- **Database**: MongoDB for data and event storage
- **Messaging**: Redis Pub/Sub for inter-service communication
- **Monitoring**: RedisTimeSeries for performance metrics and logging
- **Documentation**: Swagger
- **Containerization**: Docker & Docker Compose

## Services

### Data Ingestion Service

- Fetches data from public APIs
- Handles file operations (upload, download, parsing)
- Stores data in MongoDB
- Publishes events to Redis Pub/Sub
- Logs operations with RedisTimeSeries
- Provides query analysis endpoint to check MongoDB index usage

### Logging Service

- Subscribes to events from Data Ingestion Service
- Stores event logs in MongoDB
- Provides APIs to query logs
- Generates PDF reports with charts

## Setup Instructions

### Running with Docker Compose (Full Stack)

1. Clone the repository
2. Run `docker compose up -d` to start all services
3. Access Data Ingestion Service Swagger UI at [http://localhost:3001/api](http://localhost:3001/api)
4. Access Logging Service Swagger UI at [http://localhost:3002/api](http://localhost:3002/api)
5. Access MongoDB Express at [http://localhost:8081](http://localhost:8081) (username: admin, password: password)
6. Access RedisCommander at [http://localhost:8002](http://localhost:8002)

### Running Services Locally with Docker for Dependencies

If you want to run the NestJS services locally while using Docker for Redis and MongoDB:

1. Start the required Docker containers for dependencies:

   ```bash
   # Start Redis with TimeSeries module
   docker run -d --name redis -p 6379:6379 redislabs/redistimeseries:latest

   # Start MongoDB
   docker run -d --name mongodb -p 27017:27017 mongo:latest

   # Start MongoDB Express (optional, for database management)
   docker run -d --name mongo-express -p 8081:8081 \
     -e ME_CONFIG_MONGODB_SERVER=localhost \
     -e ME_CONFIG_MONGODB_PORT=27017 \
     -e ME_CONFIG_BASICAUTH_USERNAME=admin \
     -e ME_CONFIG_BASICAUTH_PASSWORD=password \
     mongo-express:latest

   # Start Redis Commander (optional, for Redis management)
   docker run -d --name redis-commander -p 8002:8081 \
     -e REDIS_HOSTS=local:localhost:6379 \
     rediscommander/redis-commander:latest
   ```

2. Ensure your `.env` file has the correct configuration for local development:

   ```env
   NODE_ENV=development

   PORT_DATA_INGESTION=3001
   PORT_LOGGING=3002

   REDIS_HOST=localhost
   REDIS_PORT=6379
   REDIS_PASSWORD=

   DATA_SERVICE_MONGODB_URI=mongodb://localhost:27017/data_service
   LOGGING_SERVICE_MONGODB_URI=mongodb://localhost:27017/logging_service
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Start the services in development mode:

   ```bash
   # Start Data Ingestion Service
   npm run start:dev data-ingestion-service

   # In another terminal, start Logging Service
   npm run start:dev logging-service
   ```

5. Access the services:
   - Data Ingestion Service: [http://localhost:3001](http://localhost:3001)
   - Logging Service: [http://localhost:3002](http://localhost:3002)
   - MongoDB Express: [http://localhost:8081](http://localhost:8081)
   - Redis Commander: [http://localhost:8002](http://localhost:8002)

## Development

Each service is a separate NestJS application with shared libraries for common functionality.
