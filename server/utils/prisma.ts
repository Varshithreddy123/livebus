import { PrismaClient } from "@prisma/client";

// Extend the global object to include prismadb
const globalForPrisma = global as typeof globalThis & {
  prismadb?: PrismaClient;
};

// Use the existing client if available, otherwise create a new one
const prisma =
  globalForPrisma.prismadb ||
  new PrismaClient({
    log: ["query"],
  });

// In development, reuse the same Prisma client instance
if (process.env.NODE_ENV !== "production") globalForPrisma.prismadb = prisma;

export default prisma;
