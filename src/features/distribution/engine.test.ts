import { describe, expect, it } from 'vitest';
import { calculateDistribution } from './engine';

describe('calculateDistribution', () => {
  it('splits GHS 1,000 into 10/40/50 and allocates investor pool pro rata', () => {
    const result = calculateDistribution({ grossRevenuePesewas:100000, expensesPesewas:0, platformFeePct:10, operatorSharePct:40, investorSharePct:50, investors:[{investorId:'a',contributionPesewas:60000},{investorId:'b',contributionPesewas:40000}] });
    expect(result.platformAmountPesewas).toBe(10000);
    expect(result.operatorAmountPesewas).toBe(40000);
    expect(result.investorPoolPesewas).toBe(50000);
    expect(result.payouts).toEqual([{investorId:'a',amountPesewas:30000},{investorId:'b',amountPesewas:20000}]);
    expect(result.platformAmountPesewas+result.operatorAmountPesewas+result.investorPoolPesewas).toBe(100000);
  });
  it('handles pesewa rounding and reconciles exactly', () => {
    const r=calculateDistribution({grossRevenuePesewas:101,expensesPesewas:0,platformFeePct:10,operatorSharePct:40,investorSharePct:50,investors:[{investorId:'a',contributionPesewas:1},{investorId:'b',contributionPesewas:1},{investorId:'c',contributionPesewas:1}]});
    expect(r.platformAmountPesewas+r.operatorAmountPesewas+r.investorPoolPesewas).toBe(101);
    expect(r.payouts.reduce((s,p)=>s+p.amountPesewas,0)).toBe(r.investorPoolPesewas);
  });
  it('creates no payouts when net revenue is zero or negative', () => {
    for (const expensesPesewas of [10000,12000]) {
      const r=calculateDistribution({grossRevenuePesewas:10000,expensesPesewas,platformFeePct:10,operatorSharePct:40,investorSharePct:50,investors:[{investorId:'a',contributionPesewas:1000}]});
      expect(r.payouts).toEqual([]); expect(r.investorPoolPesewas).toBe(0);
    }
  });
  it('rejects percentages that do not total 100', () => {
    expect(()=>calculateDistribution({grossRevenuePesewas:100,expensesPesewas:0,platformFeePct:10,operatorSharePct:40,investorSharePct:40,investors:[]})).toThrow(/total exactly 100/);
  });
});
