import { NextResponse } from 'next/server';
import { isSameOriginMutation } from '@/lib/security';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { Role, UserStatus } from '@prisma/client';
import { getCurrentUser } from '@/lib/auth';

const MAX_BYTES = 2 * 1024 * 1024;
const MAX_REQUEST_BYTES = MAX_BYTES + 64 * 1024;
const allowed = new Map([['image/jpeg','jpg'],['image/png','png'],['image/webp','webp']]);
export const runtime = 'nodejs';
export async function POST(request: Request) {
  if (!isSameOriginMutation(request)) return NextResponse.json({ error: 'Cross-origin request rejected.' }, { status: 403 });
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Please sign in.' }, { status: 401 });
  if (user.status !== UserStatus.VERIFIED) return NextResponse.json({ error: 'Your account must be verified to upload receipts.' }, { status: 403 });
  if (user.role !== Role.OPERATOR) return NextResponse.json({ error: 'Only operators can upload expense receipts.' }, { status: 403 });
  const contentLength = Number(request.headers.get('content-length') || 0);
  if (contentLength > MAX_REQUEST_BYTES) return NextResponse.json({ error: 'Receipt images must be smaller than 2 MB.' }, { status: 413 });
  const form = await request.formData().catch(() => null);
  const file = form?.get('receipt');
  if (!(file instanceof File)) return NextResponse.json({ error: 'Choose an image file.' }, { status: 400 });
  const extension = allowed.get(file.type);
  if (!extension) return NextResponse.json({ error: 'Only JPEG, PNG and WebP images are accepted.' }, { status: 400 });
  if (file.size < 1 || file.size > MAX_BYTES) return NextResponse.json({ error: 'Receipt images must be smaller than 2 MB.' }, { status: 400 });
  const bytes = Buffer.from(await file.arrayBuffer());
  // Check file signatures as well as browser-provided MIME type.
  const valid = extension === 'jpg' ? bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
    : extension === 'png' ? bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))
    : bytes.subarray(0,4).toString() === 'RIFF' && bytes.subarray(8,12).toString() === 'WEBP';
  if (!valid) return NextResponse.json({ error: 'The uploaded file does not match its image type.' }, { status: 400 });
  const filename = `${randomUUID()}.${extension}`;
  const directory = path.join(process.cwd(), '.data', 'receipts');
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, filename), bytes, { flag: 'wx' });
  return NextResponse.json({ url: `/api/expenses/receipt/${filename}` }, { status: 201 });
}
