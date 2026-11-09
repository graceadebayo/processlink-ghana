import { describe, expect, it } from 'vitest';
import { JobStatus } from '@prisma/client';
import { canTransition } from '../workflow';
describe('processing job workflow', () => {
  it('allows an operator to accept a new request', () => expect(canTransition(JobStatus.REQUESTED, 'ACCEPT')).toBe(true));
  it('allows an operator to decline a new request', () => expect(canTransition(JobStatus.REQUESTED, 'DECLINE')).toBe(true));
  it('requires acceptance before work starts', () => expect(canTransition(JobStatus.REQUESTED, 'START')).toBe(false));
  it('requires in-progress status before completion', () => expect(canTransition(JobStatus.ACCEPTED, 'COMPLETE')).toBe(false));
  it('only completes an in-progress job', () => expect(canTransition(JobStatus.IN_PROGRESS, 'COMPLETE')).toBe(true));
  it('does not allow a paid job to be cancelled', () => expect(canTransition(JobStatus.PAID, 'CANCEL')).toBe(false));
});
