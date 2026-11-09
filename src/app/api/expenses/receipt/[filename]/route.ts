import { NextResponse } from 'next/server';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { Role } from '@prisma/client';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const types: Record<string,string> = { jpg:'image/jpeg', png:'image/png', webp:'image/webp' };
export const runtime = 'nodejs';
export async function GET(_request: Request, context: { params: Promise<{ filename: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Please sign in.' }, { status: 401 });
  const { filename } = await context.params;
  if (!/^[0-9a-f-]{36}\.(jpg|png|webp)$/.test(filename)) return NextResponse.json({ error: 'Receipt not found.' }, { status: 404 });
  const receiptUrl = `/api/expenses/receipt/${filename}`;
  const expense = await prisma.expense.findFirst({ where: { receiptImageUrl: receiptUrl, ...(user.role === Role.ADMIN ? {} : { recordedBy: user.id }) }, select: { id: true } });
  if (!expense) return NextResponse.json({ error: 'Receipt not found.' }, { status: 404 });
  try {
    const bytes = await readFile(path.join(process.cwd(), '.data', 'receipts', filename));
    return new NextResponse(bytes, { headers: { 'Content-Type': types[filename.split('.').pop()!] || 'application/octet-stream', 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' } });
  } catch {
    return NextResponse.json({ error: 'Receipt file is unavailable.' }, { status: 404 });
  }
}
