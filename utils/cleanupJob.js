const cron = require('node-cron');
const fileController = require('../controllers/file-controller');

function cleanupJob() {
  // Clean up files every 24 hours
  cron.schedule('0 0 * * *', async () => {
    await fileController.cleanUpFiles();
  });
}

module.exports = cleanupJob;
