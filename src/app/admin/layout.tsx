import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Sidebar from './sidebar';
import './admin.css';
import './sidebar-collapse.css';
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!(await cookies()).get('admin_session')?.value) redirect('/login');
  async function logout() { 'use server'; (await cookies()).delete('admin_session'); redirect('/login'); }
  return <div className="workspace"><Sidebar/><div className="workspace-body"><header className="workspace-header"><span>Administration / Control center</span><form action={logout}><button className="secondary">Sign out</button></form></header><main className="workspace-main">{children}</main></div></div>;
}
