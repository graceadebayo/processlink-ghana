import { describe, expect, it } from 'vitest';
import { SimulatedProvider } from '../payment-provider';

describe('SimulatedProvider', () => {
  it('returns a simulated reference without requesting payment credentials', async () => {
    const result = await new SimulatedProvider().collect({ amount: 125.5, phone: '0240000000', description: 'Cassava grater' });
    expect(result.successful).toBe(true);
    expect(result.reference).toMatch(/^SIM-\d{6}$/);
    expect(result.message).toContain('No real payment was made');
  });
  it('rejects invalid amount or missing phone', async () => {
    const provider = new SimulatedProvider();
    expect((await provider.collect({ amount: 0, phone: '0240000000', description: 'test' })).successful).toBe(false);
    expect((await provider.collect({ amount: 10, phone: ' ', description: 'test' })).successful).toBe(false);
  });
});
