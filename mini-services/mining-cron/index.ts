/**
 * Mining Cron Job Service
 * Automatically distributes mining profits to all users every second
 * Port: 3031 (for health checks)
 */

import { PrismaClient } from '@prisma/client';
import { join } from 'path';

// Use absolute path to the database
const DB_PATH = join(import.meta.dir, '../../db/custom.db');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: `file:${DB_PATH}`
    }
  },
  log: ['error']
});

const PORT = 3031;

// Mining profit distribution - runs every second
async function distributeMiningProfits() {
  try {
    // Get all active mining sessions
    const activeMinings = await prisma.userMining.findMany({
      where: { status: 'active' }
    });

    if (activeMinings.length === 0) {
      return { updated: 0, totalProfit: 0 };
    }

    const now = new Date();
    let totalProfitDistributed = 0;
    let sessionsUpdated = 0;

    for (const mining of activeMinings) {
      try {
        // Check if mining expired
        if (now >= new Date(mining.expiresAt)) {
          // Complete the mining session
          await prisma.$transaction([
            // Update mining status
            prisma.userMining.update({
              where: { id: mining.id },
              data: { status: 'completed' }
            }),
            // Return investment + total earned to user balance
            prisma.user.update({
              where: { id: mining.userId },
              data: {
                balance: { increment: mining.investment + mining.totalEarned },
                totalProfit: { increment: mining.totalEarned },
                miningBalance: { decrement: mining.investment }
              }
            }),
            // Create transaction record
            prisma.transaction.create({
              data: {
                userId: mining.userId,
                type: 'mining_completed',
                amount: mining.totalEarned,
                status: 'completed',
                description: `${mining.planName} completed - Investment returned with profit`
              }
            }),
            // Create notification
            prisma.notification.create({
              data: {
                userId: mining.userId,
                type: 'profit',
                message: `${mining.planName} completed! Earned ${mining.totalEarned.toFixed(4)} USDT`,
                amount: mining.totalEarned
              }
            })
          ]);

          console.log(`[CRON] Mining ${mining.id} completed for user ${mining.userId}`);
          continue;
        }

        // Calculate elapsed time since last update
        const lastUpdate = new Date(mining.lastUpdateAt);
        const elapsedSeconds = Math.floor((now.getTime() - lastUpdate.getTime()) / 1000);

        // Only update if at least 1 second has passed
        if (elapsedSeconds < 1) continue;

        // Calculate profit per second
        const profitPerSecond = (mining.investment * mining.dailyPercent / 100) / 86400;
        const earnedThisUpdate = profitPerSecond * elapsedSeconds;

        // Update mining record AND add profit to user balance
        await prisma.$transaction([
          prisma.userMining.update({
            where: { id: mining.id },
            data: {
              totalEarned: { increment: earnedThisUpdate },
              lastUpdateAt: now
            }
          }),
          // ADD PROFIT TO USER BALANCE IN REAL-TIME
          prisma.user.update({
            where: { id: mining.userId },
            data: {
              balance: { increment: earnedThisUpdate },
              totalProfit: { increment: earnedThisUpdate }
            }
          })
        ]);

        totalProfitDistributed += earnedThisUpdate;
        sessionsUpdated++;

      } catch (error) {
        console.error(`[CRON] Error updating mining ${mining.id}:`, error);
      }
    }

    return { updated: sessionsUpdated, totalProfit: totalProfitDistributed };

  } catch (error) {
    console.error('[CRON] Error in distributeMiningProfits:', error);
    throw error;
  }
}

// Health check server
async function startHealthServer() {
  const server = Bun.serve({
    port: PORT,
    async fetch(req) {
      const url = new URL(req.url);
      
      if (url.pathname === '/health') {
        return Response.json({ 
          status: 'ok', 
          service: 'mining-cron',
          timestamp: new Date().toISOString()
        });
      }
      
      if (url.pathname === '/run') {
        // Manual trigger endpoint
        try {
          const result = await distributeMiningProfits();
          return Response.json({ 
            success: true, 
            ...result,
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          return Response.json({ 
            success: false, 
            error: String(error) 
          }, { status: 500 });
        }
      }
      
      return Response.json({ error: 'Not found' }, { status: 404 });
    }
  });
  
  console.log(`[CRON] Health server running on port ${PORT}`);
  return server;
}

// Main cron loop
async function startCron() {
  console.log('[CRON] Mining profit distribution service started');
  console.log('[CRON] Running every 1 second...');

  // Run immediately
  await distributeMiningProfits();

  // Schedule every second
  setInterval(async () => {
    try {
      const result = await distributeMiningProfits();
      if (result.updated > 0) {
        console.log(`[CRON] Updated ${result.updated} sessions, distributed ${result.totalProfit.toFixed(6)} USDT`);
      }
    } catch (error) {
      console.error('[CRON] Cron job error:', error);
    }
  }, 1000);
}

// Start everything
async function main() {
  try {
    await startHealthServer();
    await startCron();
    console.log('[CRON] Service initialized successfully');
  } catch (error) {
    console.error('[CRON] Failed to start:', error);
    process.exit(1);
  }
}

main();
