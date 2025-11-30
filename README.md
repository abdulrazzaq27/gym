# FitZone — Gym Management System

> Full-stack Gym Management web application for admins, staff and members.

---

## Table of Contents

* [Project Overview](#project-overview)
* [Key Features](#key-features)
* [Tech Stack](#tech-stack)
* [Architecture & Patterns](#architecture--patterns)
* [Getting Started](#getting-started)

  * [Prerequisites](#prerequisites)
  * [Environment Variables](#environment-variables)
  * [Local Setup (Backend)](#local-setup-backend)
  * [Local Setup (Frontend)](#local-setup-frontend)
* [API Reference (Important Endpoints)](#api-reference-important-endpoints)
* [Database & Seeding](#database--seeding)
* [Testing](#testing)
* [Deployment](#deployment)
* [Contribution Guidelines](#contribution-guidelines)
* [License](#license)
* [Contact](#contact)

---

## Project Overview

FitZone is a gym management system built to help gym owners and staff manage members, subscriptions, payments, attendance and analytics. It provides an admin dashboard with quick stats, revenue tracking, member lifecycle views and growth metrics.

The codebase is split into a **Frontend** (React) and a **Backend** (Node.js + Express). Data is persisted in MongoDB.

## Key Features

* Member management (create, update, delete, search)
* Membership plans and expiry tracking
* Payment and revenue reporting
* Dashboard stats (active members, new signups, churn)
* Notifications for expiring memberships
* Charts and visualizations for member growth and revenue
* Role-based access (admin / staff)

## Tech Stack

* **Frontend:** React (component-based, responsive UI)
* **Backend:** Node.js + Express
* **Database:** MongoDB (Mongoose ODM)
* **Auth:** JWT-based authentication
* **Styling:** Tailwind / CSS (adjust if different)
* **Dev tools:** nodemon, dotenv

## Architecture & Patterns

* MVC-like separation: routes → controllers → services → models
* **asyncHandler** pattern is used across controllers for async error handling.
* Centralized error handler middleware for consistent API error responses.
* Clear endpoints segmentation for statistics and reporting.

## Getting Started

### Prerequisites

* Node.js (v18+ recommended)
* npm or yarn
* MongoDB (local or Atlas)
* Git

### Environment Variables

Create a `.env` in the backend root with at least the following:

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=supersecretjwtkey
NODE_ENV=development
```

Add any third-party keys you use (email provider, payment gateway) as required.

### Local Setup (Backend)

1. `cd backend`
2. `npm install`
3. Add `.env` (see above)
4. `npm run dev` (or `nodemon server.js`)

The backend should start on `http://localhost:5000` (or the port in your `.env`).

### Local Setup (Frontend)

1. `cd frontend`
2. `npm install`
3. Create frontend `.env` if required (e.g. `REACT_APP_API_URL=http://localhost:5000/api`)
4. `npm start`

Open `http://localhost:3000` to view the app.

## API Reference (Important Endpoints)

> These are the major reporting/stat endpoints used by the dashboard. Adjust paths if your router prefixes differ.

### Auth & Members (examples)

* `POST /api/auth/login` — login with `{ email, password }` ➜ returns token
* `POST /api/members` — create member
* `GET /api/members` — list members (supports pagination & search)
* `GET /api/members/:id` — member details
* `PUT /api/members/:id` — update member
* `DELETE /api/members/:id` — delete member

### Dashboard & Reporting

* `GET /api/stats` — general dashboard statistics (active members, total revenue, new signups, etc.)

  * Example response: `{ activeMembers: 800, newSignups: 50, totalRevenue: 120000, burnRate: 15000 }`

* `GET /api/revenue` — revenue reporting for a date range or by month. Accepts query `?from=YYYY-MM-DD&to=YYYY-MM-DD` or `?period=monthly`.

  * Example response: `[{ month: '2025-10', revenue: 50000 }, ...]`

* `GET /api/recent-members` — lists recently joined members (supports `limit`)

  * Example response: `[{ id, name, joinedAt, plan }, ...]`

* `GET /api/expiring-members` — lists members with memberships expiring soon. Supports `days=30` query.

  * Example response: `[{ id, name, expiryDate, daysLeft }, ...]`

* `GET /api/member-growth` — returns growth metrics for charting (daily/weekly/monthly)

  * Example response: `[{ date: '2025-10-01', newMembers: 5, cumulative: 420 }, ...]`

### Notes on API design

* All routes use JSON responses and consistent HTTP status codes.
* Use `Authorization: Bearer <token>` header for protected routes.
* Controllers should follow the `asyncHandler` wrapper and delegate to service layer for business logic.

## Database & Seeding

* Models: `User`, `Member`, `Plan`, `Payment`, `Attendance`, `Notification`
* Add a `seed` script to populate demo data (admin user, sample plans, sample members).

Example seed command in `package.json`:

```json
"scripts": {
  "seed": "node seeder.js"
}
```

## Testing

* Use Jest or your preferred test runner for unit tests.
* Test strategy:

  * Unit test services and utilities
  * Integration tests for critical endpoints (auth, member creation, revenue calculations)

## Deployment

* Build frontend (`npm run build`) and serve via static hosting (Netlify, Vercel) or behind a CDN.
* Deploy backend to a Node host (Heroku, Render, DigitalOcean App Platform, or VPS) and connect to MongoDB Atlas.
* Ensure environment variables are set in your hosting provider and that CORS is configured for the frontend origin.

## Contribution Guidelines

* Use feature branches: `feat/<short-desc>` or `fix/<short-desc>`.
* Follow the `asyncHandler` pattern and centralized error handler for all new controllers.
* Keep controllers thin — move business logic to services.
* Write tests for any non-trivial logic and add short PR descriptions.

## Troubleshooting & Tips

* If revenue numbers look wrong, check timezone handling and date normalization when aggregating payments.
* For cash payments (rent, offline payments) add an offline payment record in `payments` with `method: 'cash'` so metrics include them.
* Use consistent date formats (ISO `YYYY-MM-DD` / ISO timestamps) across frontend and backend.

Abdul Razzaq

---

*README generated for your FitZone project. If you want a shorter README for GitHub, or a version with badges (build/test/coverage), I can create that next.*
