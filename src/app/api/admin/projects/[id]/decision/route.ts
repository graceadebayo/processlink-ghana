import { NextResponse } from 'next/server';
import { isSameOriginMutation } from '@/lib/security';
import { ProjectStatus, Role, UserStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { adminDecisionSchema } from '@/features/projects/schemas';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isSameOriginMutation(request)) return NextResponse.json({ error: 'Cross-origin request rejected.' }, { status: 403 });
  const admin = await getCurrentUser();
  if (!admin || admin.role !== Role.ADMIN || admin.status !== UserStatus.VERIFIED) return NextResponse.json({ error: 'Administrator access required.' }, { status: 403 });
  const { id } = await params;
  const parsed = adminDecisionSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: 'Choose approve or reject.' }, { status: 400 });
  const nextStatus = parsed.data.decision === 'APPROVE' ? ProjectStatus.FUNDING : ProjectStatus.REJECTED;
  try {
    await prisma.$transaction(async (tx) => {
      // Conditional update prevents two administrators from deciding the same pending item concurrently.
      const changed = await tx.equipment.updateMany({ where: { id, status: ProjectStatus.PENDING_APPROVAL }, data: { status: nextStatus } });
      if (changed.count !== 1) throw new Error('PROJECT_NOT_PENDING');
      const project = await tx.equipment.findUniqueOrThrow({ where: { id }, select: { title: true, submittedById: true } });
      await tx.auditLog.create({ data: { adminId: admin.id, action: `PROJECT_${parsed.data.decision}${parsed.data.note ? `: ${parsed.data.note}` : ''}`, targetType: 'EQUIPMENT', targetId: id } });
      if (project.submittedById) await tx.notification.create({ data: { userId: project.submittedById, message: `Your project “${project.title}” was ${parsed.data.decision.toLowerCase()}${parsed.data.note ? `: ${parsed.data.note}` : '.'}` } });
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'PROJECT_NOT_PENDING') return NextResponse.json({ error: 'This project is no longer awaiting approval.' }, { status: 409 });
    return NextResponse.json({ error: 'Unable to save the project decision.' }, { status: 500 });
  }
  return NextResponse.json({ status: nextStatus });
}
