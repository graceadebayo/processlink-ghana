'use client';
import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
export function OperatorApplicationForm({ projectId }: { projectId: string }) {
 const [experience,setExperience]=useState(''); const [error,setError]=useState(''); const [done,setDone]=useState(false); const [busy,setBusy]=useState(false); const router=useRouter();
 async function submit(e:FormEvent){e.preventDefault();setBusy(true);setError('');const r=await fetch(`/api/projects/${projectId}/applications`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({experience})});const d=await r.json();setBusy(false);if(!r.ok){setError(d.error??'Unable to apply.');return;}setDone(true);router.refresh();}
 if(done)return <p className="rounded-xl bg-[#edf4ed] p-4 text-sm font-semibold text-[#24583e]">Application submitted. An administrator will review it.</p>;
 return <form onSubmit={submit} className="rounded-2xl border border-[#e3e9e2] bg-white p-5"><h3 className="font-extrabold text-[#174b38]">Apply to operate this equipment</h3><label className="field-label mt-4">Relevant experience<textarea className="field min-h-28" minLength={20} maxLength={1500} value={experience} onChange={e=>setExperience(e.target.value)} placeholder="Tell us about your processing experience, equipment skills and availability." required/></label>{error&&<p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}<button disabled={busy} className="btn-primary mt-4">{busy?'Submitting…':'Submit application'}</button></form>;
}
