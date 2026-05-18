import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, noteService, labelService, shareService } from '../services/api';
import NoteModal from '../components/NoteModal';
import LabelManager from '../components/LabelManager';
import ProfileSettings from '../components/ProfileSettings';
import PasswordModal from '../components/PasswordModal';
import ShareModal from '../components/ShareModal';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const IMAGE_BASE = API_URL.replace('/api', '');

// ─── SVG Icons (monochrome) ───
const Icons = {
  plus: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  grid: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
    </svg>
  ),
  list: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
    </svg>
  ),
  tag: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>
    </svg>
  ),
  settings: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  ),
  logout: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
  trash: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
    </svg>
  ),
  lock: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  ),
  share: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
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

const Dashboard = () => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      if (parsed.preferences) {
        if (parsed.preferences.theme) document.documentElement.setAttribute('data-theme', parsed.preferences.theme);
        if (parsed.preferences.fontSize) document.documentElement.setAttribute('data-font-size', parsed.preferences.fontSize);
      }
      return parsed;
    }
    return null;
  });
  const [notes, setNotes] = useState(() => {
    const cached = localStorage.getItem('cached_notes');
    return cached ? JSON.parse(cached) : [];
  });
  const [labels, setLabels] = useState(() => {
    const cached = localStorage.getItem('cached_labels');
    return cached ? JSON.parse(cached) : [];
  });
  const [search, setSearch] = useState('');
  const [filterLabel, setFilterLabel] = useState(null);
  const [filterOwner, setFilterOwner] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLabelManagerOpen, setIsLabelManagerOpen] = useState(false);
  const [currentNote, setCurrentNote] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [isLoading, setIsLoading] = useState(() => !localStorage.getItem('cached_notes'));
  const [pendingSaves, setPendingSaves] = useState(0);
  const [passwordModal, setPasswordModal] = useState(null); // {note, mode}
  const [shareModal, setShareModal] = useState(null); // note
  const [sharedNotes, setSharedNotes] = useState([]);
  const [showShared, setShowShared] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  
  const navigate = useNavigate();

  // Online/offline detection
  useEffect(() => {
    const goOnline = () => { setIsOffline(false); fetchData(); };
    const goOffline = () => setIsOffline(true);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  // Reset filters when tab changes
  useEffect(() => {
    setFilterLabel(null);
    setFilterOwner(null);
  }, [showShared]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (pendingSaves > 0) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [pendingSaves]);

  const fetchData = useCallback(async () => {
    // First check if user is verified by fetching notes alone
    // This way a single clear 403 can redirect to verify-email
    try {
      const notesRes = await noteService.getNotes();
      
      // If notes succeeded, load everything else in parallel
      const [labelsRes, sharedRes] = await Promise.all([
        labelService.getLabels(),
        shareService.getSharedWithMe().catch(() => ({ data: [] }))
      ]);

      setNotes(prev => {
        const tempIdMap = {};
        if (Array.isArray(prev)) {
          prev.forEach(n => { if (n._tempId) tempIdMap[n.id] = n._tempId; });
        }
        return notesRes.data.map(n => tempIdMap[n.id] ? { ...n, _tempId: tempIdMap[n.id] } : n);
      });

      setLabels(labelsRes.data);
      setSharedNotes(sharedRes.data || []);
    } catch (error) {
      if (error.response) {
        if (error.response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
        } else if (error.response.status === 403 && error.response.data?.requires_verification) {
          navigate('/verify-email');
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    if (Array.isArray(notes)) {
      localStorage.setItem('cached_notes', JSON.stringify(notes));
    }
  }, [notes]);

  useEffect(() => {
    if (Array.isArray(labels)) {
      localStorage.setItem('cached_labels', JSON.stringify(labels));
    }
  }, [labels]);

  useEffect(() => {
    // 1. No token at all → login
    if (!localStorage.getItem('token')) {
      navigate('/login');
      return;
    }

    // 2. Token exists but account not yet verified → verify-email
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      if (parsed.email_verified_at === null) {
        navigate('/verify-email');
        return;
      }
    }

    fetchData();
  }, [fetchData, navigate]);

  const handleLogout = () => {
    authService.logout().catch(() => {});
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('cached_notes');
    localStorage.removeItem('cached_labels');
    navigate('/login');
  };

  const handleOpenModal = (note = null) => {
    // If note is locked, show password prompt first
    if (note && note.is_locked) {
      setPasswordModal({ note, mode: 'unlock' });
      return;
    }
    setCurrentNote(note);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentNote(null);
  };

  const handleNoteUnlocked = (data) => {
    // data is the full note from unlock API
    setPasswordModal(null);
    setCurrentNote(data);
    setIsModalOpen(true);
  };

  const handleSaveNote = async (noteData) => {
    const isUpdating = currentNote && currentNote.id;
    const isSharedNote = currentNote && (currentNote.share_permission || currentNote.pivot?.permission);
    const optimisticLabels = (noteData.labels || []).map(id => labels.find(l => l.id === id)).filter(Boolean);
    const optimisticNote = { 
      ...noteData, 
      labels: optimisticLabels,
      id: isUpdating ? currentNote.id : `temp-${Date.now()}`,
      updated_at: new Date().toISOString(),
      _isSaving: true
    };

    setPendingSaves(prev => prev + 1);

    if (isSharedNote) {
      setSharedNotes(prev => {
        const safePrev = Array.isArray(prev) ? prev : [];
        return safePrev.map(n => n.id === currentNote.id ? { ...n, ...optimisticNote } : n);
      });
    } else {
      setNotes(prev => {
        const safePrev = Array.isArray(prev) ? prev : [];
        if (isUpdating) {
          return safePrev.map(n => n.id === currentNote.id ? { ...n, ...optimisticNote } : n).sort((a, b) => b.is_pinned - a.is_pinned);
        }
        return [optimisticNote, ...safePrev].sort((a, b) => b.is_pinned - a.is_pinned);
      });
    }
    
    handleCloseModal();

    try {
      if (isUpdating) {
        const res = await noteService.updateNote(currentNote.id, noteData);
        if (isSharedNote) {
          setSharedNotes(prev => prev.map(n => n.id === currentNote.id ? { ...n, ...res.data, share_permission: currentNote.share_permission || currentNote.pivot?.permission, owner: currentNote.owner || currentNote.user } : n));
        } else {
          setNotes(prev => prev.map(n => n.id === currentNote.id ? { ...res.data, _tempId: n._tempId } : n).sort((a, b) => b.is_pinned - a.is_pinned));
        }
      } else {
        const res = await noteService.createNote(noteData);
        setNotes(prev => prev.map(n => n.id === optimisticNote.id ? { ...res.data, _tempId: optimisticNote.id } : n).sort((a, b) => b.is_pinned - a.is_pinned));
      }
    } catch (e) {
      fetchData();
      alert("Failed to save note");
    } finally {
      setPendingSaves(prev => Math.max(0, prev - 1));
    }
  };

  // Quick pin toggle from card
  const handleTogglePin = async (note, e) => {
    e.stopPropagation();
    if (!note.id || String(note.id).startsWith('temp-')) return;

    const newPinned = !note.is_pinned;

    // Optimistic update
    setNotes(prev => 
      (Array.isArray(prev) ? prev : [])
        .map(n => n.id === note.id ? { ...n, is_pinned: newPinned } : n)
        .sort((a, b) => b.is_pinned - a.is_pinned)
    );

    try {
      await noteService.updateNote(note.id, {
        title: note.title,
        content: note.content,
        color: note.color,
        is_pinned: newPinned,
        labels: note.labels?.map(l => l.id) || [],
        attachments: note.attachments || [],
      });
    } catch (err) {
      // Revert on failure
      setNotes(prev => 
        (Array.isArray(prev) ? prev : [])
          .map(n => n.id === note.id ? { ...n, is_pinned: !newPinned } : n)
          .sort((a, b) => b.is_pinned - a.is_pinned)
      );
    }
  };

  const handleDeleteNote = async (id, e) => {
    e.stopPropagation();
    if (!id || String(id).startsWith('temp-')) {
      setNotes(prev => (Array.isArray(prev) ? prev : []).filter(n => n.id !== id));
      return;
    }
    
    if (window.confirm("Are you sure you want to delete this note?")) {
      setNotes(prev => (Array.isArray(prev) ? prev : []).filter(n => n.id !== id));
      
      try {
        await noteService.deleteNote(id);
      } catch (err) {
        fetchData();
        alert("Failed to delete note");
      }
    }
  };

  const handleSaveProfile = async (profileData) => {
    try {
      const prefsStr = profileData.get('preferences');
      if (prefsStr) {
        const prefs = JSON.parse(prefsStr);
        if (prefs.theme) document.documentElement.setAttribute('data-theme', prefs.theme);
        if (prefs.fontSize) document.documentElement.setAttribute('data-font-size', prefs.fontSize);
      }

      const response = await authService.updateProfile(profileData);
      setUser(response.data.user);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setIsSettingsOpen(false);
    } catch (err) {
      if (user?.preferences?.theme) document.documentElement.setAttribute('data-theme', user.preferences.theme);
      if (user?.preferences?.fontSize) document.documentElement.setAttribute('data-font-size', user.preferences.fontSize);
      alert(err.response?.data?.message || "Failed to update profile");
    }
  };

  // Cache notes & labels to localStorage for offline access
  useEffect(() => {
    if (Array.isArray(notes) && notes.length > 0) {
      localStorage.setItem('cached_notes', JSON.stringify(notes));
    }
    if (Array.isArray(labels) && labels.length > 0) {
      localStorage.setItem('cached_labels', JSON.stringify(labels));
    }
  }, [notes, labels]);

  // Extract unique owners from shared notes for filtering
  const uniqueOwners = React.useMemo(() => {
    const ownersMap = {};
    if (Array.isArray(sharedNotes)) {
      sharedNotes.forEach(note => {
        if (note.owner && note.owner.id) {
          ownersMap[note.owner.id] = note.owner;
        }
      });
    }
    return Object.values(ownersMap);
  }, [sharedNotes]);

  // Filter notes by label and search query instantly in the frontend
  const filteredNotes = (() => {
    const source = showShared ? sharedNotes : (Array.isArray(notes) ? notes : []);
    let result = source;
    
    if (filterLabel) {
      result = result.filter(n => n.labels && n.labels.some(l => l.id === filterLabel));
    }

    if (showShared && filterOwner) {
      result = result.filter(n => n.owner && n.owner.id === filterOwner);
    }
    
    if (search.trim()) {
      const query = search.toLowerCase();
      result = result.filter(n => {
        const titleMatch = n.title && n.title.toLowerCase().includes(query);
        const contentMatch = n.content && n.content.toLowerCase().includes(query);
        const labelMatch = n.labels && n.labels.some(l => l.name.toLowerCase().includes(query));
        const ownerMatch = showShared && n.owner && n.owner.name.toLowerCase().includes(query);
        return titleMatch || contentMatch || labelMatch || ownerMatch;
      });
    }
    
    return result;
  })();

  if (!user) return <div style={{textAlign: 'center', padding: '2rem', color: 'var(--text-muted)'}}>Loading...</div>;

  return (
    <div className="dashboard-container">
      {/* Offline indicator */}
      {isOffline && (
        <div style={{
          background: '#f59e0b', color: '#000', textAlign: 'center',
          padding: '0.5rem', fontSize: '0.8125rem', fontWeight: 500,
          borderRadius: '8px', marginBottom: '0.75rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="1" y1="1" x2="23" y2="23"/><path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/><path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"/><path d="M10.71 5.05A16 16 0 0 1 22.56 9"/><path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/>
          </svg>
          You're offline — viewing cached notes
        </div>
      )}

      {/* Header */}
      <div className="dashboard-header">
        <div className="header-left">
          <div className="avatar-circle" style={{ backgroundColor: user.avatar ? 'transparent' : 'var(--accent)', color: '#fff' }}>
            {user.avatar ? (
              <img src={`${IMAGE_BASE}${user.avatar}`} alt="Avatar" />
            ) : (
              user.name.charAt(0).toUpperCase()
            )}
          </div>
          <h2>{user.name}'s Notes</h2>
        </div>

        <div className="search-bar">
          <input 
            type="text" 
            placeholder="Search notes..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="header-actions">
          <button className="btn-icon" onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')} title={viewMode === 'grid' ? 'List view' : 'Grid view'}>
            {viewMode === 'grid' ? Icons.list : Icons.grid}
          </button>
          <button className="btn-icon" onClick={() => setIsLabelManagerOpen(true)} title="Manage labels">
            {Icons.tag}
          </button>
          <button className="btn-icon" onClick={() => setIsSettingsOpen(true)} title="Settings">
            {Icons.settings}
          </button>
          <button className="btn-primary" onClick={() => handleOpenModal()} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            {Icons.plus} New Note
          </button>
          <button className="btn-icon danger" onClick={handleLogout} title="Logout">
            {Icons.logout}
          </button>
        </div>
      </div>

      {/* Tabs: My Notes / Shared with me */}
      <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1rem' }}>
        <button
          className={`label-filter-chip ${!showShared ? 'active' : ''}`}
          onClick={() => setShowShared(false)}
        >
          My Notes
        </button>
        <button
          className={`label-filter-chip ${showShared ? 'active' : ''}`}
          onClick={() => setShowShared(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
        >
          {Icons.share} Shared ({sharedNotes.length})
        </button>
      </div>


      {/* Label Filter Bar */}
      {labels.length > 0 && (
        <div className="label-filter-bar">
          <button 
            className={`label-filter-chip ${!filterLabel ? 'active' : ''}`}
            onClick={() => setFilterLabel(null)}
          >
            All
          </button>
          {labels.map(label => (
            <button
              key={label.id}
              className={`label-filter-chip ${filterLabel === label.id ? 'active' : ''}`}
              onClick={() => setFilterLabel(filterLabel === label.id ? null : label.id)}
              style={filterLabel === label.id ? { 
                backgroundColor: label.color, 
                color: '#fff',
                borderColor: label.color,
              } : {}}
            >
              <span className="label-dot" style={{ backgroundColor: label.color }}></span>
              {label.name}
            </button>
          ))}
        </div>
      )}

      {/* Owner Filter Bar (only for Shared tab) */}
      {showShared && uniqueOwners.length > 0 && (
        <div className="label-filter-bar" style={{ marginTop: '0.5rem', borderTop: '1px dashed var(--border-color)', paddingTop: '0.75rem', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.375rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', marginRight: '0.5rem', fontWeight: 500 }}>
            Shared by:
          </span>
          <button 
            className={`label-filter-chip ${!filterOwner ? 'active' : ''}`}
            onClick={() => setFilterOwner(null)}
          >
            All Sharers
          </button>
          {uniqueOwners.map(owner => (
            <button
              key={owner.id}
              className={`label-filter-chip ${filterOwner === owner.id ? 'active' : ''}`}
              onClick={() => setFilterOwner(filterOwner === owner.id ? null : owner.id)}
            >
              {owner.name}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="empty-state">
          <div className="spinner" style={{ width: '24px', height: '24px', marginBottom: '1rem' }}></div>
          <p>Loading notes...</p>
        </div>
      ) : (filteredNotes.length === 0) ? (
        <div className="empty-state">
          <h3>{filterLabel ? 'No notes with this label' : 'No notes yet'}</h3>
          <p>{filterLabel ? 'Try selecting a different label' : 'Click "New Note" to get started'}</p>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'notes-grid' : 'notes-list'}>
          {filteredNotes.map((note, noteIndex) => {
            const isTemp = String(note.id).startsWith('temp-') || note._isSaving;
            return (
            <div 
              key={note.id ? `note-${note.id}-${note.is_pinned}` : `note-temp-${note._tempId || noteIndex}`} 
              className={`note-card color-${note.color} ${note.is_pinned ? 'pinned' : ''}`}
              onClick={() => !isTemp && handleOpenModal(note)}
              style={{ 
                opacity: isTemp ? 0.5 : 1, 
                cursor: isTemp ? 'wait' : 'pointer',
              }}
            >
              {/* Status icons — top right */}
              <div className="note-status-icons">
                {note.is_locked && <span title="Password protected" style={{ color: 'var(--text-muted)' }}>{Icons.lock}</span>}
                {note.is_shared && <span title="Shared" style={{ color: 'var(--accent)' }}>{Icons.share}</span>}
                <button
                  className={`note-pin-btn ${note.is_pinned ? 'pinned' : ''}`}
                  style={{ position: 'static' }}
                  onClick={(e) => handleTogglePin(note, e)}
                  title={note.is_pinned ? 'Unpin' : 'Pin note'}
                >
                  {note.is_pinned ? Icons.pinFilled : Icons.pinOutline}
                </button>
              </div>

              {showShared && note.owner && (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.25rem', 
                  fontSize: '0.75rem', 
                  color: 'var(--accent)', 
                  marginBottom: '0.375rem',
                  fontWeight: 600
                }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                  <span>By: {note.owner.name}</span>
                </div>
              )}

              <div className="note-title">{note.title || 'Untitled'}</div>

              {/* Content — locked notes show placeholder */}
              <div className="note-body">
                {note.is_locked ? (
                  <div className="note-content" style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>🔒 This note is locked</div>
                ) : (
                  <>
                    {note.attachments && note.attachments.length > 0 && (
                      <div className="note-inline-images">
                        {note.attachments.map((url, i) => (
                          <img key={i} src={`${IMAGE_BASE}${url}`} alt="attachment" className="note-thumb" />
                        ))}
                      </div>
                    )}
                    <div className="note-content">{note.content}</div>
                  </>
                )}
              </div>
              
              {/* Labels */}
              {note.labels && note.labels.length > 0 && (
                <div className="note-labels">
                  {note.labels.map((label, labelIndex) => (
                    <span 
                      key={label.id ? `label-${label.id}` : `label-index-${labelIndex}`} 
                      className="label-badge"
                      style={{ 
                        backgroundColor: label.color + '15', 
                        color: label.color,
                        border: `1px solid ${label.color}40`,
                      }}
                    >
                      <span className="label-dot-sm" style={{ backgroundColor: label.color }}></span>
                      {label.name}
                    </span>
                  ))}
                </div>
              )}

              <div className="note-footer">
                <span>{new Date(note.updated_at).toLocaleDateString()}</span>
                <div style={{ display: 'flex', gap: '0.125rem' }}>
                  {!showShared && (
                    <>
                      <button className="btn-icon" onClick={(e) => { e.stopPropagation(); setShareModal(note); }} title="Share">{Icons.share}</button>
                      {note.is_locked ? (
                        <>
                          <button className="btn-icon" onClick={(e) => { e.stopPropagation(); setPasswordModal({ note, mode: 'change' }); }} title="Change password">{Icons.lock}</button>
                          <button className="btn-icon danger" onClick={(e) => { e.stopPropagation(); setPasswordModal({ note, mode: 'remove' }); }} title="Remove lock" style={{ fontSize: '0.6rem' }}>🔓</button>
                        </>
                      ) : (
                        <button className="btn-icon" onClick={(e) => { e.stopPropagation(); setPasswordModal({ note, mode: 'set' }); }} title="Lock note">{Icons.lock}</button>
                      )}
                    </>
                  )}
                  <button className="btn-icon danger" onClick={(e) => { if (isTemp) return; handleDeleteNote(note.id, e); }} disabled={isTemp}>{Icons.trash}</button>
                </div>
              </div>
            </div>
          );})}
        </div>
      )}

      {isModalOpen && (
        <NoteModal 
          note={currentNote} 
          allLabels={labels}
          onClose={handleCloseModal} 
          onSave={handleSaveNote} 
          defaultNoteColor={user?.preferences?.defaultNoteColor || 'default'}
        />
      )}

      {isSettingsOpen && (
        <ProfileSettings 
          user={user} 
          onClose={() => setIsSettingsOpen(false)} 
          onSave={handleSaveProfile} 
        />
      )}

      {isLabelManagerOpen && (
        <LabelManager 
          labels={labels} 
          onClose={() => setIsLabelManagerOpen(false)} 
          onRefresh={fetchData} 
        />
      )}

      {passwordModal && (
        <PasswordModal
          note={passwordModal.note}
          mode={passwordModal.mode}
          onClose={() => setPasswordModal(null)}
          onUnlocked={(data) => {
            if (passwordModal.mode === 'unlock') {
              handleNoteUnlocked(data);
            } else if (data.password) {
              // Set password
              noteService.updateNote(passwordModal.note.id, { ...passwordModal.note, password: data.password, labels: passwordModal.note.labels?.map(l => l.id) || [] }).then(() => fetchData());
              setPasswordModal(null);
            } else if (data.removePassword) {
              // Remove password
              noteService.updateNote(passwordModal.note.id, { ...passwordModal.note, remove_password: true, labels: passwordModal.note.labels?.map(l => l.id) || [] }).then(() => fetchData());
              setPasswordModal(null);
            }
          }}
        />
      )}

      {shareModal && (
        <ShareModal
          note={shareModal}
          onClose={() => { setShareModal(null); fetchData(); }}
        />
      )}
    </div>
  );
};

export default Dashboard;
