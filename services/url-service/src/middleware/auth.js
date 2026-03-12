'use strict';

const { verifyAccessToken } = require('../utils/jwt');

/**
 * JWT Authentication middleware.
 * Expects: Authorization: Bearer <token>
 */
function authenticate(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Access token required' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = verifyAccessToken(token);
        req.user = { id: decoded.sub, email: decoded.email };
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, message: 'Access token expired' });
        }
        return res.status(401).json({ success: false, message: 'Invalid access token' });
    }
}

module.exports = { authenticate };
