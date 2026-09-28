import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { requireAdminSession } from '@/lib/admin-session';
import Sidebar from './components/sidebar';
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdminSession();
  async function logout() { 'use server'; (await cookies()).delete('admin_session'); redirect('/login'); }
  return <div className="flex min-h-svh max-[800px]:block"><Sidebar/><div className="min-w-0 flex-1"><header className="flex h-[72px] items-center justify-between gap-4 border-b border-border bg-background px-10 pr-[185px] text-xs text-muted-foreground max-[800px]:h-[70px] max-[800px]:px-6"><span>Administration / Control center</span><form action={logout}><button className="min-h-10 rounded-md border border-border bg-background px-4 text-foreground transition-colors hover:bg-muted">Sign out</button></form></header><main className="mx-auto max-w-[1400px] px-10 py-12 max-[800px]:px-6 max-[800px]:py-8 max-[800px]:pb-24">{children}</main></div></div>;
}
