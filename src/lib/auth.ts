import { db } from '@/lib/db';
import { NextRequest } from 'next/server';

export async function getUserFromSession(token: string) {
  if (!token) return null;

  const session = await db.session.findUnique({
    where: { token }
  });

  if (!session || session.expiresAt < new Date()) return null;

  const user = await db.user.findUnique({
    where: { id: session.userId }
  });

  return user;
}

export async function getAuthUser(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  return getUserFromSession(token || '');
}
