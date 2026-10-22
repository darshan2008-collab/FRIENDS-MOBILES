# FRIENDS MOBILE - Full-Stack E-Commerce Platform

Production e-commerce application for **FRIENDS MOBILE** built with **React**, **Express.js**, **PostgreSQL**, **Capacitor Mobile**, dual **Light & Dark Themes**, and high-performance microservices.

---

## Directory Structure

```text
FRIENDS MOBILE/
├── android/                         # Capacitor Native Android Mobile App
│   ├── app/                         # Android application sources, manifest & resources
│   └── certs/                       # Keystore and signing keys (e.g. friends-key.jks)
├── server/                          # Production Backend Microservices (Express & PostgreSQL)
│   ├── config/                      # Database & microservice configurations
│   ├── controllers/                 # Route business logic controllers
│   ├── models/                      # PostgreSQL data models
│   ├── routes/                      # REST API endpoints (auth, orders, products, etc.)
│   ├── services/                    # Cloud services (Google Drive, Email, Invoicing)
│   ├── server.js                    # Core API entry point (Port 5000)
│   ├── mailServer.js                # Dedicated Mail/OTP microservice
│   └── worker.js                    # Background sync & automated backup worker
├── src/                             # Production React SPA Frontend
│   ├── assets/                      # Bundled brand assets & base64 embeds
│   ├── components/                  # Modular UI components
│   ├── data/                        # Static datasets, SEO schema, translations
│   ├── services/                    # Frontend API & analytics clients
│   ├── styles/                      # Theme and global CSS (theme.css, style.css)
│   ├── App.jsx                      # Root application component
│   └── main.jsx                     # React DOM entry point
├── public/                          # Static public assets served by Vite
├── scripts/                         # Build, image sync & asset generation automation
│   ├── copy_images.cjs              # Asset synchronization script
│   ├── create_base64.cjs            # Hero showcase base64 builder
│   ├── generate_android_assets.py   # Android launcher & splash generator
│   └── render_splash_video.py       # High-definition splash screen renderer
├── docs/                            # Guides, indexing, and security documentation
├── logs/                            # Local JVM & build diagnostics logs
├── legacy_archive/                  # Archived previous iterations (preserved untouched)
│   ├── backend_json_mock/           # Early JSON-mock backend
│   ├── frontend_backup/             # Previous standalone client build
│   └── static_web/                  # Early static website files
├── docker-compose.yml               # Multi-container production deployment
├── Dockerfile                       # Production Nginx frontend container
├── index.html                       # Vite HTML entry point
├── nginx.conf                       # Production reverse proxy & caching rules
└── package.json                     # Monorepo / root scripts and dependencies
```

---

## Quick Start Guide

### 1. Run Front-End (Vite Dev Server)
```bash
npm install
npm run dev
```

### 2. Run Backend API Server
Start the Express server on Port 5000:
```bash
node server.js
# or: cd server && npm start
```
- Server Health: `http://localhost:5000/api/health`
- Products API: `http://localhost:5000/api/products`

### 3. Build for Android Mobile App
```bash
npm run build:android
```
