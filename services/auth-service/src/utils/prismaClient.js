'use strict';

const { PrismaClient } = require('@prisma/client');

let prisma;

/**
 * Returns a singleton PrismaClient instance.
 */
function getPrismaClient() {
    if (!prisma) {
        prisma = new PrismaClient({
            log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
        });
    }
    return prisma;
}

module.exports = { getPrismaClient };
