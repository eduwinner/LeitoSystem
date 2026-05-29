# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Backend
```bash
cd backend
npm run dev       # dev server with nodemon (port 3001)
npm start         # production
npm run seed      # create admin test user
```

### Frontend
```bash
cd frontend
npm run dev       # Vite dev server (port 5173)
npm run build     # production bundle
npm run lint      # ESLint
npm run preview   # preview production build
```

### Environment Setup
Backend requires a `.env` file in `backend/`:
```
DB_NAME=leitosystem
DB_USER=postgres
DB_HOST=localhost
DB_PORT=5432
DB_PASSWORD=your_password
JWT_SECRET=your_secret
PORT=3001
```

Sequelize auto-syncs tables on startup. Run `npm run seed` once to create the admin user (`admin@leitosystem.com` / `123456`).

## Architecture

Two-tier app: React SPA + Express REST API + PostgreSQL.

```
LeitoSystem/
├── backend/src/
│   ├── app.js              # Express entry, mounts routes, syncs DB
│   ├── config/database.js  # Sequelize + PostgreSQL connection
│   ├── models/             # User, Bed, Patient (Sequelize models)
│   ├── routes/             # auth.js, beds.js, patients.js
│   ├── controllers/        # Business logic per resource
│   ├── middlewares/        # authMiddleware (JWT), adminMiddleware (perfil check)
│   └── seed.js             # Seeds admin user
└── frontend/src/
    ├── App.jsx             # BrowserRouter + 4 routes + ToastContainer
    ├── main.jsx            # React entry
    ├── services/api.js     # Axios instance (baseURL=localhost:3001, auto-injects JWT)
    └── pages/              # Login, Dashboard, Beds, Patients
```

### Auth Flow
JWT stored in `localStorage`. `api.js` request interceptor auto-adds `Authorization: Bearer <token>` to every request. Backend `authMiddleware` validates token; `adminMiddleware` checks `user.perfil === 'admin'`.

### API Routes
| Method | Path | Auth |
|--------|------|------|
| POST | `/auth/login` | none |
| GET | `/auth/perfil` | auth |
| GET | `/beds/dashboard` | auth |
| GET/POST | `/beds` | auth (POST: admin) |
| PUT/DELETE | `/beds/:id` | admin |
| PUT | `/beds/:id/ocupar` | auth |
| PUT | `/beds/:id/liberar` | auth |
| GET/POST | `/patients` | open |
| PUT/DELETE | `/patients/:id` | open |

### Data Model
- **Bed** has optional FK `patientId → patients.id` (belongsTo). Status enum: `disponivel`, `ocupado`, `manutencao`.
- **Patient** CPF must be unique.
- **User** perfil field controls admin access.

### Frontend Patterns
- No TypeScript — plain JSX.
- Styling via inline CSS objects (no CSS framework).
- Toast notifications via `react-toastify` — call `toast.success/error()` from pages.
- No global state manager — local `useState` + prop drilling.
