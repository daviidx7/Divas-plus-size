const { PrismaClient } = require('@prisma/client');

// Singleton do Prisma Client, evita abrir várias conexões em dev com nodemon
const prisma = new PrismaClient();

module.exports = prisma;
