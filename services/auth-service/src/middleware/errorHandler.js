'use strict';

/**
 * Global Express error handler middleware.
 */
function errorHandler(err, req, res, _next) {
    const statusCode = err.status || err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    if (process.env.NODE_ENV !== 'production') {
        console.error('[Error]', err);
    }

    res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
    });
}

module.exports = { errorHandler };
