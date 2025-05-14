export default () => ({
  app: {
    portLogging: process.env.PORT_LOGGING
      ? parseInt(process.env.PORT_LOGGING, 10)
      : 3002,
    appDataIngestion: {
      portDataIngestion: process.env.PORT_DATA_INGESTION
        ? parseInt(process.env.PORT_DATA_INGESTION, 10)
        : 3001,
    },
  },
  redis: {
    host: process.env.REDIS_HOST || "localhost",
    port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 6379,
    password: process.env.REDIS_PASSWORD || "",
  },
  mongo: {
    loggingUri: process.env.LOGGING_SERVICE_MONGODB_URI,
    dataIngestionUri: process.env.DATA_SERVICE_MONGODB_URI,
  },
});
