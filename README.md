# HRS-PROJECT

Simple Health Records System (frontend + backend demo).

## Run (backend)

1. Open PowerShell and go to the backend folder:

```pwsh
cd 'c:\Users\MOHAN\Downloads\HRS - PROJECT\backend'
npm install
npm start
```

- Backend runs on port `3000` by default. It attempts to connect to a MySQL database (`health_records_db`) but uses in-memory demo data if the DB is not available.

## Run (frontend)

Option A — open `frontend/index.html` directly in a browser.

Option B — serve with a static server (recommended for CORS/API testing):

```pwsh
cd 'c:\Users\MOHAN\Downloads\HRS - PROJECT\frontend'
npx http-server -p 8080
# then open http://localhost:8080/index.html
```

## MySQL

If you want the backend to use MySQL:

- Install and run MySQL locally.
- Create database: `CREATE DATABASE health_records_db;`
- Update connection settings in `backend/server.js` (host, user, password) as needed.

## Cleanup

This repository had `node_modules` committed. A `.gitignore` was added and `backend/node_modules` has been removed from version control — keep `node_modules` out of commits to keep the repo small.

## Contact

If you want, I can add a GitHub Actions workflow or further docs. Say "clean repo" to proceed with additional cleanup or automation.
