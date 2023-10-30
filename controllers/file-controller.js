const mime = require('mime-types');
const FileAccess = require('../services/file-service');
const catchAsync = require('../utils/catch-async');
const AppError = require('../utils/app-error');

const fileAccess = new FileAccess(process.env.FOLDER);

/**
 * @desc    Upload a new file
 * @route   POST /api/files
 * @access  Public
 */
const uploadFile = catchAsync(async (req, res, next) => {
  if (!req.file) return next(new AppError('Please upload a file', 400));

  const { publicKey, privateKey } = await fileAccess.uploadFile(req.file);

  res.status(201).json({ publicKey, privateKey });
});

/**
 * @desc    Get a file by publicKey
 * @route   GET /api/files/:publicKey
 * @access  Public
 */
const getFile = catchAsync(async (req, res, next) => {
  const { publicKey } = req.params;
  if (!publicKey) return next(new AppError('PublicKey is required', 400));

  const fileStream = await fileAccess.getFile(publicKey);

  const mimeType = mime.lookup(fileStream?.path);
  const extension = mime.extension(mimeType);

  if (mimeType) {
    res.setHeader('Content-Type', mimeType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${publicKey}.${extension}`
    );

    fileStream.pipe(res);
  } else {
    return next(new AppError('File not found for the provided publicKey', 404));
  }
});

/**
 * @desc    Delete a file by privateKey
 * @route   DELETE /api/files/:privateKey
 * @access  Private
 */
const deleteFile = catchAsync(async (req, res, next) => {
  const { privateKey } = req.params;
  if (!privateKey) return next(new AppError('PrivateKey is required', 400));

  await fileAccess.deleteFile(privateKey);

  res.status(201).json({ message: 'File delete successfull' });
});

module.exports = {
  uploadFile,
  getFile,
  deleteFile,
};
