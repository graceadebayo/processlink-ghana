export type DistributionInput = {
  grossRevenuePesewas: number;
  expensesPesewas: number;
  platformFeePct: number;
  operatorSharePct: number;
  investorSharePct: number;
  investors: Array<{ investorId: string; contributionPesewas: number }>;
};
export type DistributionResult = {
  grossRevenuePesewas: number; expensesPesewas: number; netRevenuePesewas: number;
  platformAmountPesewas: number; operatorAmountPesewas: number; investorPoolPesewas: number;
  payouts: Array<{ investorId: string; amountPesewas: number }>;
};

/** Allocate integer pesewas by largest remainder so allocations always reconcile exactly. */
function allocate(total: number, weights: Array<{ key: string; weight: number }>) {
  if (!Number.isSafeInteger(total) || total < 0) throw new Error('Total must be a non-negative integer number of pesewas.');
  const denominator = weights.reduce((sum, item) => sum + item.weight, 0);
  if (denominator <= 0) return weights.map(item => ({ key: item.key, amount: 0 }));
  const rows = weights.map(item => {
    const exact = total * item.weight / denominator;
    const floor = Math.floor(exact);
    return { key: item.key, amount: floor, remainder: exact - floor };
  });
  let remaining = total - rows.reduce((sum, row) => sum + row.amount, 0);
  const ranked = [...rows].sort((a, b) => b.remainder - a.remainder || a.key.localeCompare(b.key));
  for (let i = 0; i < remaining; i++) ranked[i % ranked.length].amount += 1;
  return rows.map(({ key, amount }) => ({ key, amount }));
}

export function calculateDistribution(input: DistributionInput): DistributionResult {
  const { grossRevenuePesewas: gross, expensesPesewas: expenses } = input;
  for (const value of [gross, expenses]) if (!Number.isSafeInteger(value) || value < 0) throw new Error('Revenue and expenses must be non-negative integer pesewas.');
  const pct = [input.platformFeePct, input.operatorSharePct, input.investorSharePct];
  if (pct.some(value => !Number.isFinite(value) || value < 0) || Math.abs(pct.reduce((a,b)=>a+b,0)-100) > 0.000001) throw new Error('Platform, operator and investor percentages must total exactly 100%.');
  const net = gross - expenses;
  if (net <= 0) return { grossRevenuePesewas:gross, expensesPesewas:expenses, netRevenuePesewas:net, platformAmountPesewas:0, operatorAmountPesewas:0, investorPoolPesewas:0, payouts:[] };
  const parts = allocate(net, [
    { key:'platform', weight:Math.round(input.platformFeePct*10000) },
    { key:'operator', weight:Math.round(input.operatorSharePct*10000) },
    { key:'investors', weight:Math.round(input.investorSharePct*10000) },
  ]);
  const amount = (key:string) => parts.find(p=>p.key===key)?.amount ?? 0;
  const investorPool = amount('investors');
  const eligible = input.investors.filter(i => i.contributionPesewas > 0).sort((a,b)=>a.investorId.localeCompare(b.investorId));
  const investorAllocations = allocate(investorPool, eligible.map(i=>({key:i.investorId,weight:i.contributionPesewas})));
  return { grossRevenuePesewas:gross, expensesPesewas:expenses, netRevenuePesewas:net, platformAmountPesewas:amount('platform'), operatorAmountPesewas:amount('operator'), investorPoolPesewas:investorPool, payouts:investorAllocations.map(p=>({investorId:p.key,amountPesewas:p.amount})).filter(p=>p.amountPesewas>0) };
}
export const toPesewas = (value: { toString(): string } | number | string) => Math.round(Number(value.toString()) * 100);
export const fromPesewas = (value: number) => (value / 100).toFixed(2);
