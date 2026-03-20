import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// One-time setup endpoint to create admin user
// DELETE THIS FILE AFTER SETTING UP ADMIN

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, secret } = body;
    
    // Simple secret to prevent unauthorized access
    if (secret !== 'setup-admin-2025-secure') {
      return NextResponse.json({ error: 'Invalid secret' }, { status: 403 });
    }
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    
    // Find user by email
    const existingUser = await db.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      // Update to admin
      const updated = await db.user.update({
        where: { email },
        data: { role: 'admin' }
      });
      return NextResponse.json({ 
        success: true, 
        message: 'User updated to admin', 
        user: { 
          id: updated.id,
          email: updated.email, 
          walletAddress: updated.walletAddress,
          role: updated.role 
        } 
      });
    }
    
    // Generate unique wallet address
    const timestamp = Date.now();
    const randomHex = Math.random().toString(16).substring(2, 10);
    const walletAddress = `0x${randomHex.padEnd(40, '0').slice(0, 40)}`;
    
    // Generate unique referral code
    const referralCode = `ADM${timestamp.toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    
    // Create admin user
    const newUser = await db.user.create({
      data: {
        email: email,
        password: 'temp_' + timestamp,
        walletAddress: walletAddress,
        securityPin: '123456',
        referralCode: referralCode,
        role: 'admin'
      }
    });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Admin user created. Please update your wallet address and PIN through the app.', 
      user: { 
        id: newUser.id,
        email: newUser.email, 
        walletAddress: newUser.walletAddress,
        role: newUser.role,
        referralCode: newUser.referralCode
      },
      note: 'Your temporary PIN is 123456. Please change it after first login.'
    });
  } catch (error: any) {
    console.error('Admin setup error:', error);
    
    // Check for unique constraint violation
    if (error.code === 'P2002') {
      return NextResponse.json({ 
        error: 'Unique constraint violation. Please try again.', 
        field: error.meta?.target 
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      error: 'Failed to setup admin', 
      details: error.message 
    }, { status: 500 });
  }
}
