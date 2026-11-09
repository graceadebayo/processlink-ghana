import { NextResponse } from 'next/server';
import { isSameOriginMutation } from '@/lib/security';
import bcrypt from 'bcryptjs';
import { UserStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { createSession, dashboardForRole } from '@/lib/auth';
import { loginSchema } from '@/features/auth/schemas';

export async function POST(request: Request) {
  if (!isSameOriginMutation(request)) return NextResponse.json({ error: 'Cross-origin request rejected.' }, { status: 403 });
  try {
    const parsed = loginSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: 'Enter a valid email and password.' }, { status: 400 });
    const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
    if (!user || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) return NextResponse.json({ error: 'Email or password is incorrect.' }, { status: 401 });
    if (user.status === UserStatus.SUSPENDED) return NextResponse.json({ error: 'This account has been suspended. Contact support.' }, { status: 403 });
    await createSession(user.id);
    return NextResponse.json({ redirectTo: dashboardForRole(user.role) });
  } catch {
    return NextResponse.json({ error: 'Unable to sign in. Please try again.' }, { status: 500 });
  }
}
