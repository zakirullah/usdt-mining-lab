import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const BOT_TOKEN = '8705535597:AAFJbrhKJrxbQCrM4dnAMr1tAa8d4ShqcqI';

async function main() {
  // First add the columns if they don't exist
  await prisma.$executeRawUnsafe(`
    ALTER TABLE umlab_admin_settings 
    ADD COLUMN IF NOT EXISTS "telegramBotToken" TEXT,
    ADD COLUMN IF NOT EXISTS "telegramChatId" TEXT,
    ADD COLUMN IF NOT EXISTS "telegramEnabled" BOOLEAN NOT NULL DEFAULT false
  `);
  
  // Get current settings
  const settings = await prisma.adminSettings.findFirst();
  
  if (settings) {
    // Update with raw query
    await prisma.$executeRawUnsafe(`
      UPDATE umlab_admin_settings 
      SET "telegramBotToken" = '${BOT_TOKEN}',
          "telegramEnabled" = true
      WHERE id = '${settings.id}'
    `);
    console.log('✅ Telegram settings updated!');
  } else {
    console.log('No settings found');
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error('Error:', e);
    prisma.$disconnect();
  });
