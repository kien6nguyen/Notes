import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';

const EyeOpen = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const EyeClosed = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // OTP modal for unverified accounts
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendMsg, setResendMsg] = useState('');

  const otpRefs = useRef([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (showOtpModal) {
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    }
  }, [showOtpModal]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await authService.login(email, password);
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      if (response.data.requires_verification) {
        setShowOtpModal(true);
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    setOtpError('');
    if (digit && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) otpRefs.current[index - 1]?.focus();
    if (e.key === 'ArrowLeft' && index > 0) otpRefs.current[index - 1]?.focus();
    if (e.key === 'ArrowRight' && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      otpRefs.current[5]?.focus();
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) { setOtpError('Please enter all 6 digits.'); return; }
    setOtpLoading(true);
    setOtpError('');
    try {
      const response = await authService.verifyEmail(code);
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      } else {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        user.email_verified_at = new Date().toISOString();
        localStorage.setItem('user', JSON.stringify(user));
      }
      navigate('/dashboard');
    } catch (err) {
      setOtpError(err.response?.data?.message || 'Invalid or expired code.');
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setResendMsg('');
    try {
      await authService.resendVerification();
      setResendMsg('New code sent! Check your email or server logs.');
    } catch {
      setResendMsg('Failed to resend. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Welcome Back</h2>
        <p>Login to your account to continue</p>

        {error && (
          <div style={{ color: '#dc2626', backgroundColor: '#fef2f2', padding: '0.6rem 0.75rem', borderRadius: '6px', marginBottom: '1rem', textAlign: 'center', fontSize: '0.8125rem', border: '1px solid #fee2e2' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••"
                style={{ paddingRight: '2.5rem', width: '100%', boxSizing: 'border-box' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                style={{ position: 'absolute', right: '0.625rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0', display: 'flex', alignItems: 'center' }}
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeClosed /> : <EyeOpen />}
              </button>
            </div>
            <div style={{ textAlign: 'right', marginTop: '0.25rem' }}>
              <Link to="/forgot-password" style={{ fontSize: '0.8125rem', color: 'var(--accent)', textDecoration: 'none' }}>Forgot password?</Link>
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account? <Link to="/register">Sign Up</Link>
        </div>
      </div>

      {/* ── OTP Modal for unverified accounts ── */}
      {showOtpModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'var(--bg-card)', borderRadius: '16px', padding: '2rem', width: '100%', maxWidth: '380px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>✉️</div>
            <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.1rem' }}>Verify your account</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
              Enter the 6-digit code sent to<br/>
              <strong style={{ color: 'var(--text)' }}>{email}</strong>
            </p>

            {otpError && <div style={{ color: '#dc2626', background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '6px', padding: '0.5rem 0.75rem', marginBottom: '1rem', fontSize: '0.8125rem' }}>{otpError}</div>}
            {resendMsg && <div style={{ color: '#16a34a', background: '#f0fdf4', border: '1px solid #dcfce7', borderRadius: '6px', padding: '0.5rem 0.75rem', marginBottom: '1rem', fontSize: '0.8125rem' }}>{resendMsg}</div>}

            <form onSubmit={handleVerifyOtp}>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '1.25rem' }} onPaste={handleOtpPaste}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => otpRefs.current[i] = el}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(i, e)}
                    style={{ width: '44px', height: '52px', textAlign: 'center', fontSize: '1.375rem', fontWeight: '700', border: `2px solid ${digit ? 'var(--accent)' : 'var(--border-color)'}`, borderRadius: '10px', background: 'var(--bg)', color: 'var(--text)', outline: 'none', transition: 'border-color 0.15s' }}
                  />
                ))}
              </div>
              <button type="submit" className="btn-primary" disabled={otpLoading || otp.join('').length !== 6} style={{ width: '100%', marginBottom: '0.75rem' }}>
                {otpLoading ? 'Verifying...' : 'Verify & Sign In'}
              </button>
            </form>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Didn't receive it?</span>
              <button type="button" className="btn-ghost" onClick={handleResend} disabled={resending} style={{ fontSize: '0.8125rem', padding: '0.25rem 0.5rem' }}>
                {resending ? 'Sending...' : 'Resend code'}
              </button>
            </div>

            <div style={{ marginTop: '1rem', padding: '0.625rem', background: 'var(--bg)', borderRadius: '8px', fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
              💡 No email config? Find the OTP in the <strong>server logs</strong>.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
