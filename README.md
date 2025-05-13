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

1. Clone the repository
2. Run `docker-compose up` to start all services
3. Access Data Ingestion Service Swagger UI at [http://localhost:3001/api](http://localhost:3001/api)
4. Access Logging Service Swagger UI at [http://localhost:3002/api](http://localhost:3002/api)
5. Access MongoDB Express at [http://localhost:8081](http://localhost:8081) (username: admin, password: password)
6. Access RedisCommander at [http://localhost:8002](http://localhost:8002)

## Development

Each service is a separate NestJS application with shared libraries for common functionality.
