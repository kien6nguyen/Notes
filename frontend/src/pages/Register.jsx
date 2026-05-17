import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import OtpModal from '../components/OtpModal';

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

const Register = () => {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) { setError('Passwords do not match!'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      const response = await authService.register(displayName, email, password);
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      if (response.data.requires_verification) {
        setShowOtpModal(true);
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const PasswordInput = ({ value, onChange, show, onToggle, placeholder, id }) => (
    <div style={{ position: 'relative' }}>
      <input
        id={id}
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        required
        placeholder={placeholder}
        style={{ paddingRight: '2.5rem', width: '100%', boxSizing: 'border-box' }}
      />
      <button
        type="button"
        onClick={onToggle}
        tabIndex={-1}
        aria-label={show ? 'Hide password' : 'Show password'}
        style={{ position: 'absolute', right: '0.625rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0, display: 'flex', alignItems: 'center' }}
      >
        {show ? <EyeClosed /> : <EyeOpen />}
      </button>
    </div>
  );

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Create an Account</h2>
        <p>Sign up to start organizing your notes</p>

        {error && (
          <div style={{ color: '#dc2626', background: '#fef2f2', padding: '0.6rem 0.75rem', borderRadius: '6px', marginBottom: '1rem', textAlign: 'center', fontSize: '0.8125rem', border: '1px solid #fee2e2' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleRegister}>
          <div className="input-group">
            <label htmlFor="reg-name">Display Name</label>
            <input id="reg-name" type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} required placeholder="Enter your name" />
          </div>
          <div className="input-group">
            <label htmlFor="reg-email">Email Address</label>
            <input id="reg-email" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="Enter your email" />
          </div>
          <div className="input-group">
            <label htmlFor="reg-password">Password</label>
            <PasswordInput id="reg-password" value={password} onChange={e => setPassword(e.target.value)} show={showPassword} onToggle={() => setShowPassword(v => !v)} placeholder="Create a password (min. 6 chars)" />
          </div>
          <div className="input-group">
            <label htmlFor="reg-confirm">Confirm Password</label>
            <PasswordInput id="reg-confirm" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} show={showConfirmPassword} onToggle={() => setShowConfirmPassword(v => !v)} placeholder="Confirm your password" />
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Already have an account? <Link to="/login">Login</Link></p>
        </div>
      </div>

      {showOtpModal && (
        <OtpModal
          email={email}
          onSuccess={() => navigate('/dashboard')}
          onCancel={() => { setShowOtpModal(false); navigate('/login'); }}
        />
      )}
    </div>
  );
};

export default Register;
