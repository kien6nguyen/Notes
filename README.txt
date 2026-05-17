=================================================================
  NOTES MANAGEMENT SYSTEM — README
  Laravel 13 + React 19 + MySQL + Redis + Laravel Reverb
=================================================================

-----------------------------------------------------------------
  QUICK START (Development — Docker)
-----------------------------------------------------------------

Requirements: Docker Desktop, Node.js 22+

1. Start all backend services:
   cd backend
   docker compose up -d

2. Run database migrations (first time only):
   docker exec finalweb_backend php artisan migrate --seed

3. Start Reverb WebSocket server:
   docker exec -d finalweb_backend php artisan reverb:start --host=0.0.0.0 --port=8085

4. Frontend is served in Docker at http://localhost:5173
   (or run locally: cd frontend && npm install && npm run dev)

-----------------------------------------------------------------
  SERVICES & PORTS
-----------------------------------------------------------------

  Frontend (React + Vite)   http://localhost:5173
  Backend API (Laravel)     http://localhost:8000
  WebSocket (Reverb)        ws://localhost:8085
  MySQL                     localhost:3306
  Redis                     localhost:6379

-----------------------------------------------------------------
  PRODUCTION DEPLOYMENT (VPS / Cloud Server)
-----------------------------------------------------------------

Requirements: Docker + Docker Compose on the server

1. Copy project to server:
   scp -r . user@your-server:/app/finalweb

2. Create production env file:
   cd /app/finalweb
   cp .env.prod.example .env.prod
   nano .env.prod   # fill in your values

3. Build and start production stack:
   docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build

4. Run migrations:
   docker exec finalweb_backend php artisan migrate --force

5. Start Reverb:
   docker exec -d finalweb_backend php artisan reverb:start --host=0.0.0.0 --port=8085

6. Access:
   Frontend  http://YOUR_SERVER_IP  (port 80)
   API       http://YOUR_SERVER_IP:8000

-----------------------------------------------------------------
  TEST ACCOUNTS (pre-seeded)
-----------------------------------------------------------------

  Admin account:
    Email:    admin@example.com
    Password: password

  Test user:
    Email:    test@example.com
    Password: password

  (Create accounts via /register if seeder not run)

-----------------------------------------------------------------
  FEATURES (28 criteria)
-----------------------------------------------------------------

  Account:
    1. Register       /register
    2. Activation     Auto on register (no email gate)
    3. Login/Logout   /login
    4. Password reset /forgot-password (OTP via email/console)
    5. View profile   Dashboard → Settings
    6. Edit profile   Upload avatar, change name/email
    7. Change pass    Settings → Security tab
    8. Preferences    Theme (dark/light), font size

  Notes:
    9.  List view     Toggle button in header
    10. Grid view     Default view
    11. Create note   "+ New Note" button
    12. Update note   Click note → edit in modal
    13. Delete note   Trash icon on card
    14. Auto-save     Saves automatically on modal close
    15. Attach image  Paperclip icon in note editor
    16. Pin note      Pin icon on card
    17. Search        Search bar in header
    18. Labels        Tag icon → Label Manager
    19. Label notes   Label selector in note modal
    20. Filter labels Label filter chips below header

  Advanced:
    21. Enable lock   Lock icon on note card
    22. Change pass   Lock icon (when locked) → Change Password
    23. Share note    Share icon on note card
    24. Realtime      Open same note on 2 accounts to see live sync

  Other:
    25. UI/UX         Dark mode, animations, monochrome icons
    26. Responsive    Mobile/tablet/desktop layouts
    27. Offline       Service Worker — disconnect and see cached notes
    28. Deployment    See PRODUCTION DEPLOYMENT above

-----------------------------------------------------------------
  PROJECT STRUCTURE
-----------------------------------------------------------------

  FinalWeb/
  ├── backend/              Laravel 13 API
  │   ├── docker-compose.yml   Dev compose (all services)
  │   ├── .env                 Backend config
  │   └── ...
  ├── frontend/             React 19 SPA
  │   ├── Dockerfile           Dev container
  │   ├── Dockerfile.prod      Production (Nginx build)
  │   ├── nginx.conf           Nginx SPA config
  │   └── ...
  ├── docker-compose.prod.yml  Production compose
  ├── .env.prod.example        Production env template
  └── README.txt               This file

-----------------------------------------------------------------
  NOTES
-----------------------------------------------------------------

- If email is not configured, OTP password reset codes appear
  in the Laravel logs: docker logs finalweb_backend

- Reverb WebSocket must be started manually after each
  container restart (see step 3 above)

- To clean before submission:
  Remove: backend/vendor, frontend/node_modules, frontend/dist
  These are regenerated via composer install / npm install

=================================================================
