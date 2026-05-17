import React, { useState, useRef } from 'react';

const ProfileSettings = ({ user, onClose, onSave }) => {
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [theme, setTheme] = useState(user?.preferences?.theme || 'light');
  const [fontSize, setFontSize] = useState(user?.preferences?.fontSize || 'medium');
  const [defaultNoteColor, setDefaultNoteColor] = useState(user?.preferences?.defaultNoteColor || 'default');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar ? `http://localhost:8000${user.avatar}` : null);
  const [isSaving, setIsSaving] = useState(false);
  const avatarInputRef = useRef(null);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('preferences', JSON.stringify({ 
      ...user.preferences, 
      theme, 
      fontSize, 
      defaultNoteColor 
    }));
    
    if (currentPassword) formData.append('currentPassword', currentPassword);
    if (newPassword) formData.append('newPassword', newPassword);

    const file = avatarInputRef.current?.files[0];
    if (file) {
      formData.append('avatar', file);
    }

    try {
      await onSave(formData);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>Settings</h2>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          
          {/* Avatar Section */}
          <div className="profile-section">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div 
                style={{ 
                  width: '56px', height: '56px', borderRadius: '50%', 
                  backgroundColor: 'var(--border-color)', overflow: 'hidden', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  cursor: 'pointer', flexShrink: 0 
                }}
                onClick={() => avatarInputRef.current?.click()}
              >
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                )}
              </div>
              <div>
                <button type="button" className="btn-ghost" onClick={() => avatarInputRef.current?.click()}>
                  Change avatar
                </button>
                <input type="file" accept="image/*" ref={avatarInputRef} style={{ display: 'none' }} onChange={handleAvatarChange} />
              </div>
            </div>
          </div>

          {/* Account Section */}
          <div className="profile-section">
            <h3>Account</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="input-group">
                <label>Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} required />
              </div>
              <div className="input-group">
                <label>Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
            </div>
          </div>

          {/* Preferences Section */}
          <div className="profile-section">
            <h3>Preferences</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
              <div className="input-group">
                <label>Theme</label>
                <select value={theme} onChange={e => setTheme(e.target.value)}>
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </div>
              <div className="input-group">
                <label>Font size</label>
                <select value={fontSize} onChange={e => setFontSize(e.target.value)}>
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>
              <div className="input-group">
                <label>Note color</label>
                <select value={defaultNoteColor} onChange={e => setDefaultNoteColor(e.target.value)}>
                  <option value="default">Default</option>
                  <option value="red">Red</option>
                  <option value="blue">Blue</option>
                  <option value="green">Green</option>
                  <option value="yellow">Yellow</option>
                </select>
              </div>
            </div>
          </div>

          {/* Password Section */}
          <div className="profile-section">
            <h3>Password</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="input-group">
                <label>Current password</label>
                <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="••••••" />
              </div>
              <div className="input-group">
                <label>New password</label>
                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="••••••" />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', paddingTop: '0.5rem' }}>
            <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={isSaving} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {isSaving && <span className="spinner"></span>}
              {isSaving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileSettings;
