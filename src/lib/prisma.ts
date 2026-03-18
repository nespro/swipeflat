/**
 * Prisma client singleton.
 *
 * Lazy-initialized to avoid build-time errors when DATABASE_URL is not set.
 * Once a PostgreSQL connection is configured, this will work automatically.
 *
 * Usage in API routes:
 *   import { getPrisma } from "@/lib/prisma";
 *   const prisma = getPrisma();
 */

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

export function getPrisma(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient();
  }
  return globalForPrisma.prisma;
}
