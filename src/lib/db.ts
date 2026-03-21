import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Database URL from environment variable
// Set DATABASE_URL in Railway: postgresql://postgres.bvqtrchbvptorbanmxey:PASSWORD@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres?pgbouncer=true&sslmode=require
const databaseUrl = process.env.DATABASE_URL || 'postgresql://placeholder@localhost:5432/postgres'

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: databaseUrl
      }
    }
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
