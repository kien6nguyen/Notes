import React, { useState, useEffect } from 'react';
import { shareService } from '../services/api';

const Icons = {
  x: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  trash: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
    </svg>
  ),
  share: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
    </svg>
  ),
};

const ShareModal = ({ note, onClose }) => {
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState('read');
  const [shares, setShares] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadShares();
  }, []);

  const loadShares = async () => {
    try {
      const res = await shareService.getShares(note.id);
      setShares(res.data);
    } catch (err) {
      console.error('Failed to load shares', err);
    }
  };

  const handleShare = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await shareService.shareNote(note.id, email, permission);
      setSuccess(`Shared with ${email}`);
      setEmail('');
      loadShares();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to share');
    } finally {
      setLoading(false);
    }
  };

  const handleUnshare = async (userId) => {
    try {
      await shareService.unshareNote(note.id, userId);
      loadShares();
    } catch (err) {
      alert('Failed to remove share');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '420px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ marginBottom: '0.125rem' }}>Share Note</h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{note.title || 'Untitled'}</p>
          </div>
          <button className="btn-icon" onClick={onClose}>{Icons.x}</button>
        </div>

        {error && <div style={{ color: '#dc2626', fontSize: '0.8125rem', marginBottom: '0.75rem' }}>{error}</div>}
        {success && <div style={{ color: '#10b981', fontSize: '0.8125rem', marginBottom: '0.75rem' }}>{success}</div>}

        <form onSubmit={handleShare} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem', display: 'block' }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="user@example.com"
              required
              style={{
                width: '100%', padding: '0.5rem 0.75rem', border: '1px solid var(--border-color)',
                borderRadius: '8px', background: 'var(--box-bg)', color: 'var(--text-color)',
                fontFamily: 'inherit', fontSize: '0.875rem',
              }}
            />
          </div>
          <select
            value={permission}
            onChange={e => setPermission(e.target.value)}
            style={{
              padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '8px',
              background: 'var(--box-bg)', color: 'var(--text-color)', fontFamily: 'inherit',
              fontSize: '0.8125rem',
            }}
          >
            <option value="read">Read</option>
            <option value="edit">Edit</option>
          </select>
          <button type="submit" className="btn-primary" disabled={loading} style={{ padding: '0.5rem 0.875rem', whiteSpace: 'nowrap' }}>
            {loading ? '...' : 'Share'}
          </button>
        </form>

        {/* Shared users list */}
        <div>
          <h3 style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            Shared with ({shares.length})
          </h3>
          {shares.length === 0 ? (
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem 0' }}>Not shared with anyone yet</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              {shares.map(share => (
                <div key={share.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '0.5rem 0.625rem', borderRadius: '8px', border: '1px solid var(--border-color)',
                }}>
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{share.user.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{share.user.email}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{
                      fontSize: '0.6875rem', padding: '0.125rem 0.5rem', borderRadius: '999px',
                      backgroundColor: share.permission === 'edit' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(161, 161, 170, 0.1)',
                      color: share.permission === 'edit' ? 'var(--accent)' : 'var(--text-muted)',
                      fontWeight: 500,
                    }}>
                      {share.permission === 'edit' ? 'Can edit' : 'Can view'}
                    </span>
                    <button className="btn-icon danger" onClick={() => handleUnshare(share.user.id)} title="Remove">
                      {Icons.trash}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
          <button className="btn-ghost" onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
