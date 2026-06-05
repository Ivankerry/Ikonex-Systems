// errorHandler.js
// Global Express error handler. Catches all errors passed via next(err).
// Returns a consistent JSON error shape to the client.

module.exports = (err, req, res, next) => {
  const status  = err.statusCode || 500;
  const message = err.message    || 'Internal Server Error';

  if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === undefined) {
    console.error(`[${req.method}] ${req.path} - ${status}: ${message}`);
  }

  res.status(status).json({ success: false, message });
};
