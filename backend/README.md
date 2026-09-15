# MPLADS DRISHTI — Backend

Node.js + Express API. Auth is custom (email/password + JWT), backed by Supabase
Postgres accessed via `@supabase/supabase-js` with the project's secret (service-role)
key — not Supabase's own Auth/GoTrue.

## Setup

1. `npm install`
2. Copy `.env.example` to `.env` and fill in real values (Supabase URL + secret key
   from Dashboard → Settings → API, plus generated JWT secrets).
3. Run [`database/auth_schema.sql`](../database/auth_schema.sql) once in the Supabase
   SQL Editor to create the `users`, `refresh_tokens`, and `password_reset_tokens` tables.
4. `npm run seed` — bootstraps the first admin account from `SEED_ADMIN_*` in `.env`
   (needed because every other way to create an admin/mp/district_nodal account
   requires an authenticated admin).
5. `npm run dev`

## Auth model

- **Roles**: `admin`, `district_nodal`, `mp`, `citizen` — must stay in sync with
  `frontend/src/utils/constants.js`.
- **Citizens** self-register via `POST /api/auth/register`. The role is always forced
  to `citizen` server-side, regardless of what the client sends.
- **admin / district_nodal / mp** accounts are provisioned by an existing admin via
  `POST /api/users` (RBAC-protected). There is no public signup for these roles.
- **Access tokens**: short-lived JWTs (15 min default), returned in the JSON response
  body, sent by the frontend as `Authorization: Bearer <token>`.
- **Refresh tokens**: long-lived (7 days default), opaque random strings. Only their
  SHA-256 hash is stored in `refresh_tokens`; the raw token is set as an `httpOnly`,
  `sameSite` cookie scoped to `/api/auth`. Every refresh rotates the token (old one
  revoked, new one issued) and detects reuse of an already-revoked token.
- **Account lockout**: 5 failed login attempts (per account) locks it for 15 minutes.
- **Rate limiting**: `/api/auth/*` endpoints are limited separately from the rest of
  the API to blunt brute-force/credential-stuffing attempts.
- **Password reset**: `forgot-password` issues a hashed, expiring token. No email
  provider is wired up yet — in non-production the raw token is returned in the API
  response (`devResetToken`) and logged to the console so the flow is testable
  end-to-end. Wire a real provider (e.g. Resend/SendGrid) before going to production.

## API

All responses are `{ success, message?, data?, details? }`. All routes are under `/api`.

### Public

| Method | Path | Body | Notes |
|---|---|---|---|
| GET | `/health` | — | Liveness check |
| POST | `/auth/register` | `name, email, password, phone?, state?, district?, constituency?` | Creates a **citizen** account |
| POST | `/auth/login` | `email, password, role` | Sets refresh cookie, returns `{ user, accessToken }` |
| POST | `/auth/refresh` | — (cookie) | Rotates refresh token, returns new `accessToken` |
| POST | `/auth/logout` | — (cookie) | Revokes the refresh token, clears the cookie |
| POST | `/auth/forgot-password` | `email` | Always responds the same way, whether or not the email exists |
| POST | `/auth/reset-password` | `token, password` | Also revokes all of that user's active sessions |

### Authenticated (`Authorization: Bearer <accessToken>`)

| Method | Path | Roles | Notes |
|---|---|---|---|
| GET | `/auth/me` | any | Current user profile |
| PATCH | `/auth/change-password` | any | `currentPassword, newPassword`; revokes all sessions |
| POST | `/users` | admin | Provision an `admin`/`district_nodal`/`mp` account |
| GET | `/users` | admin | List users — `?role=&isActive=&search=&page=&pageSize=` |
| GET | `/users/:id` | admin | Get one user |
| PATCH | `/users/:id` | admin | Update profile fields or `isActive` (deactivating kills their sessions) |

## RBAC

`middleware/authenticate.js` verifies the JWT and loads the user; `middleware/authorize(...roles)`
gates a route to specific roles. Compose them per-route:

```js
router.get('/some-admin-only-thing', authenticate, authorize(ROLES.ADMIN), handler);
```
