import React, { useState } from 'react';
import { noteService } from '../services/api';

const LockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

// mode: 'unlock' | 'set' | 'remove' | 'change'
const PasswordModal = ({ note, onClose, onUnlocked, mode = 'unlock' }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const titles = {
    unlock: 'Unlock Note',
    set: 'Set Password',
    remove: 'Remove Password',
    change: 'Change Password',
  };
  const subtitles = {
    unlock: 'This note is password protected',
    set: 'Protect this note with a password',
    remove: 'Remove password protection from this note',
    change: 'Change the password for this note',
  };

  const handleUnlock = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await noteService.unlockNote(note.id, password);
      onUnlocked(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Incorrect password');
    } finally {
      setLoading(false);
    }
  };

  const handleSetPassword = (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 4) {
      setError('Password must be at least 4 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    onUnlocked({ password });
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 4) {
      setError('New password must be at least 4 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await noteService.changeNotePassword(note.id, currentPassword, password);
      setSuccess('Password changed successfully!');
      setTimeout(() => onClose(), 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePassword = () => {
    onUnlocked({ removePassword: true });
  };

  const submitHandler = {
    unlock: handleUnlock,
    set: handleSetPassword,
    change: handleChangePassword,
  };

  const submitLabel = {
    unlock: loading ? 'Verifying...' : 'Unlock',
    set: loading ? 'Setting...' : 'Set Password',
    change: loading ? 'Changing...' : 'Change Password',
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '380px' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
          <div style={{ color: 'var(--accent)', marginBottom: '0.75rem' }}><LockIcon /></div>
          <h2 style={{ marginBottom: '0.25rem' }}>{titles[mode]}</h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{subtitles[mode]}</p>
        </div>

        {error && <div style={{ color: '#dc2626', fontSize: '0.8125rem', textAlign: 'center', marginBottom: '0.75rem' }}>{error}</div>}
        {success && <div style={{ color: '#10b981', fontSize: '0.8125rem', textAlign: 'center', marginBottom: '0.75rem' }}>{success}</div>}

        {mode === 'remove' ? (
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
            <button className="btn-ghost" onClick={onClose}>Cancel</button>
            <button className="btn-primary" onClick={handleRemovePassword} style={{ background: '#dc2626', borderColor: '#dc2626' }}>
              Remove Password
            </button>
          </div>
        ) : (
          <form onSubmit={submitHandler[mode]}>
            {/* Current password field — for unlock and change modes */}
            {(mode === 'unlock' || mode === 'change') && (
              <div className="input-group">
                <label>{mode === 'change' ? 'Current Password' : 'Password'}</label>
                <input
                  type="password"
                  value={mode === 'change' ? currentPassword : password}
                  onChange={e => mode === 'change' ? setCurrentPassword(e.target.value) : setPassword(e.target.value)}
                  placeholder={mode === 'change' ? 'Enter current password' : 'Enter password'}
                  autoFocus
                  required
                />
              </div>
            )}

            {/* New password — for set and change modes */}
            {(mode === 'set' || mode === 'change') && (
              <div className="input-group">
                <label>{mode === 'change' ? 'New Password' : 'Password'}</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={mode === 'change' ? 'Enter new password' : 'Create password'}
                  autoFocus={mode === 'set'}
                  required
                />
              </div>
            )}

            {/* Confirm new password */}
            {(mode === 'set' || mode === 'change') && (
              <div className="input-group">
                <label>Confirm {mode === 'change' ? 'New ' : ''}Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  required
                />
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={loading}>
                {submitLabel[mode]}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default PasswordModal;
