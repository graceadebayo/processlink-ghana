import { JobStatus } from '@prisma/client';
export type JobAction = 'ACCEPT' | 'DECLINE' | 'START' | 'COMPLETE' | 'CANCEL';
export const jobTransitions: Record<JobAction, { from: JobStatus[]; to: JobStatus; customerMessage: string }> = {
  ACCEPT: { from: [JobStatus.REQUESTED], to: JobStatus.ACCEPTED, customerMessage: 'Your processing request was accepted.' },
  DECLINE: { from: [JobStatus.REQUESTED], to: JobStatus.DECLINED, customerMessage: 'Your processing request was declined.' },
  START: { from: [JobStatus.ACCEPTED], to: JobStatus.IN_PROGRESS, customerMessage: 'Your processing job is now in progress.' },
  COMPLETE: { from: [JobStatus.IN_PROGRESS], to: JobStatus.COMPLETED, customerMessage: 'Your processing job is complete. You can now make the simulated payment.' },
  CANCEL: { from: [JobStatus.REQUESTED, JobStatus.ACCEPTED], to: JobStatus.CANCELLED, customerMessage: 'Your processing job was cancelled.' },
};
export function canTransition(current: JobStatus, action: JobAction) {
  return jobTransitions[action].from.includes(current);
}
