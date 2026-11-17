import { NextResponse } from 'next/server';
import { isSameOriginMutation } from '@/lib/security';
import { ApplicationStatus, Role, UserStatus } from '@prisma/client';
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
  try {
    await prisma.$transaction(async (tx) => {
      const application = await tx.operatorApplication.findUnique({ where: { id }, include: { equipment: true } });
      if (!application || application.status !== ApplicationStatus.PENDING) throw new Error('APPLICATION_NOT_PENDING');
      if (parsed.data.decision === 'APPROVE') {
        // Only assign if the equipment is unassigned or already assigned to this same operator.
        const assigned = await tx.equipment.updateMany({
          where: { id: application.equipmentId, OR: [{ operatorId: null }, { operatorId: application.operatorId }] },
          data: { operatorId: application.operatorId },
        });
        if (assigned.count !== 1) throw new Error('EQUIPMENT_ALREADY_ASSIGNED');
        // Fully funded equipment that now has an approved operator goes live,
        // so customers can request jobs. (Previously nothing ever set ACTIVE.)
        await tx.equipment.updateMany({
          where: { id: application.equipmentId, status: 'FUNDED' },
          data: { status: 'ACTIVE' },
        });
      }
      await tx.operatorApplication.update({ where: { id }, data: { status: parsed.data.decision === 'APPROVE' ? ApplicationStatus.APPROVED : ApplicationStatus.REJECTED } });
      await tx.auditLog.create({ data: { adminId: admin.id, action: `OPERATOR_APPLICATION_${parsed.data.decision}${parsed.data.note ? `: ${parsed.data.note}` : ''}`, targetType: 'OPERATOR_APPLICATION', targetId: id } });
      await tx.notification.create({ data: { userId: application.operatorId, message: `Your application for “${application.equipment.title}” was ${parsed.data.decision.toLowerCase()}${parsed.data.note ? `: ${parsed.data.note}` : '.'}` } });
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'APPLICATION_NOT_PENDING') return NextResponse.json({ error: 'This application is no longer pending.' }, { status: 409 });
    if (error instanceof Error && error.message === 'EQUIPMENT_ALREADY_ASSIGNED') return NextResponse.json({ error: 'This equipment already has an assigned operator.' }, { status: 409 });
    return NextResponse.json({ error: 'Unable to save the application decision.' }, { status: 500 });
  }
  return NextResponse.json({ status: parsed.data.decision });
}
