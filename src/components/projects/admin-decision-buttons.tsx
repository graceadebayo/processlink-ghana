'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
export function AdminDecisionButtons({ id, endpoint }: { id: string; endpoint: 'projects' | 'applications' }) {
  const [busy,setBusy]=useState(false); const [error,setError]=useState(''); const router=useRouter();
  async function decide(decision:'APPROVE'|'REJECT') { setBusy(true); setError(''); const response=await fetch(`/api/admin/${endpoint}/${id}/decision`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({decision})}); const data=await response.json(); setBusy(false); if(!response.ok){setError(data.error??'Action failed.');return;} router.refresh(); }
  return <div className="flex flex-wrap items-center gap-2"><button disabled={busy} onClick={()=>decide('APPROVE')} className="rounded-lg bg-[#174b38] px-3 py-2 text-xs font-bold text-white disabled:opacity-50">Approve</button><button disabled={busy} onClick={()=>decide('REJECT')} className="rounded-lg border border-[#e4caca] px-3 py-2 text-xs font-bold text-[#9c3f3f] disabled:opacity-50">Reject</button>{error&&<span role="alert" className="w-full text-xs text-red-700">{error}</span>}</div>;
}
