'use client';
import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Login() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setPending(true); setError('');
    const data = new FormData(event.currentTarget);
    try {
      const response = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: data.get('email'), password: data.get('password') }) });
      if (!response.ok) {
        const result = await response.json();
        setError(result.message || 'Unable to sign in. Please try again.');
        return;
      }
      router.replace('/admin'); router.refresh();
    } catch { setError('Unable to connect. Please try again.'); }
    finally { setPending(false); }
  }
  return <main className="login-shell">
    <section className="world-panel" aria-label="ALUTHRA">
      <Link className="brand" href="/">✧ <span>ALUTHRA</span></Link>
      <div className="world-art" aria-hidden="true"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="sigil">A</div><span className="star star-one">✦</span><span className="star star-two">✧</span></div>
      <div className="world-copy"><p className="eyebrow">WAR OF THE THREE REALMS</p><h1>Every realm.<br/>One command.</h1><p>The world of Aluthra, at your fingertips.</p></div>
      <footer>ALUTHRA <span>ADMINISTRATION PORTAL</span></footer>
    </section>
    <section className="form-panel"><div className="login-card">
      <span className="badge">✧ &nbsp; ADMIN ACCESS</span>
      <h2>Welcome back.</h2><p className="muted">Sign in to manage the world of Aluthra.</p>
      <form onSubmit={submit}>
        <label htmlFor="email">Email address</label><input id="email" name="email" type="email" autoComplete="username" placeholder="admin@aluthra.com" required maxLength={254} disabled={pending}/>
        <label htmlFor="password">Password</label><div className="password-field"><input id="password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="Enter your password" required maxLength={128} disabled={pending}/><button type="button" className="reveal" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? 'Hide' : 'Show'}</button></div>
        {error && <p className="error" role="alert">{error}</p>}
        <button className="primary" type="submit" disabled={pending}>{pending ? 'Signing in…' : 'Sign in'} <span aria-hidden="true">→</span></button>
      </form>
      <p className="access-note">Access is reserved for authorized administrators.<br/>Contact your administrator if you need an account.</p>
    </div><p className="form-footer">ALUTHRA CONTROL CENTER <span>© {new Date().getFullYear()} ALUTHRA</span></p></section>
  </main>;
}
