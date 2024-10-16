// errorHandler.js
const logger = require('../utils/logger'); // Assuming you have a logger utility

// Define a custom error handler middleware
const errorHandler = (err, req, res, next) => {
  // Log the error
  logger.error(err);

  // Customize the response based on the environment (development vs production)
  const statusCode = err.statusCode || 500;
  const errorResponse = {
    success: false,
    message: err.message || 'Internal Server Error',
  };

  // In development mode, include stack trace for debugging
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
  }

  res.status(statusCode).json(errorResponse);
};

module.exports = errorHandler;
