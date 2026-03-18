import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const sessionId = request.headers.get('x-session-id');
    
    if (sessionId) {
      // Delete session
      await supabaseAdmin
        .from('sessions')
        .delete()
        .eq('id', sessionId);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ success: true });
  }
}
