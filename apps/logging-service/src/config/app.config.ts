export default () => ({
  app: {
    port: process.env.PORT_LOGGING
      ? parseInt(process.env.PORT_LOGGING, 10)
      : 3002,
  },
});
