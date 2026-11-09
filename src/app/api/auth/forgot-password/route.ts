import { NextResponse } from 'next/server';
import { isSameOriginMutation } from '@/lib/security';
import { createHash, randomBytes } from 'node:crypto';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
const schema = z.object({ email: z.email().transform(v => v.toLowerCase()) });
export async function POST(request: Request) {
  if (!isSameOriginMutation(request)) return NextResponse.json({ error: 'Cross-origin request rejected.' }, { status: 403 });
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 });
  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  // Keep the response generic to avoid revealing which email addresses have accounts.
  if (!user) return NextResponse.json({ message: 'If an account exists, a password reset email has been prepared.' });
  const token = randomBytes(32).toString('hex');
  const tokenHash = createHash('sha256').update(token).digest('hex');
  await prisma.passwordResetToken.deleteMany({ where: { userId: user.id, usedAt: null } });
  await prisma.passwordResetToken.create({ data: { tokenHash, userId: user.id, expiresAt: new Date(Date.now() + 30 * 60 * 1000) } });
  const url = new URL('/reset-password', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');
  url.searchParams.set('token', token);
  return NextResponse.json({ message: 'Simulated reset email prepared. In this prototype, use the development reset link below.', ...(process.env.NODE_ENV !== 'production' ? { previewUrl: url.toString() } : {}) });
}
