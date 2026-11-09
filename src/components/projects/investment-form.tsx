'use client';
import { useState } from 'react';

export function InvestmentForm({ projectId, remaining }: { projectId: string; remaining: number }) {
  const [amount, setAmount] = useState('');
  const [phone, setPhone] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [reference, setReference] = useState('');

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage('A simulated Mobile Money prompt is being processed…'); setReference('');
    try {
      const response = await fetch('/api/investments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ equipmentId: projectId, amount, phone }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? 'Investment could not be completed.');
      setReference(result.reference); setMessage(result.message); setAmount('');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Something went wrong.'); }
    finally { setBusy(false); }
  }

  return <form onSubmit={submit} className="rounded-2xl border border-[#e3e9e2] bg-white p-5">
    <h3 className="font-extrabold text-[#173f30]">Invest in this equipment</h3>
    <p className="mt-1 text-xs text-[#718077]">Remaining target: {money(remaining)}</p>
    <label className="mt-4 block text-xs font-bold text-[#52675a]">Investment amount (GHS)</label>
    <input required type="number" min="0.01" max={remaining} step="0.01" value={amount} onChange={e=>setAmount(e.target.value)} className="mt-1 w-full rounded-xl border border-[#d8e1d8] px-3 py-3 text-sm outline-none focus:border-[#246346]" placeholder="e.g. 500.00" />
    <label className="mt-3 block text-xs font-bold text-[#52675a]">Mobile Money number</label>
    <input required type="tel" minLength={9} maxLength={20} value={phone} onChange={e=>setPhone(e.target.value)} className="mt-1 w-full rounded-xl border border-[#d8e1d8] px-3 py-3 text-sm outline-none focus:border-[#246346]" placeholder="0XX XXX XXXX" />
    <p className="mt-3 rounded-xl bg-[#fff5d9] p-3 text-xs leading-5 text-[#765b1b]">Prototype: payments are simulated. Do not enter a PIN or share payment credentials. No real money will move.</p>
    <button disabled={busy || remaining <= 0} className="mt-4 w-full rounded-xl bg-[#174b38] px-4 py-3 text-sm font-bold text-white disabled:opacity-50">{busy?'Processing…':'Continue with simulated payment'}</button>
    {message&&<p role="status" className="mt-3 text-sm text-[#315c43]">{message}</p>}{reference&&<p className="mt-1 text-xs font-bold text-[#174b38]">Reference: {reference}</p>}
  </form>;
}
function money(value:number){return new Intl.NumberFormat('en-GH',{style:'currency',currency:'GHS'}).format(value)}
