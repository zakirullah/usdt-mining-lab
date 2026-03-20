import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Check visitors
  const visitors = await prisma.visitor.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' }
  });
  
  console.log('Total visitors:', await prisma.visitor.count());
  console.log('Visitors:', visitors);
  
  // Check today's visitors
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayVisitors = await prisma.visitor.count({
    where: { createdAt: { gte: today } }
  });
  
  console.log('Today visitors:', todayVisitors);
  
  // Check daily stats
  const dailyStats = await prisma.dailyStat.findMany({
    take: 10,
    orderBy: { date: 'desc' }
  });
  
  console.log('Daily stats:', dailyStats);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error('Error:', e);
    prisma.$disconnect();
  });
