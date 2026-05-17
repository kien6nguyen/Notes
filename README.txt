=================================================================
  NOTES MANAGEMENT SYSTEM — README
  Laravel 13 + React 19 + PostgreSQL + Redis + Laravel Reverb
=================================================================

-----------------------------------------------------------------
  LIVE PRODUCTION ENVIRONMENT (Render Cloud)
-----------------------------------------------------------------

The project is fully built, configured, and running live on Render:

  Frontend Website:   https://notes-website-dbhg.onrender.com/
  Backend API:        https://notes-i3zt.onrender.com/
  WebSocket Server:   wss://notes-i3zt.onrender.com (Secure SSL)

Infrastructure & Features on Live Server:
  - Managed PostgreSQL Database on Render.
  - Upstash Redis Cloud for Session, Cache, and Broadcast queue.
  - High-performance Laravel Reverb WebSocket for sub-100ms real-time.
  - s6-overlay supervised background services.
  - SPA Routing Fallback (Automatic reload redirect to /index.html).
  - PWA Offline caching via custom Service Worker.

-----------------------------------------------------------------
  LOCAL DEVELOPMENT QUICK START
-----------------------------------------------------------------

Requirements: Docker Desktop, Node.js 22+

1. Start all backend services:
   cd backend
   docker compose up -d

2. Run database migrations:
   docker exec finalweb_backend php artisan migrate --seed

3. Start Reverb WebSocket server:
   docker exec -d finalweb_backend php artisan reverb:start --host=0.0.0.0 --port=8085

4. Run Frontend locally:
   cd frontend
   npm install
   npm run dev

  Dev URLs:
    Frontend:   http://localhost:5173
    Backend:    http://localhost:8000
    WebSocket:  ws://localhost:8085

-----------------------------------------------------------------
  TEST ACCOUNTS (Pre-seeded)
-----------------------------------------------------------------

  Admin account:
    Email:    admin@example.com
    Password: password

  Test user:
    Email:    test@example.com
    Password: password

  (Or create new accounts directly via /register)

-----------------------------------------------------------------
  FEATURES & CRITERIA (28 Features)
-----------------------------------------------------------------

  Account Security & Customization:
    1. Register       /register (User registration)
    2. Activation     Auto on register (email gate bypass ready)
    3. Login/Logout   /login (Secure token-based auth)
    4. Password reset /forgot-password (OTP via email/console)
    5. View profile   Dashboard → Settings Modal
    6. Edit profile   Change Name/Email, Upload custom Avatar
    7. Change pass    Settings → Security tab (Current pass validation)
    8. Preferences    Themes (Dark/Light/System), Custom Font Size

  Premium Notes Management:
    9.  List view     Toggle button in Header (List view layout)
    10. Grid view     Default beautiful Masonry Grid layout
    11. Create note   "+ New Note" button
    12. Update note   Click note → edit inside high-end Modal
    13. Delete note   Trash icon on card (Safe deletion)
    14. Auto-save     Instant auto-save when closing/clicking outside modal
    15. Attach image  Paperclip icon in editor (Uploads & inline display)
    16. Pin note      Pin icon on card (Gep note on top)
    17. Search        Instant live search bar in Header
    18. Labels        Tag icon in header → Full Label Manager
    19. Label notes   Apply multiple labels inside note modal
    20. Filter labels Filter chips below header (Instant filter)

  Advanced Real-Time & Security:
    21. Enable lock   Add/Remove Password protection for sensitive notes
    22. Change pass   Change Password on locked note card
    23. Share note    Share note with Read or Edit permissions with other users
    24. Real-time     Collaborative Live-Typing via Pusher Client events (<100ms)
                      (Open same note on 2 screens to see live sync as you type!)

  PWA, UI & Offline support:
    25. UI/UX         Curated dark/light theme palette, fluid micro-animations
    26. Responsive    Seamless layout for mobile, tablet, and desktop
    27. Offline       Service Worker caching for instant offline app shell loading
    28. Deployment    Supervised production build live on Render Cloud

-----------------------------------------------------------------
  PROJECT STRUCTURE
-----------------------------------------------------------------

  FinalWeb/
  ├── backend/                 Laravel 13 API Core
  │   ├── app/Http/Controllers/ NoteController.php, ShareController.php
  │   ├── app/Events/           NoteUpdated.php, CursorMoved.php
  │   ├── Dockerfile            Container build script
  │   └── ...
  ├── frontend/                React 19 SPA
  │   ├── public/               sw.js, manifest.json, _redirects
  │   ├── src/components/       NoteModal.jsx, ShareModal.jsx
  │   ├── src/pages/            Dashboard.jsx, Login.jsx
  │   └── ...
  ├── render.yaml              Render Cloud Blueprint
  └── README.txt               This file

=================================================================
