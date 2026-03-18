import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Supabase PostgreSQL Database URL (Production) with SSL
const SUPABASE_DB_URL = 'postgresql://postgres.bvqtrchbvptorbanmxey:zakirullah%40123456789@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres?pgbouncer=true&sslmode=require&connection_limit=1'

// Use DATABASE_URL from environment, or fallback to Supabase URL
const databaseUrl = process.env.DATABASE_URL || SUPABASE_DB_URL

console.log('Database URL (masked):', databaseUrl.replace(/:[^:@]+@/, ':****@'))

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: databaseUrl
      }
    }
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
