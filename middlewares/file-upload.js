const multer = require('multer');

const upload = multer({
  storage: multer.memoryStorage(),
});
const uploadFile = upload.single('file');

module.exports = { uploadFile };
