import { NextResponse } from 'next/server';
import { isSameOriginMutation } from '@/lib/security';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { createSession, dashboardForRole } from '@/lib/auth';
import { registerSchema } from '@/features/auth/schemas';

export async function POST(request: Request) {
  if (!isSameOriginMutation(request)) return NextResponse.json({ error: 'Cross-origin request rejected.' }, { status: 403 });
  try {
    const parsed = registerSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid details' }, { status: 400 });
    const { name, email, phone, password, role } = parsed.data;
    if (await prisma.user.findUnique({ where: { email } })) return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 });
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({ data: { name, email, phone, passwordHash, role } });
    await createSession(user.id);
    return NextResponse.json({ redirectTo: dashboardForRole(user.role) }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Unable to create account. Please try again.' }, { status: 500 });
  }
}
