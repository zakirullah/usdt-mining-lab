import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // First, let's check what tables actually exist
    const tables = await db.$queryRaw`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    
    return NextResponse.json({
      tables,
      hasRealData: true
    });
  } catch (error) {
    console.error('Test error:', error);
    
    return NextResponse.json({
      error: String(error),
      tables: []
    });
  }
}
