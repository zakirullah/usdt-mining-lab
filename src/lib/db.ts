import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Supabase PostgreSQL Database URL
const SUPABASE_DB_URL = 'postgresql://postgres.bvqtrchbvptorbanmxey:zakirullah%40123456789@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres?pgbouncer=true&sslmode=require'

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: SUPABASE_DB_URL
      }
    }
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
