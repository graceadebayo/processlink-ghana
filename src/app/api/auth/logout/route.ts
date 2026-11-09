import { NextResponse } from 'next/server';
import { isSameOriginMutation } from '@/lib/security';
import { destroySession } from '@/lib/auth';
export async function POST(request: Request) {
  if (!isSameOriginMutation(request)) return NextResponse.json({ error: 'Cross-origin request rejected.' }, { status: 403 });
  await destroySession();
  return NextResponse.json({ redirectTo: '/login' });
}
