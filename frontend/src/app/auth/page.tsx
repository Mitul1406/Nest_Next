'use client';
import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';

export default function AuthPage() {
  const { login, register } = useAuth();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({ name: '', email: '', password: '', dateOfBirth: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (tab === 'login') {
        await login(form.email, form.password);
      } else {
        await register(form.name, form.email, form.password,form.dateOfBirth);
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg" />
      <div className="auth-card">
        <div className="auth-logo">
          <h1>Expen<span>sio</span></h1>
          <p>Smart expense tracking for real life</p>
        </div>

        <div className="auth-tabs">
          <button
            className={`auth-tab ${tab === 'login' ? 'active' : ''}`}
            onClick={() => { setTab('login'); setError(''); }}
          >
            Sign In
          </button>
          <button
            className={`auth-tab ${tab === 'register' ? 'active' : ''}`}
            onClick={() => { setTab('register'); setError(''); }}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div className="alert alert-error">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {tab === 'register' && (<>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                name="name"
                className="form-input"
                placeholder="John Doe"
                value={form.name}
                onChange={handleChange}
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label">Date of Birth</label>
              <input
                type="date"
                name="dateOfBirth"
                className="form-input"
                placeholder="John Doe"
                value={form.dateOfBirth || ''}
                onChange={handleChange}
                required
                autoFocus
              />
            </div>
            </>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              name="email"
              className="form-input"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
              autoFocus={tab === 'login'}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              className="form-input"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary auth-submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="loading-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                {tab === 'login' ? 'Signing in…' : 'Creating account…'}
              </>
            ) : (
              tab === 'login' ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
