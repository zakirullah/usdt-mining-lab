import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const startTime = Date.now();
  const logs: string[] = [];
  
  try {
    logs.push(`Starting health check at ${new Date().toISOString()}`);
    logs.push(`NODE_ENV: ${process.env.NODE_ENV}`);
    
    // Test raw connection
    logs.push('Testing database connection...');
    const testResult = await db.$queryRaw`SELECT current_database(), current_user, version()`;
    logs.push(`Database connected: ${JSON.stringify(testResult)}`);
    
    // Count tables
    logs.push('Counting users...');
    const userCount = await db.user.count();
    logs.push(`User count: ${userCount}`);
    
    logs.push('Counting deposits...');
    const depositCount = await db.deposit.count();
    logs.push(`Deposit count: ${depositCount}`);
    
    logs.push('Counting withdrawals...');
    const withdrawalCount = await db.withdrawal.count();
    logs.push(`Withdrawal count: ${withdrawalCount}`);
    
    logs.push('Counting mining sessions...');
    const miningCount = await db.userMining.count();
    logs.push(`Mining session count: ${miningCount}`);
    
    const elapsedMs = Date.now() - startTime;
    logs.push(`Health check completed in ${elapsedMs}ms`);
    
    return NextResponse.json({
      status: 'healthy',
      database: 'connected',
      counts: {
        users: userCount,
        deposits: depositCount,
        withdrawals: withdrawalCount,
        miningSessions: miningCount
      },
      responseTimeMs: elapsedMs,
      timestamp: new Date().toISOString(),
      logs
    });
  } catch (error) {
    const elapsedMs = Date.now() - startTime;
    logs.push(`ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`);
    logs.push(`Stack: ${error instanceof Error ? error.stack : 'N/A'}`);
    
    return NextResponse.json({
      status: 'unhealthy',
      database: 'disconnected',
      error: {
        message: error instanceof Error ? error.message : 'Unknown error',
        name: error instanceof Error ? error.name : 'Unknown',
        stack: error instanceof Error ? error.stack?.split('\n').slice(0, 10) : undefined
      },
      responseTimeMs: elapsedMs,
      timestamp: new Date().toISOString(),
      logs
    }, { status: 500 });
  }
}
