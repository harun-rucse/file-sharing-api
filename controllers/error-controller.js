const AppError = require('../utils/app-error');
const logger = require('../logger');

const handleFileUploadError = () => {
  return new AppError('File Upload failed. Please try again.', 400);
};

const sendErrorDev = (err, req, res) => {
  logger.error(err.message);

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};

const sendErrorTest = (err, req, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};

const sendErrorProd = (err, req, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // Log unknown errors
    logger.error(err);

    res.status(500).json({
      status: 'error',
      message: 'Something went wrong!',
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else {
    let error = { ...err };
    error.message = err.message;
    error.name = err.name;

    if (req.file) error = handleFileUploadError();

    if (process.env.NODE_ENV === 'test') {
      sendErrorTest(error, req, res);
    } else if (process.env.NODE_ENV === 'production') {
      sendErrorProd(error, req, res);
    }
  }
};
