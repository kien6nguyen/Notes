import React, { useState, useEffect, useRef, useMemo } from 'react';
import { noteService } from '../services/api';
import echo, { updateEchoAuth } from '../services/echo';

const Icons = {
  paperclip: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
    </svg>
  ),
  x: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  pinOutline: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="17" x2="12" y2="22"/><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"/>
    </svg>
  ),
  pinFilled: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="17" x2="12" y2="22"/><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"/>
    </svg>
  ),
};

// Resize image on client before uploading (max 800px)
const resizeImage = (file, maxSize = 800) => {
  return new Promise((resolve) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = (e) => {
      img.onload = () => {
        let { width, height } = img;
        if (width <= maxSize && height <= maxSize) {
          resolve(file);
          return;
        }
        const ratio = Math.min(maxSize / width, maxSize / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => {
          resolve(new File([blob], file.name, { type: file.type }));
        }, file.type, 0.85);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
};

const NoteModal = ({ note, allLabels = [], onClose, onSave, defaultNoteColor = 'default' }) => {
  const isEditing = !!note;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [color, setColor] = useState(defaultNoteColor);
  const [isPinned, setIsPinned] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [selectedLabels, setSelectedLabels] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [collaborators, setCollaborators] = useState([]);
  
  const fileInputRef = useRef(null);

  // Real-time: join presence channel when editing a shared note
  useEffect(() => {
    if (!note || !note.id || String(note.id).startsWith('temp-')) return;

    updateEchoAuth();
    const channel = echo.join(`note.${note.id}`)
      .here((users) => setCollaborators(users.filter(u => u.id !== (JSON.parse(localStorage.getItem('user') || '{}').id))))
      .joining((user) => setCollaborators(prev => [...prev, user]))
      .leaving((user) => setCollaborators(prev => prev.filter(u => u.id !== user.id)))
      .listen('.note.updated', (e) => {
        // Another user updated the note
        setTitle(e.data.title || '');
        setContent(e.data.content || '');
        setColor(e.data.color || 'default');
      });

    return () => {
      echo.leave(`note.${note.id}`);
    };
  }, [note?.id]);

  // Snapshot of original data to detect changes
  const originalData = useMemo(() => {
    if (note) {
      return {
        title: note.title || '',
        content: note.content || '',
        color: note.color || 'default',
        is_pinned: !!note.is_pinned,
        attachments: note.attachments || [],
        labels: (note.labels?.map(l => l.id) || []).sort(),
      };
    }
    return null;
  }, [note]);

  useEffect(() => {
    if (note) {
      setTitle(note.title || '');
      setContent(note.content || '');
      setColor(note.color || 'default');
      setIsPinned(note.is_pinned || false);
      setAttachments(note.attachments || []);
      setSelectedLabels(note.labels?.map(l => l.id) || []);
    } else {
      setColor(defaultNoteColor);
    }
  }, [note, defaultNoteColor]);

  // Check if current data differs from original
  const hasChanges = () => {
    const current = {
      title,
      content,
      color,
      is_pinned: isPinned,
      attachments,
      labels: [...selectedLabels].sort(),
    };

    // New note: only save if there's actual content
    if (!originalData) {
      return !!(title.trim() || content.trim() || attachments.length > 0);
    }

    // Existing note: compare fields
    if (current.title !== originalData.title) return true;
    if (current.content !== originalData.content) return true;
    if (current.color !== originalData.color) return true;
    if (current.is_pinned !== originalData.is_pinned) return true;
    if (JSON.stringify(current.attachments) !== JSON.stringify(originalData.attachments)) return true;
    if (JSON.stringify(current.labels) !== JSON.stringify(originalData.labels)) return true;
    
    return false;
  };

  const handleClose = () => {
    if (hasChanges()) {
      // Data changed → auto-save
      onSave({ title, content, color, is_pinned: isPinned, attachments, labels: selectedLabels });
    } else {
      // No changes → just close, no API call
      onClose();
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const resized = await resizeImage(file, 800);
      const res = await noteService.uploadAttachment(resized);
      setAttachments(prev => [...prev, res.data.url]);
    } catch (err) {
      console.error(err);
      alert('Failed to upload file');
    } finally {
      setUploading(false);
      e.target.value = null;
    }
  };

  const removeAttachment = (url) => {
    setAttachments(attachments.filter(a => a !== url));
  };

  const colors = [
    { value: 'default', color: 'var(--border-color)' },
    { value: 'red', color: '#ef4444' },
    { value: 'blue', color: '#3b82f6' },
    { value: 'green', color: '#10b981' },
    { value: 'yellow', color: '#f59e0b' },
  ];

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className={`modal-content color-${color}`} onClick={e => e.stopPropagation()}>
        {/* Top bar: color picker + pin */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.375rem' }}>
            {colors.map(c => (
              <button
                key={c.value}
                type="button"
                onClick={() => setColor(c.value)}
                style={{
                  width: '18px', height: '18px', borderRadius: '50%',
                  backgroundColor: c.color,
                  border: color === c.value ? '2px solid var(--text-color)' : '2px solid transparent',
                  cursor: 'pointer', padding: 0,
                  transition: 'border-color 0.15s ease',
                }}
              />
            ))}
          </div>
          <button
            type="button"
            className="btn-icon"
            onClick={() => setIsPinned(!isPinned)}
            style={{ color: isPinned ? 'var(--accent)' : 'var(--text-muted)' }}
            title={isPinned ? 'Unpin' : 'Pin note'}
          >
            {isPinned ? Icons.pinFilled : Icons.pinOutline}
          </button>
        </div>

        {/* Active collaborators */}
        {collaborators.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <div style={{ display: 'flex' }}>
              {collaborators.map(u => (
                <div key={u.id} style={{
                  width: '24px', height: '24px', borderRadius: '50%', background: 'var(--accent)',
                  color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.625rem', fontWeight: 600, marginLeft: '-4px', border: '2px solid var(--box-bg)',
                }} title={u.name}>
                  {u.name.charAt(0).toUpperCase()}
                </div>
              ))}
            </div>
            <span>{collaborators.map(u => u.name).join(', ')} editing</span>
          </div>
        )}

        <input 
          type="text" 
          placeholder="Title" 
          value={title} 
          onChange={e => setTitle(e.target.value)} 
        />
        
        {/* Labels */}
        {allLabels && allLabels.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginBottom: '0.75rem' }}>
            {allLabels.map(label => {
              const isSelected = selectedLabels.includes(label.id);
              return (
                <button 
                  type="button"
                  key={label.id}
                  onClick={() => {
                    if (isSelected) {
                      setSelectedLabels(selectedLabels.filter(id => id !== label.id));
                    } else {
                      setSelectedLabels([...selectedLabels, label.id]);
                    }
                  }}
                  style={{ 
                    cursor: 'pointer',
                    backgroundColor: isSelected ? label.color : 'transparent',
                    color: isSelected ? '#fff' : label.color,
                    border: `1px solid ${label.color}`,
                    padding: '0.2rem 0.6rem',
                    borderRadius: '999px',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    transition: 'all 0.15s ease',
                    fontFamily: 'inherit',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                  }}
                >
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: isSelected ? '#fff' : label.color, flexShrink: 0 }}></span>
                  {label.name}
                </button>
              );
            })}
          </div>
        )}

        {/* Inline attachments — between title and content */}
        {attachments.length > 0 && (
          <div className="modal-attachments">
            {attachments.map((url, i) => (
              <div key={i} className="modal-attachment-thumb">
                <img src={`http://localhost:8000${url}`} alt="attachment" />
                <button 
                  type="button" 
                  className="remove-btn"
                  onClick={() => removeAttachment(url)} 
                >
                  {Icons.x}
                </button>
              </div>
            ))}
          </div>
        )}

        <textarea 
          placeholder="Take a note..." 
          value={content} 
          onChange={e => setContent(e.target.value)}
          autoFocus={!isEditing}
        />

        {/* Actions */}
        <div className="modal-actions">
          <div>
            <button 
              type="button" 
              className="btn-ghost" 
              onClick={() => fileInputRef.current?.click()} 
              disabled={uploading}
              style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem' }}
            >
              {uploading ? <span className="spinner"></span> : Icons.paperclip}
              {uploading ? 'Uploading...' : 'Attach'}
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} style={{ display: 'none' }} accept="image/*" />
          </div>
          <button className="btn-ghost" onClick={handleClose}>Done</button>
        </div>
      </div>
    </div>
  );
};

export default NoteModal;
