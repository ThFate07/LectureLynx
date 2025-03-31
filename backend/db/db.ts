import { PrismaClient } from '@prisma/client';

declare global {
  // Extend the NodeJS global object to include the `prisma` property
  var prisma: PrismaClient | undefined;
}

// Use the existing global `prisma` instance if it exists, otherwise create a new one
const prisma = global.prisma || new PrismaClient();

if (true) {
  // In development, store the Prisma instance in the global object to prevent multiple instances
  global.prisma = prisma;
}

export default prisma;