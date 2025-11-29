/**
 * Request Timeout Middleware
 * Prevents requests from hanging indefinitely
 */

const TIMEOUT_MS = 30000; // 30 seconds

const timeoutMiddleware = (req, res, next) => {
  // Set timeout for the request
  const timeout = setTimeout(() => {
    if (!res.headersSent) {
      res.status(408).json({
        error: 'Request timeout',
        message: 'The request took too long to process. Please try again.'
      });
    }
  }, TIMEOUT_MS);

  // Clear timeout when response is sent
  const originalEnd = res.end;
  res.end = function(...args) {
    clearTimeout(timeout);
    originalEnd.apply(this, args);
  };

  next();
};

module.exports = timeoutMiddleware;

