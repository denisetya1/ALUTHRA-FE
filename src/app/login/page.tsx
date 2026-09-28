'use client';
import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { useManagedMutation } from '@/lib/react-query';

export default function Login() {
  const router = useRouter();
  const loginMutation = useManagedMutation();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setPending(true); setError('');
    const data = new FormData(event.currentTarget);
    await loginMutation.mutateAsync(async () => { try {
      const response = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: data.get('email'), password: data.get('password') }) });
      if (!response.ok) {
        const result = await response.json();
        const message = result.message || 'Unable to sign in. Please try again.';
        setError(message);
        toast.error(message);
        return;
      }
      toast.success('Signed in successfully.');
      router.replace('/admin'); router.refresh();
    } catch { const message = 'Unable to connect. Please try again.'; setError(message); toast.error(message); }
    finally { setPending(false); } });
  }
  const isPending = pending || loginMutation.isPending;
  return <main className="login-shell">
    <section className="world-panel" aria-label="ALUTHRA">
      <Link className="brand" href="/"><span className="realm-mark" aria-hidden="true">A</span><span>ALUTHRA</span></Link>
      <div className="world-art" aria-hidden="true"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="sigil">A</div></div>
      <div className="world-copy"><p className="eyebrow">War of the Three Realms</p><h1>Every realm.<br/>One command.</h1><p>Manage Aluthra&apos;s live game data from one place.</p></div>
      <footer>ALUTHRA <span>Administration portal</span></footer>
    </section>
    <section className="form-panel"><div className="login-card">
      <h2>Welcome back.</h2><p className="muted">Sign in to manage the world of Aluthra.</p>
      <form onSubmit={submit}>
        <label htmlFor="email">Email address</label><input id="email" name="email" type="email" autoComplete="username" placeholder="Your admin email" required maxLength={254} disabled={isPending}/>
        <label htmlFor="password">Password</label><div className="password-field"><input id="password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="Enter your password" required maxLength={128} disabled={isPending}/><button type="button" className="reveal" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? 'Hide' : 'Show'}</button></div>
        {error && <p className="error" role="alert">{error}</p>}
        <button className="primary" type="submit" disabled={isPending}>{isPending ? 'Signing in…' : 'Sign in'}</button>
      </form>
      <p className="access-note">Access is reserved for authorized administrators.<br/>Contact your administrator if you need an account.</p>
    </div><p className="form-footer">Aluthra control center <span>© {new Date().getFullYear()} ALUTHRA</span></p></section>
  </main>;
}
