'use strict';

const jwt = require('jsonwebtoken');

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'change-me-access-secret';

function verifyAccessToken(token) {
    return jwt.verify(token, ACCESS_SECRET);
}

module.exports = { verifyAccessToken };
