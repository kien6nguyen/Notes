-----------------------------------------------------------------
  NOTES APP - REAL-TIME COLLABORATIVE WORKSPACE
-----------------------------------------------------------------

Live Demo: https://notes-website-dbhg.onrender.com

A modern, high-performance web application for taking notes, 
organizing ideas, and collaborating in real-time. Built with 
Laravel 11, React (Vite), and powered by Docker.

-----------------------------------------------------------------
  KEY FEATURES
-----------------------------------------------------------------

* Real-Time Collaboration: Co-edit and view note changes instantly 
  across devices, powered by Laravel Reverb (WebSockets).
* Asynchronous Processing: Background email sending (SMTP) and 
  real-time broadcasting handled seamlessly via Laravel Queue 
  Worker and Upstash Redis.
* Security & OTP Authentication: Secure user registration and 
  password recovery using real SMTP email verification.
* Production-Ready Architecture: Fully containerized with a single 
  robust Dockerfile utilizing s6-overlay to run Nginx, PHP-FPM, 
  WebSockets, and Queue Worker concurrently.

-----------------------------------------------------------------
  TECH STACK
-----------------------------------------------------------------

* Frontend: React.js, Vite, Vanilla CSS
* Backend: Laravel 11, PHP 8.4
* Database: PostgreSQL (Production) / MySQL (Local)
* Real-time & Queues: Upstash Redis, Laravel Reverb
* Deployment: Docker, Render.com

-----------------------------------------------------------------
  LOCAL DEVELOPMENT SETUP
-----------------------------------------------------------------

Requirements: Docker Desktop, Node.js 22+

1. Start the Backend (API, WebSockets, Database, Redis):
   cd backend
   docker compose up -d

2. Run Database Migrations & Seeding:
   docker exec finalweb_backend php artisan migrate --seed

3. Start the Frontend:
   cd ../frontend
   npm install
   npm run dev

   The application will be available at http://localhost:5173

-----------------------------------------------------------------
  PRODUCTION DEPLOYMENT (RENDER + UPSTASH)
-----------------------------------------------------------------

This application is designed to be easily deployed as a single Web 
Service on Render using the included render.yaml file.

1. Create a Web Service on Render using the render.yaml blueprint.
2. The blueprint provisions a PostgreSQL database automatically.
3. Create a free Redis database on Upstash (for Queues & WebSockets) 
   and fill in the missing Environment Variables in Render Dashboard.
4. Deploy the Frontend as a Static Site on Render.

Note: The included Dockerfile uses s6-overlay to automatically 
launch the Queue Worker and Reverb WebSocket server alongside the 
API, meaning you only pay for a single service instance on Render!
