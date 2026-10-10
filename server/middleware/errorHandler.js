/**
 * Global error handler middleware.
 * Catches errors passed via next(error) and formats them into a standard JSON response.
 */
const errorHandler = (err, req, res, next) => {
  // Determine status code (use 500 if none is set or if default 200)
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

  res.status(statusCode).json({
    message: err.message,
    // Include stack trace only in development environment for security
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = errorHandler;
