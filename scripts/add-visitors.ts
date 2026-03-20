import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function main() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Add 5 new visitors for today
  for (let i = 0; i < 5; i++) {
    await prisma.visitor.create({
      data: {
        visitorId: uuidv4(),
        ipAddress: `192.168.1.${i + 1}`,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
        page: '/',
        referrer: null,
        lastVisit: new Date(),
        visitCount: 1
      }
    });
  }
  
  // Update daily stat
  const existingStat = await prisma.dailyStat.findUnique({
    where: { date: today }
  });
  
  if (existingStat) {
    await prisma.dailyStat.update({
      where: { date: today },
      data: { visitors: { increment: 5 } }
    });
  } else {
    await prisma.dailyStat.create({
      data: {
        date: today,
        visitors: 5,
        pageViews: 5
      }
    });
  }
  
  // Verify
  const stat = await prisma.dailyStat.findUnique({
    where: { date: today }
  });
  
  console.log('✅ Added 5 visitors for today');
  console.log('Today stats:', stat);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error('Error:', e);
    prisma.$disconnect();
  });
