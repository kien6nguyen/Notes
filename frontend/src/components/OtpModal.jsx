import React, { useState, useRef, useEffect } from 'react';
import { authService } from '../services/api';

const OtpModal = ({ email, onSuccess, onCancel }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const otpRefs = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => {
    // Auto-focus first box
    setTimeout(() => otpRefs.current[0]?.focus(), 150);
    // Start countdown
    startCountdown();
    return () => clearInterval(timerRef.current);
  }, []);

  const startCountdown = () => {
    setCountdown(60);
    setCanResend(false);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleChange = (index, value) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    setError('');
    if (digit && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (otp[index]) {
        const next = [...otp];
        next[index] = '';
        setOtp(next);
      } else if (index > 0) {
        otpRefs.current[index - 1]?.focus();
      }
    }
    if (e.key === 'ArrowLeft' && index > 0) otpRefs.current[index - 1]?.focus();
    if (e.key === 'ArrowRight' && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length > 0) {
      const next = Array(6).fill('');
      pasted.split('').forEach((d, i) => { next[i] = d; });
      setOtp(next);
      const focusIdx = Math.min(pasted.length, 5);
      otpRefs.current[focusIdx]?.focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) { setError('Please enter all 6 digits.'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await authService.verifyEmail(code);
      if (res.data.user) {
        localStorage.setItem('user', JSON.stringify(res.data.user));
      } else {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        user.email_verified_at = new Date().toISOString();
        localStorage.setItem('user', JSON.stringify(user));
      }
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired code. Try again.');
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    setResending(true);
    setError('');
    try {
      await authService.resendVerification();
      startCountdown();
    } catch {
      setError('Could not resend code. Please try again.');
    } finally {
      setResending(false);
    }
  };

  const filled = otp.filter(Boolean).length;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 2000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(6px)',
        animation: 'fadeIn 0.2s ease',
      }}
    >
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(24px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .otp-box:focus { border-color: var(--accent) !important; box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 20%, transparent); outline: none; }
      `}</style>

      <div
        style={{
          background: 'var(--bg-card)',
          borderRadius: '20px',
          padding: '2.5rem 2rem',
          width: '100%',
          maxWidth: '400px',
          margin: '1rem',
          boxShadow: '0 32px 80px rgba(0,0,0,0.4)',
          border: '1px solid var(--border-color)',
          animation: 'slideUp 0.25s ease',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%',
            background: 'color-mix(in srgb, var(--accent) 15%, transparent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1rem', fontSize: '1.75rem',
          }}>✉️</div>
          <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.25rem', fontWeight: '700', color: 'var(--text)' }}>
            Check your inbox
          </h3>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: '1.5' }}>
            We sent a 6-digit code to
          </p>
          <p style={{ margin: '0.25rem 0 0', fontWeight: '600', fontSize: '0.9rem', color: 'var(--accent)' }}>
            {email}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px',
            padding: '0.625rem 0.875rem', marginBottom: '1.25rem',
            color: '#dc2626', fontSize: '0.8125rem', textAlign: 'center',
          }}>
            {error}
          </div>
        )}

        {/* OTP Inputs */}
        <form onSubmit={handleVerify}>
          <div
            style={{ display: 'flex', gap: '0.625rem', justifyContent: 'center', marginBottom: '1.5rem' }}
            onPaste={handlePaste}
          >
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={el => otpRefs.current[i] = el}
                className="otp-box"
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleChange(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                style={{
                  width: '48px', height: '56px',
                  textAlign: 'center', fontSize: '1.5rem', fontWeight: '700',
                  border: `2px solid ${digit ? 'var(--accent)' : 'var(--border-color)'}`,
                  borderRadius: '12px',
                  background: digit ? 'color-mix(in srgb, var(--accent) 8%, var(--bg))' : 'var(--bg)',
                  color: 'var(--text)',
                  transition: 'all 0.15s ease',
                  cursor: 'text',
                }}
              />
            ))}
          </div>

          {/* Progress bar */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <span>{filled} / 6 digits</span>
              <span>{filled === 6 ? '✓ Ready' : `${6 - filled} remaining`}</span>
            </div>
            <div style={{ height: '3px', background: 'var(--border-color)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${(filled / 6) * 100}%`,
                background: 'var(--accent)', borderRadius: '2px',
                transition: 'width 0.2s ease',
              }} />
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading || filled !== 6}
            style={{ width: '100%', padding: '0.875rem', borderRadius: '12px', fontSize: '0.9375rem', fontWeight: '600' }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <span style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                Verifying...
              </span>
            ) : 'Verify & Continue →'}
          </button>
        </form>

        {/* Resend */}
        <div style={{ marginTop: '1.25rem', textAlign: 'center' }}>
          {canResend ? (
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--accent)', fontSize: '0.875rem', fontWeight: '500',
                padding: '0.25rem 0.5rem',
              }}
            >
              {resending ? 'Sending...' : '↺ Resend code'}
            </button>
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', margin: 0 }}>
              Resend in <strong style={{ color: 'var(--text)' }}>{countdown}s</strong>
            </p>
          )}
        </div>

        {/* Hint */}
        <div style={{
          marginTop: '1rem', padding: '0.75rem',
          background: 'color-mix(in srgb, var(--accent) 5%, var(--bg))',
          borderRadius: '10px', border: '1px dashed var(--border-color)',
          fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.5',
          textAlign: 'center',
        }}>
          💡 <strong>No email?</strong> Check spam folder, or find the OTP in server logs (Render → backend → Logs).
        </div>

        {/* Cancel */}
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            style={{
              display: 'block', width: '100%', marginTop: '0.875rem',
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-muted)', fontSize: '0.8125rem', padding: '0.375rem',
            }}
          >
            ← Back to login
          </button>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default OtpModal;
