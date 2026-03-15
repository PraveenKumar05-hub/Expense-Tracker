# Expense Tracker

Expense Tracker is a full-stack personal finance application with a React frontend and an Express + MongoDB backend. It supports transaction creation, editing, deletion, filtering, monthly summaries, category breakdowns, and a responsive dashboard UI.

## Project Structure

```text
Expense Tracker/
  backend/   Express API, MongoDB models, routes, env config
  frontend/  React app, dashboard pages, charts, styling
```

## Features

- Create, edit, and delete income and expense transactions
- Server-side filtering by type, category, search term, and date range
- Monthly summary totals for income, expense, and balance
- Expense distribution chart by category
- Recent transaction feed
- Responsive UI for desktop and mobile
- Persistent light and dark theme toggle
- Backend request validation and consistent API error responses

## Tech Stack

- Frontend: React 18, React Router, Axios, Chart.js, Tailwind CSS utilities
- Backend: Node.js, Express 5, Mongoose, MongoDB

## Prerequisites

- Node.js 18+
- npm 9+
- MongoDB running locally or a reachable MongoDB connection string

## Environment Variables

### Backend

Create `backend/.env` from `backend/.env.example`.

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/expenseTracker
CLIENT_ORIGIN=http://localhost:3000
```

### Frontend

Create `frontend/.env` from `frontend/.env.example`.

```env
REACT_APP_API_URL=http://localhost:5000/api
```

## Installation

Install dependencies in each app:

```bash
cd backend
npm install

cd ../frontend
npm install
```

Or install both from the project root:

```bash
npm run install:all
```

`node_modules` folders are intentionally not committed to GitHub. They are generated locally by `npm install`.

## Running the Project

Use two terminals.

### One-command root startup

From the project root:

```bash
npm run dev
```

This automatically installs missing dependencies in `backend` and `frontend`, then starts both apps together.

### Start the backend

```bash
cd backend
npm start
```

For development with auto-reload:

```bash
cd backend
npm run dev
```

### Start the frontend

```bash
cd frontend
npm start
```

This project also supports:

```bash
cd frontend
npm run dev
```

The frontend runs on `http://localhost:3000` and the backend runs on `http://localhost:5000` by default.

## Optional Workspace Commands

From the project root, you can use:

```bash
npm run setup
npm run install:all
npm run dev
npm run start:frontend
npm run dev:frontend
npm run start:backend
npm run dev:backend
npm run build:frontend
npm run check:backend
```

`npm run dev` starts both backend and frontend together from the root.

## API Endpoints

Base URL: `http://localhost:5000/api`

- `GET /health` - API health check
- `GET /transactions` - list transactions with optional filters
- `GET /transactions/:id` - get one transaction
- `GET /transactions/summary` - get totals and monthly summaries
- `POST /transactions` - create a transaction
- `PUT /transactions/:id` - update a transaction
- `DELETE /transactions/:id` - delete a transaction

### Supported Query Parameters for `GET /transactions`

- `search`
- `type`
- `category`
- `startDate`
- `endDate`

## Validation and Checks

Validated during setup:

- Frontend production build completed successfully with `npm run build` inside `frontend`
- Backend syntax checks passed for `server.js`, `routes/transactions.js`, and `models/Transaction.js`

Note: your editor may still flag `@tailwind` directives in `frontend/src/index.css` as unknown at-rules. That is an editor/linting warning, not a build failure.

## Manual Test Plan

Run these checks after starting MongoDB, the backend, and the frontend.

### Backend checks

1. Open `http://localhost:5000/api/health` and confirm the API returns a success response.
2. Create a transaction from the UI and confirm it appears in the MongoDB collection.
3. Edit that transaction and confirm the updated values are returned by `GET /api/transactions/:id`.
4. Delete the transaction and confirm it disappears from the transaction list and database.

### Frontend checks

1. Open the dashboard and confirm the income, expense, and balance cards load without errors.
2. Add one income and one expense transaction and confirm the summary cards, recent transactions panel, and chart update.
3. Open the transactions page and verify search, type filter, category filter, and date range filter each narrow the list correctly.
4. Edit a transaction from the transactions page and confirm the form is prefilled and saves successfully.
5. Toggle dark mode and refresh the page to confirm the theme preference persists.

### Command checks

```bash
npm run check:backend
npm run build:frontend
```

Both commands should complete successfully from the project root.

## Common Mistakes

- Do not run `npm server.js` from the root. Use `npm run start:backend` from the root, or `npm start` inside `backend`.
- If you see `Cannot find module 'express'`, run `npm install` inside `backend`, or run `npm run install:all` from the root.
- `npm run dev` did not exist in `frontend` before. It now maps to the same development server as `npm start`.
- A project cannot run Node/React code without local dependencies present; the key is to keep `node_modules` local and ignored, not committed.
- Ensure MongoDB is running before starting the backend.
- Ensure `CLIENT_ORIGIN` matches the frontend URL if you change the frontend port.

## Future Improvements

- Add automated tests for backend routes and frontend flows
- Add authentication and multi-user support
- Add export/import support for transaction data
- Add pagination for large transaction histories