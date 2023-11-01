const express = require('express');
const fileController = require('../controllers/file-controller');
const { uploadFile } = require('../middlewares/file-upload');

const router = express.Router();

router.post('/', uploadFile, fileController.uploadFile);
router.get('/:publicKey', fileController.downloadFile);
router.delete('/:privateKey', fileController.deleteFile);

module.exports = router;
