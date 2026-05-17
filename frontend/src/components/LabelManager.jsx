import React, { useState } from 'react';
import { labelService } from '../services/api';

const Icons = {
  edit: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  ),
  trash: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
    </svg>
  ),
  check: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  x: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
};

const LabelManager = ({ labels, onClose, onRefresh }) => {
  const [newLabelName, setNewLabelName] = useState('');
  const [newLabelColor, setNewLabelColor] = useState('#6366f1');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newLabelName.trim()) return;
    try {
      await labelService.createLabel({ name: newLabelName, color: newLabelColor });
      setNewLabelName('');
      setNewLabelColor('#6366f1');
      onRefresh();
    } catch (err) {
      alert('Failed to create label');
    }
  };

  const handleUpdate = async (id) => {
    try {
      await labelService.updateLabel(id, { name: editName, color: editColor });
      setEditingId(null);
      onRefresh();
    } catch (err) {
      alert('Failed to update label');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this label?")) {
      try {
        await labelService.deleteLabel(id);
        onRefresh();
      } catch (err) {
        alert('Failed to delete label');
      }
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
        <h2 style={{ marginBottom: '1.25rem' }}>Labels</h2>
        
        {/* Create form */}
        <form onSubmit={handleCreate} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', alignItems: 'center' }}>
          <input 
            type="color" 
            value={newLabelColor} 
            onChange={e => setNewLabelColor(e.target.value)} 
            style={{ width: '32px', height: '32px', padding: 0, border: '1px solid var(--border-color)', borderRadius: '6px', cursor: 'pointer', background: 'transparent' }} 
          />
          <input 
            type="text" 
            value={newLabelName} 
            onChange={e => setNewLabelName(e.target.value)} 
            placeholder="Label name" 
            style={{ 
              flex: 1, padding: '0.5rem 0.75rem', border: '1px solid var(--border-color)', 
              borderRadius: '8px', background: 'var(--box-bg)', color: 'var(--text-color)',
              fontFamily: 'inherit', fontSize: '0.875rem'
            }} 
            required 
          />
          <button type="submit" className="btn-primary" style={{ padding: '0.5rem 0.875rem' }}>Add</button>
        </form>

        {/* Labels list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {labels.map(label => (
            <div key={label.id} style={{ 
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
              padding: '0.5rem 0.625rem', borderRadius: '8px',
              transition: 'background-color 0.15s ease',
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--border-color)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              {editingId === label.id ? (
                <div style={{ display: 'flex', gap: '0.375rem', width: '100%', alignItems: 'center' }}>
                  <input 
                    type="color" 
                    value={editColor} 
                    onChange={e => setEditColor(e.target.value)} 
                    style={{ width: '28px', height: '28px', padding: 0, border: 'none', cursor: 'pointer', background: 'transparent' }} 
                  />
                  <input 
                    type="text" 
                    value={editName} 
                    onChange={e => setEditName(e.target.value)} 
                    style={{ 
                      flex: 1, padding: '0.375rem 0.5rem', border: '1px solid var(--border-color)', 
                      borderRadius: '6px', fontSize: '0.8125rem', background: 'var(--box-bg)', 
                      color: 'var(--text-color)', fontFamily: 'inherit'
                    }} 
                  />
                  <button className="btn-icon" onClick={() => handleUpdate(label.id)} title="Save">
                    {Icons.check}
                  </button>
                  <button className="btn-icon" onClick={() => setEditingId(null)} title="Cancel">
                    {Icons.x}
                  </button>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: label.color, flexShrink: 0 }}></div>
                    <span style={{ fontSize: '0.875rem' }}>{label.name}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.125rem' }}>
                    <button className="btn-icon" onClick={() => { setEditingId(label.id); setEditName(label.name); setEditColor(label.color); }} title="Edit">
                      {Icons.edit}
                    </button>
                    <button className="btn-icon danger" onClick={() => handleDelete(label.id)} title="Delete">
                      {Icons.trash}
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
          {labels.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8125rem', padding: '1rem 0' }}>No labels yet</p>}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
          <button className="btn-ghost" onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  );
};

export default LabelManager;
