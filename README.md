# FRIENDS MOBILE - Full-Stack E-Commerce Platform

Pixel-perfect e-commerce application for **FRIENDS MOBILE** built with **React**, **Express.js**, dual **Light & Dark Themes** (matching original posters), and **mobile responsiveness**.

---

## Directory Structure

```text
FRIENDS MOBILE/
├── frontend/                     # React Front-End SPA
│   ├── index.html                # Standalone React Single Page Application
│   ├── package.json              # Front-end dependencies & scripts
│   ├── vite.config.js            # Vite configuration
│   ├── style.css                 # Legacy stylesheet
│   ├── app.js                    # Standalone interactive script
│   └── src/                      # React source code & components
│       ├── App.jsx               # Root App component
│       ├── main.jsx              # DOM Entry Point
│       ├── components/           # React Components (Header, Hero, etc.)
│       └── styles/               # Dual Theme CSS system (light & dark)
│
├── backend/                      # Node.js + Express REST API Server
│   ├── server.js                 # Express API server (Port 5000)
│   ├── package.json              # Express server dependencies
│   ├── data/                     # JSON Database stores (products, orders, etc.)
│   └── routes/                   # REST API route handlers
│
├── images/                       # Product & Banner assets
├── index.html                    # Root launcher redirecting to frontend/index.html
└── README.md                     # Full-stack documentation
```

---

## Quick Start Guide

### 1. Run Front-End
Open [frontend/index.html](file:///d:/FRIENDS%20MOBILE/frontend/index.html) directly in any web browser, or launch using Vite:
```bash
cd frontend
npm install
npm run dev
```

### 2. Run Backend API Server
Start the Express server on Port 5000:
```bash
cd backend
npm install
npm start
```
- Server Health: `http://localhost:5000/api/health`
- Products API: `http://localhost:5000/api/products`
