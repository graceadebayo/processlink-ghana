'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function DistributionConsole({ projects }: { projects: Array<{id:string;title:string}> }) {
  const router = useRouter();
  const [equipmentId,setEquipmentId]=useState(projects[0]?.id ?? '');
  const [periodStart,setPeriodStart]=useState('2026-01-01');
  const [periodEnd,setPeriodEnd]=useState('2026-02-01');
  const [busy,setBusy]=useState(false); const [message,setMessage]=useState('');
  async function submit(e:React.FormEvent){e.preventDefault();setBusy(true);setMessage('');try{const response=await fetch('/api/admin/distributions',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({equipmentId,periodStart,periodEnd})});const data=await response.json();if(!response.ok)throw new Error(data.error??'Distribution failed.');setMessage(`Distribution created. Net revenue: GHS ${Number(data.distribution.netRevenue).toFixed(2)}.`);router.refresh();}catch(err){setMessage(err instanceof Error?err.message:'Something went wrong.');}finally{setBusy(false);}}
  return <form onSubmit={submit} className="rounded-2xl border border-[#e3e9e2] bg-white p-5"><h2 className="font-extrabold text-[#173f30]">Run a distribution</h2><p className="mt-1 text-sm text-[#718077]">Creates a permanent financial record for one project and date range. Duplicate periods are blocked.</p><div className="mt-4 grid gap-3 md:grid-cols-3"><label className="text-sm font-semibold text-[#456454]">Equipment project<select required value={equipmentId} onChange={e=>setEquipmentId(e.target.value)} className="mt-1 w-full rounded-xl border border-[#dce5dc] p-3">{projects.map(p=><option key={p.id} value={p.id}>{p.title}</option>)}</select></label><label className="text-sm font-semibold text-[#456454]">Period start<input required type="date" value={periodStart} onChange={e=>setPeriodStart(e.target.value)} className="mt-1 w-full rounded-xl border border-[#dce5dc] p-3"/></label><label className="text-sm font-semibold text-[#456454]">Period end (exclusive)<input required type="date" value={periodEnd} onChange={e=>setPeriodEnd(e.target.value)} className="mt-1 w-full rounded-xl border border-[#dce5dc] p-3"/></label></div><button disabled={busy||!projects.length} className="mt-4 rounded-xl bg-[#174b38] px-5 py-3 text-sm font-bold text-white disabled:opacity-50">{busy?'Calculating…':'Calculate and save distribution'}</button>{message&&<p role="status" className="mt-3 text-sm font-semibold text-[#315c43]">{message}</p>}</form>
}
