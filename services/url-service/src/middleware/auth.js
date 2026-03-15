'use strict';

const { verifyAccessToken } = require('../utils/jwt');

/**
 * JWT Authentication middleware.
 * Expects: Authorization: Bearer <token> or accessToken cookie
 */
function authenticate(req, res, next) {
    let token;
    
    // First try to extract token from cookies
    if (req.cookies && req.cookies.accessToken) {
        token = req.cookies.accessToken;
    } 
    // Fallback to Authorization header
    else if (req.headers['authorization'] && req.headers['authorization'].startsWith('Bearer ')) {
        token = req.headers['authorization'].split(' ')[1];
    }
    
    if (!token) {
        return res.status(401).json({ success: false, message: 'Access token required' });
    }
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
