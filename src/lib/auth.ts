import { cookies } from 'next/headers';
import { createHash, randomBytes } from 'node:crypto';
import { redirect } from 'next/navigation';
import { Role, UserStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';

const COOKIE_NAME = 'processlink_session';
const SESSION_DAYS = 7;
const hash = (value: string) => createHash('sha256').update(value).digest('hex');

export async function createSession(userId: string) {
  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await prisma.session.create({ data: { tokenHash: hash(token), userId, expiresAt } });
  const jar = await cookies();
  jar.set(COOKIE_NAME, token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', expires: expiresAt });
}

export async function getCurrentUser() {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const session = await prisma.session.findUnique({ where: { tokenHash: hash(token) }, include: { user: true } });
  if (!session || session.expiresAt <= new Date() || session.user.status === UserStatus.SUSPENDED) return null;
  return session.user;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  return user;
}

export async function requireRole(...roles: Role[]) {
  const user = await requireUser();
  if (!roles.includes(user.role)) redirect('/dashboard');
  return user;
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (token) await prisma.session.deleteMany({ where: { tokenHash: hash(token) } });
  jar.delete(COOKIE_NAME);
}

export function dashboardForRole(role: Role) {
  return `/dashboard/${role.toLowerCase()}`;
}
