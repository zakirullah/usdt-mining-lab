import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    version: '2.8.0',
    buildTime: new Date().toISOString(),
    features: [
      'real-statistics-from-database',
      'visitor-tracking',
      'online-users-tracking',
      'launch-date-20-march-2026'
    ]
  });
}
