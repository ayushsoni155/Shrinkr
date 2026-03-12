'use strict';

/**
 * Base62 alphabet for short ID generation.
 * Avoids ambiguous characters (0, O, I, l) for better UX.
 */
const BASE62 = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const SHORT_ID_LENGTH = 7;

/**
 * Generate a cryptographically-safe random 7-character Base62 ID.
 */
function generateShortId() {
    const { randomBytes } = require('crypto');
    const bytes = randomBytes(SHORT_ID_LENGTH * 2);
    let result = '';
    for (let i = 0; i < bytes.length && result.length < SHORT_ID_LENGTH; i++) {
        const index = bytes[i] % BASE62.length;
        result += BASE62[index];
    }
    return result;
}

/**
 * Ensure the generated ID is unique in the database.
 * Retries up to maxAttempts times before throwing.
 */
async function generateUniqueShortId(UrlModel, maxAttempts = 5) {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const shortId = generateShortId();
        const existing = await UrlModel.findOne({ shortId }).lean();
        if (!existing) return shortId;
    }
    throw new Error('Failed to generate unique short ID after multiple attempts');
}

module.exports = { generateShortId, generateUniqueShortId };
