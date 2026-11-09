import { randomInt } from 'node:crypto';

export type PaymentRequest = { amount: number; phone: string; description: string };
export type PaymentResult = { successful: boolean; reference: string; message: string };

/** Provider boundary: replace this adapter with a licensed gateway without changing investment logic. */
export interface PaymentProvider {
  collect(request: PaymentRequest): Promise<PaymentResult>;
}

export class SimulatedProvider implements PaymentProvider {
  async collect(request: PaymentRequest): Promise<PaymentResult> {
    // This is deliberately a simulation; no network request or real money movement occurs.
    if (!Number.isFinite(request.amount) || request.amount <= 0 || !request.phone.trim()) {
      return { successful: false, reference: '', message: 'A valid amount and Mobile Money number are required.' };
    }
    return {
      successful: true,
      reference: `SIM-${randomInt(100000, 999999)}`,
      message: `Simulated Mobile Money prompt approved for ${request.phone}. No real payment was made.`,
    };
  }
}

export const paymentProvider: PaymentProvider = new SimulatedProvider();
