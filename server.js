const dotenv = require('dotenv');
const logger = require('./logger');
dotenv.config({ path: `${__dirname}/.env.${process.env.NODE_ENV}` });

process.on('uncaughtException', () => {
  logger.on('error', () => {
    process.exit(1);
  });
});

const app = require('./app');
const cleanupJob = require('./utils/cleanupJob');

const PORT = process.env.PORT || 4000;
const server = app.listen(PORT, () => {
  logger.info(`API is listening in [${process.env.NODE_ENV}] on port ${PORT}`);
});

// Schedule cleanup job
cleanupJob();

process.on('unhandledRejection', () => {
  logger.on('error', () => {
    server.close(() => {
      process.exit(1);
    });
  });
});
