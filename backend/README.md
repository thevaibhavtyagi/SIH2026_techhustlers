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

- **Roles**: `admin`, `district_nodal`, `mp` — must stay in sync with
  `frontend/src/utils/constants.js`. There is no public role.
- **Every account** is provisioned by an existing admin via `POST /api/users`
  (RBAC-protected). There is no public signup endpoint — the only way to get an
  account is to already have an admin create one for you. The very first admin
  is bootstrapped by `npm run seed`.
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

## ml_engine gateway

`backend` is also the API gateway in front of the Python risk-intelligence
service in [`ml_engine/`](../ml_engine) (a FastAPI app over the MPLADS
project/expenditure data — see `ml_engine/api/main.py`). That service has
**no auth of its own**, so it must only ever be reached through here, never
exposed directly to the browser. Set `ML_ENGINE_URL` in `.env` (default
`http://localhost:8000`) and run it separately:

```bash
cd ml_engine
python -m venv .venv
./.venv/Scripts/pip install fastapi uvicorn pandas numpy pydantic   # or the full requirements.txt
./.venv/Scripts/python -m uvicorn api.main:app --port 8000
```

| Method | Path | Roles | Forwards to |
|---|---|---|---|
| GET | `/projects` | any | `GET /projects` — `?limit=&offset=&risk_level=&state=` |
| GET | `/projects/:workId` | any | `GET /projects/{work_id}` |
| GET | `/risk/summary` | admin, district_nodal, mp | `GET /risk/summary` |
| GET | `/risk/distribution` | admin, district_nodal, mp | `GET /risk/distribution` |
| GET | `/investigations` | admin, district_nodal, mp | `GET /investigations` — `?limit=&offset=&risk_level=&priority_category=&state=` |
| GET | `/investigations/:workId` | admin, district_nodal, mp | `GET /investigations/{work_id}` |
| GET | `/investigations/:workId/report` | admin, district_nodal, mp | `GET /investigations/{work_id}/report` |
| GET | `/analytics/overview` \| `/states` \| `/categories` \| `/constituencies` | any | same paths on `analytics` |

`work_id` values contain slashes (e.g. `WS/MP620/2024-2025/133166`), so the
`:workId` param is matched with `(.*)` rather than Express's default
single-segment matching. If `ml_engine` is down or unreachable, these routes
return `503` rather than crashing.

`risk`/`investigations` are gated to internal roles (this is fraud-investigation
tooling); `projects`/`analytics` are open to any authenticated role — adjust in
`src/routes/*.routes.js` if that's not the split you want.

## RBAC

`middleware/authenticate.js` verifies the JWT and loads the user; `middleware/authorize(...roles)`
gates a route to specific roles. Compose them per-route:

```js
router.get('/some-admin-only-thing', authenticate, authorize(ROLES.ADMIN), handler);
```
