import { PrismaClient } from '@prisma/client'

// Supabase Pooler Database URL (Session Mode)
const SUPABASE_DB_URL = 'postgresql://postgres.bvqtrchbvptorbanmxey:zakirullah%40123456789@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres'

// Override DATABASE_URL if it's pointing to SQLite
if (process.env.DATABASE_URL?.startsWith('file:')) {
  process.env.DATABASE_URL = SUPABASE_DB_URL
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
