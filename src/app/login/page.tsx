'use client';

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { useAdminLogin } from '@/hooks/use-auth';

export default function Login() {
  const router = useRouter();
  const loginMutation = useAdminLogin();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setPending(true); setError('');
    const data = new FormData(event.currentTarget);
    try {
      await loginMutation.mutateAsync({ email: String(data.get('email') || ''), password: String(data.get('password') || '') });
      toast.success('Signed in successfully.');
      router.replace('/admin'); router.refresh();
    } catch (error) { const message = error instanceof Error ? error.message : 'Unable to connect. Please try again.'; setError(message); toast.error(message); }
    finally { setPending(false); }
  }
  const isPending = pending || loginMutation.isPending;
  return <main className="grid min-h-svh grid-cols-2 max-[800px]:grid-cols-1">
    <section className="flex min-h-[800px] flex-col justify-between overflow-hidden bg-muted px-14 py-12 max-[800px]:min-h-[220px] max-[800px]:p-7" aria-label="ALUTHRA">
      <Link className="flex items-center gap-3 text-[26px] font-bold tracking-[2px] text-foreground max-[800px]:text-[22px]" href="/"><span className="grid size-8 shrink-0 place-items-center rounded-full border border-primary/40 bg-[var(--primary-soft)] text-sm text-primary" aria-hidden="true">A</span><span>ALUTHRA</span></Link>
      <div className="relative my-4 grid h-[340px] place-items-center max-[800px]:hidden" aria-hidden="true"><div className="absolute size-[280px] rounded-full border border-border"/><div className="absolute size-[220px] rotate-45 border border-border"/><div className="text-[150px] font-semibold text-foreground">A</div></div>
      <div><p className="text-xs font-semibold text-muted-foreground">War of the Three Realms</p><h1 className="my-5 text-[clamp(2.25rem,4vw,3.5rem)] font-semibold leading-[1.13] tracking-[-1.5px] max-[800px]:my-3 max-[800px]:text-[32px]">Every realm.<br/>One command.</h1><p className="mb-9 text-sm text-muted-foreground max-[800px]:hidden">Manage Aluthra&apos;s live game data from one place.</p></div>
      <footer className="flex justify-between border-t border-border pt-6 text-[10px] text-muted-foreground max-[800px]:hidden">ALUTHRA <span>Administration portal</span></footer>
    </section>
    <section className="relative flex min-h-[620px] items-center justify-center bg-background px-12 py-[70px] max-[800px]:px-6 max-[800px]:py-11 max-[800px]:pb-24"><div className="w-full max-w-[370px]">
      <h2 className="mb-3 text-[40px] font-semibold tracking-[-1px]">Welcome back.</h2><p className="text-sm leading-7 text-muted-foreground">Sign in to manage the world of Aluthra.</p>
      <form className="mt-9" onSubmit={submit}>
        <Label className="mb-2.5 mt-[22px] block text-xs text-foreground" htmlFor="email">Email address</Label><Input className="h-[50px]" id="email" name="email" type="email" autoComplete="username" placeholder="Your admin email" required maxLength={254} disabled={isPending}/>
        <Label className="mb-2.5 mt-[22px] block text-xs text-foreground" htmlFor="password">Password</Label><div className="relative"><Input className="h-[50px] pr-16" id="password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="Enter your password" required maxLength={128} disabled={isPending}/><button type="button" className="absolute right-3 top-0 h-[50px] border-0 bg-transparent text-xs text-muted-foreground" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? 'Hide' : 'Show'}</button></div>
        {error && <p className="text-[13px] leading-6 text-destructive" role="alert">{error}</p>}
        <button className="mt-7 flex min-h-12 w-full items-center justify-center rounded-md bg-primary px-4 font-semibold text-primary-foreground hover:opacity-90 disabled:cursor-wait disabled:opacity-60" type="submit" disabled={isPending}>{isPending ? 'Signing in…' : 'Sign in'}</button>
      </form>
      <p className="mt-7 text-center text-[11px] leading-5 text-muted-foreground">Access is reserved for authorized administrators.<br/>Contact your administrator if you need an account.</p>
    </div><p className="absolute bottom-6 left-12 right-12 flex justify-between text-[9px] text-muted-foreground max-[800px]:bottom-16 max-[800px]:left-6 max-[800px]:right-6">Aluthra control center <span>© {new Date().getFullYear()} ALUTHRA</span></p></section>
  </main>;
}
