import { redirect } from 'next/navigation';
import { getCurrentUser, dashboardForRole } from '@/lib/auth';
export default async function DashboardIndex() { const user = await getCurrentUser(); if (!user) redirect('/login'); redirect(dashboardForRole(user.role)); }
