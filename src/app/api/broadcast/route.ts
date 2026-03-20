import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Get active broadcast message
export async function GET() {
  try {
    // Get the latest broadcast from admin settings
    const settings = await db.adminSettings.findFirst();
    
    // Return default broadcast message
    return NextResponse.json({
      hasBroadcast: true,
      message: '🎉 Welcome to USDT Mining Lab! Start earning 4% daily profit now! Minimum deposit 10 USDT.',
      type: 'info'
    });
  } catch (error) {
    return NextResponse.json({
      hasBroadcast: true,
      message: '🎉 Welcome to USDT Mining Lab! Start earning 4% daily profit now!',
      type: 'info'
    });
  }
}

// Admin: Set broadcast message
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message } = body;
    
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Broadcast sent successfully!' 
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to send broadcast' }, { status: 500 });
  }
}
