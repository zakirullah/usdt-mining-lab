import { PrismaClient } from '@prisma/client';

const BOT_TOKEN = '8705535597:AAFJbrhKJrxbQCrM4dnAMr1tAa8d4ShqcqI';
const CHAT_ID = '-1003551540968';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres.bvqtrchbvptorbanmxey:zakirullah%40123456789@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require'
    }
  }
});

async function main() {
  console.log('Adding Telegram columns...');
  
  try {
    // Add columns
    await prisma.$executeRawUnsafe(`
      ALTER TABLE umlab_admin_settings 
      ADD COLUMN IF NOT EXISTS "telegramBotToken" TEXT,
      ADD COLUMN IF NOT EXISTS "telegramChatId" TEXT,
      ADD COLUMN IF NOT EXISTS "telegramEnabled" BOOLEAN NOT NULL DEFAULT false
    `);
    console.log('✅ Columns added!');
    
    // Update settings
    await prisma.$executeRawUnsafe(`
      UPDATE umlab_admin_settings 
      SET "telegramBotToken" = '${BOT_TOKEN}',
          "telegramChatId" = '${CHAT_ID}',
          "telegramEnabled" = true
    `);
    console.log('✅ Settings updated!');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
