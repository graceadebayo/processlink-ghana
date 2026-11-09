'use client';
import { useRouter } from 'next/navigation';
export function LogoutButton({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  async function logout() { await fetch('/api/auth/logout', { method: 'POST' }); router.push('/'); router.refresh(); }
  return <button onClick={logout} className={compact ? 'rounded-xl px-3 py-2 text-xs font-semibold text-[#456454]' : 'rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10'}>Log out</button>;
}
