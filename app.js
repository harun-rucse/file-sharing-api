const express = require('express');
const cors = require('cors');
const fileRoutes = require('./routes/file-routes');
const globalErrorHandler = require('./controllers/error-controller');
const AppError = require('./utils/app-error');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/files', fileRoutes);

app.all('*', (req, res, next) => {
  next(
    new AppError(
      `Can't find ${req.method} ${req.originalUrl} on this server.`,
      404
    )
  );
});

app.use(globalErrorHandler);

module.exports = app;
