export default () => ({
  app: {
    port: process.env.PORT_DATA_INGESTION
      ? parseInt(process.env.PORT_DATA_INGESTION, 10)
      : 3001,
  },
});
