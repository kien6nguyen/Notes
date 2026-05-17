import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';

const VerifyEmail = () => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if token exists, otherwise redirect to login
    if (!localStorage.getItem('token')) {
      navigate('/login');
    }
  }, [navigate]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP code.');
      setLoading(false);
      return;
    }

    try {
      const response = await authService.verifyEmail(otp);
      setSuccess(response.data.message || 'Account activated successfully!');

      // Update user in localStorage with the verified user from the server
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      } else {
        // Fallback: set email_verified_at manually
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        user.email_verified_at = new Date().toISOString();
        localStorage.setItem('user', JSON.stringify(user));
      }

      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setSuccess('');
    setResending(true);
    try {
      const response = await authService.resendVerification();
      setSuccess(response.data.message || 'A new verification code has been generated in your logs!');
    } catch (err) {
      setError('Failed to resend code. Please try again.');
    } finally {
      setResending(false);
    }
  };

  const handleLogout = () => {
    authService.logout().catch(() => {});
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="auth-container">
      <div className="auth-box" style={{ maxWidth: '400px' }}>
        <h2>Verify Your Account</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.875rem', lineHeight: '1.4' }}>
          Please enter the 6-digit OTP code to activate your account.
        </p>

        {error && (
          <div style={{ color: '#dc2626', backgroundColor: '#fef2f2', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem', textAlign: 'center', fontSize: '0.8125rem', border: '1px solid #fee2e2' }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{ color: '#16a34a', backgroundColor: '#f0fdf4', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem', textAlign: 'center', fontSize: '0.8125rem', border: '1px solid #dcfce7' }}>
            {success}
          </div>
        )}

        <form onSubmit={handleVerify}>
          <div className="input-group" style={{ marginBottom: '1.25rem' }}>
            <label style={{ textAlign: 'center', display: 'block', fontWeight: '500', marginBottom: '0.5rem' }}>6-Digit Code</label>
            <input 
              type="text" 
              value={otp} 
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} 
              required 
              maxLength={6}
              placeholder="000000"
              style={{
                textAlign: 'center',
                fontSize: '1.5rem',
                letterSpacing: '0.5rem',
                fontWeight: '600',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                outline: 'none',
                width: '100%',
                boxSizing: 'border-box',
                backgroundColor: 'var(--bg-card)'
              }}
            />
          </div>
          
          <button 
            type="submit" 
            className="btn-primary" 
            disabled={loading || otp.length !== 6}
            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', fontSize: '0.9rem', cursor: 'pointer' }}
          >
            {loading ? 'Activating...' : 'Activate Account'}
          </button>
        </form>

        <div style={{ marginTop: '1rem', backgroundColor: 'var(--bg-card)', border: '1px dashed var(--border-color)', padding: '0.75rem', borderRadius: '6px', fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
          💡 <strong>Simulation Note:</strong> If email config is not present, check container logs or Render logs for the 6-digit OTP code.
        </div>

        <div className="auth-footer" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.5rem' }}>
          <button 
            type="button" 
            className="btn-ghost" 
            onClick={handleResend}
            disabled={resending}
            style={{ fontSize: '0.8125rem', width: '100%' }}
          >
            {resending ? 'Generating new code...' : 'Resend Code'}
          </button>
          
          <button 
            type="button" 
            className="btn-ghost" 
            onClick={handleLogout}
            style={{ fontSize: '0.8125rem', color: '#dc2626', width: '100%' }}
          >
            Logout & Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
