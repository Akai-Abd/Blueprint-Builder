"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [isDark, setIsDark] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === 'password123') {
      setError('');
      localStorage.setItem('isAuthenticated', 'true');
      router.push('/');
    } else {
      setError('Invalid credentials. Try admin / password123');
    }
  };

  return (
    <div className={`clay-container ${isDark ? 'theme-dark' : ''}`}>
      {/* Theme Toggle Button */}
      <button 
        onClick={() => setIsDark(!isDark)}
        className="clay-btn"
        style={{
          position: 'absolute',
          top: '24px',
          right: '24px',
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          padding: 0,
          zIndex: 20,
        }}
        title="Toggle Theme"
      >
        {isDark ? '☀️' : '🌙'}
      </button>

      {/* Floating 3D Shapes */}
      <div className="clay-shape clay-shape-1"></div>
      <div className="clay-shape clay-shape-2"></div>
      <div className="clay-shape clay-shape-3"></div>

      {/* Login Card */}
      <div className="clay-card">
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, textAlign: 'center', marginBottom: '8px', color: 'var(--clay-text-primary)' }}>
          Welcome Back!
        </h1>
        <p style={{ textAlign: 'center', color: 'var(--clay-text-secondary)', marginBottom: '32px' }}>
          Please log in to your account
        </p>

        {error && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '12px', borderRadius: '12px', marginBottom: '24px', textAlign: 'center', fontWeight: 600 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--clay-text-label)', fontWeight: 600, fontSize: '14px', marginLeft: '12px' }}>
              Username or Email
            </label>
            <input 
              type="text" 
              className="clay-input" 
              placeholder="admin"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', padding: '0 12px' }}>
              <label style={{ color: 'var(--clay-text-label)', fontWeight: 600, fontSize: '14px' }}>
                Password
              </label>
              <a href="#" style={{ color: '#3b82f6', fontSize: '14px', textDecoration: 'none', fontWeight: 500 }}>
                Forgot Password?
              </a>
            </div>
            <input 
              type="password" 
              className="clay-input" 
              placeholder="password123"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="clay-btn">
            Log In
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', margin: '32px 0', gap: '16px' }}>
          <div style={{ height: '2px', backgroundColor: 'rgba(163, 177, 198, 0.2)', flex: 1, borderRadius: '2px' }}></div>
          <span style={{ color: 'var(--clay-text-secondary)', fontSize: '14px', fontWeight: 500 }}>Or log in with</span>
          <div style={{ height: '2px', backgroundColor: 'rgba(163, 177, 198, 0.2)', flex: 1, borderRadius: '2px' }}></div>
        </div>

        <div style={{ display: 'flex', gap: '16px' }}>
          <button type="button" className="clay-btn clay-btn--social">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google
          </button>
          <button type="button" className="clay-btn clay-btn--social" style={{ color: 'var(--clay-text-primary)' }}>
            <svg viewBox="0 0 24 24" width="24" height="24" fill="#1877f2">
              <path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.5c-1.5 0-1.96.93-1.96 1.89v2.26h3.32l-.53 3.5h-2.8V24C19.62 23.1 24 18.1 24 12.07" />
            </svg>
            Facebook
          </button>
        </div>

        <p style={{ textAlign: 'center', marginTop: '32px', color: 'var(--clay-text-secondary)', fontSize: '14px', fontWeight: 500 }}>
          Don't have an account? <a href="#" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 600 }}>Sign Up</a>
        </p>
      </div>
    </div>
  );
}
