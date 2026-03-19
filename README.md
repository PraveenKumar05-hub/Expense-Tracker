# Expense Tracker

A clean local full-stack expense tracker built with React (frontend), Express (backend), and MongoDB.

## Stack

- Frontend: React 18, React Router, Axios, Chart.js
- Backend: Node.js, Express 5, Mongoose
- Database: MongoDB

## Project Structure

```text
Expense Tracker/
  backend/   Express API + MongoDB models/routes
  frontend/  React app (dashboard, transactions, charts)
```

## Prerequisites

- Node.js 18+
- npm 9+
- MongoDB running locally

## Environment Setup

### 1. Backend

Create backend/.env from backend/.env.example:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/expenseTracker
CLIENT_ORIGIN=http://localhost:3000
```

### 2. Frontend

Create frontend/.env from frontend/.env.example:

```env
REACT_APP_API_URL=/api
```

If REACT_APP_API_URL is not set, the frontend still works in local dev through CRA proxy to http://localhost:5000.

## Install

From project root:

```bash
npm run install:all
```

Or install each side manually:

```bash
cd backend
npm install

cd ../frontend
npm install
```

## Run Locally

Use two terminals, or run the root dev script.

### Option A: One command from root

```bash
npm run dev
```

### Option B: Run separately

Terminal 1:

```bash
cd backend
npm run dev
```

Terminal 2:

```bash
cd frontend
npm start
```

## Local URLs

- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- Health check: http://localhost:5000/api/health

## API Endpoints

Base URL: http://localhost:5000/api

- GET /health
- GET /transactions
- GET /transactions/:id
- GET /transactions/summary
- POST /transactions
- PUT /transactions/:id
- DELETE /transactions/:id

Supported query params for GET /transactions:

- search
- type
- category
- startDate
- endDate

## Features

- Add, edit, and delete transactions
- Income/expense filters and search
- Date-range filtering
- Dashboard summary cards
- Monthly summary blocks
- Expense category chart
- Recent transactions list
- Responsive UI and theme toggle

## Helpful Root Scripts

- npm run setup
- npm run install:all
- npm run dev
- npm run start:backend
- npm run dev:backend
- npm run start:frontend
- npm run dev:frontend
- npm run build:frontend
- npm run check:backend

## Common Fixes

- Cannot find module express:
  - run npm install in backend or npm run install:all in root.
- react-scripts not recognized:
  - run npm install in frontend or npm run install:all in root.
- MongoDB connection failed:
  - make sure MongoDB is running and MONGODB_URI is correct in backend/.env.
