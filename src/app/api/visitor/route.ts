import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { visitorId, page, referrer } = body;
    
    // Get IP address from headers
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    // Generate or use existing visitor ID
    const vid = visitorId || uuidv4();
    
    // Check if visitor exists
    const existingVisitor = await db.visitor.findUnique({
      where: { visitorId: vid }
    });
    
    if (existingVisitor) {
      // Update existing visitor
      await db.visitor.update({
        where: { visitorId: vid },
        data: {
          lastVisit: new Date(),
          visitCount: { increment: 1 },
          page: page || '/',
          referrer: referrer || null
        }
      });
    } else {
      // Create new visitor
      await db.visitor.create({
        data: {
          visitorId: vid,
          ipAddress: ip,
          userAgent: userAgent,
          page: page || '/',
          referrer: referrer || null,
          lastVisit: new Date(),
          visitCount: 1
        }
      });
    }
    
    // Update or create daily stat
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const existingStat = await db.dailyStat.findUnique({
      where: { date: today }
    });
    
    if (existingStat) {
      await db.dailyStat.update({
        where: { date: today },
        data: {
          visitors: { increment: 1 },
          pageViews: { increment: 1 }
        }
      });
    } else {
      await db.dailyStat.create({
        data: {
          date: today,
          visitors: 1,
          pageViews: 1
        }
      });
    }
    
    return NextResponse.json({
      success: true,
      visitorId: vid
    });
  } catch (error) {
    console.error('Visitor tracking error:', error);
    return NextResponse.json({
      success: false,
      visitorId: null
    });
  }
}
