const { PrismaClient } = require('@prisma/client');

// Creates a Prisma client instance used for all controllers
const prisma = new PrismaClient();

module.exports = prisma;
