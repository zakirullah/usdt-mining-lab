import { NextResponse } from 'next/server';

export async function GET() {
  const dbUrl = process.env.DATABASE_URL;
  const directUrl = process.env.DIRECT_DATABASE_URL;
  
  return NextResponse.json({
    hasDbUrl: !!dbUrl,
    hasDirectUrl: !!directUrl,
    dbUrlPrefix: dbUrl ? dbUrl.substring(0, 30) + '...' : null,
    directUrlPrefix: directUrl ? directUrl.substring(0, 30) + '...' : null,
    nodeEnv: process.env.NODE_ENV,
  });
}
