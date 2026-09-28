# HttpOnly Cookie vs JWT Authentication Test

A full-stack test project to validate httpOnly cookie-based session authentication, based on the security migration described in `admin-session-security-changelog.md`.

## Tech Stack

- **Frontend**: React 18 (Vite) + Redux Toolkit + Axios
- **Backend**: Node.js + Express
- **Database**: MySQL

## Quick Start

### 1. Database Setup

```bash
# Create database and tables
cd server
npm install
npm run setup-db
npm run seed
```

This creates the `cookie_auth_test` database with `users` and `admin_sessions` tables, and seeds a test user.

### 2. Start Backend

```bash
cd server
npm run dev
# Server runs on http://localhost:3001
```

### 3. Start Frontend

```bash
cd client
npm install
npm run dev
# Frontend runs on http://localhost:5173
```

### 4. Test

Open http://localhost:5173 and log in with:

```
Email: admin@example.com
Password: password123
```

## Switching Auth Modes

Change `VITE_COOKIE_AUTH` in `client/.env` and restart the frontend dev server:

```env
# Cookie mode (default — secure)
VITE_COOKIE_AUTH=true

# JWT mode (legacy — vulnerable to XSS)
VITE_COOKIE_AUTH=false
```

Also update `AUTH_MODE` in `server/.env` to match:

```env
# Cookie mode
AUTH_MODE=cookie

# JWT mode
AUTH_MODE=jwt
```

## How to Verify Cookie in Browser

### Step 1: Open DevTools

- **Mac**: `Cmd + Option + I`
- **Windows/Linux**: `F12` or `Ctrl + Shift + I`

### Step 2: Application Tab → Cookies

```
Storage
  └── Cookies
      └── http://localhost:5173
          └── admin_session   ← Your session cookie
```

### Step 3: Verify Cookie Properties

| Name | HttpOnly | SameSite | Path | Max-Age |
|------|----------|----------|------|---------|
| `admin_session` | ✅ checked | Strict | / | 28800 |

### Step 4: Verify JS Cannot Read It

Open Console tab and run:

```javascript
document.cookie
```

**Expected**: `admin_session` should NOT appear in the output.

### Step 5: Network Tab

Check any API request:

**Request Headers** (outgoing):
```
Cookie: admin_session=37c6a69242aa47d15b7dcd1b5148e7b5...
```

**Response Headers** (on login):
```
Set-Cookie: admin_session=37c6a69...; HttpOnly; SameSite=Strict; Path=/; Max-Age=28800
```

## API Testing with cURL

```bash
# Cookie mode login
curl -v -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}' \
  -c cookies.txt

# Use cookie for authenticated request
curl -b cookies.txt http://localhost:3001/api/auth/me

# Logout (clears cookie)
curl -v -X POST http://localhost:3001/api/auth/logout \
  -b cookies.txt -c cookies.txt

# JWT mode login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'

# Use JWT token
curl -H "X-Session-Token: <token>" http://localhost:3001/api/auth/me
```

## Security Comparison

| Attack Vector | JWT Mode | Cookie Mode |
|---------------|----------|-------------|
| XSS reads session | ✅ `localStorage.getItem()` | ❌ HttpOnly prevents JS access |
| XSS replays session | ✅ Can use from any origin | ❌ Cookie bound to SameSite + domain |
| CSRF | ✅ Custom header blocks form POST | ✅ SameSite=Strict blocks cross-site |
| Network sniffing | ⚠️ Token visible in headers | ✅ HTTPS-only cookie |
| Revocation | ❌ Wait for expiry (hours/days) | ✅ Server revokes immediately |

## Project Structure

```
JWT/
├── client/                     # React frontend (Vite)
│   ├── src/
│   │   ├── api/                # Axios client with conditional credentials
│   │   ├── components/         # ProtectedRoute, Layout
│   │   ├── pages/              # Login, Dashboard, Profile
│   │   ├── redux/slices/       # authSlice with createAsyncThunk
│   │   └── utils/              # Constants, localStorage helpers
│   └── .env                    # VITE_COOKIE_AUTH=true
├── server/                     # Express backend
│   ├── src/
│   │   ├── middleware/         # Auth (dual-mode), CORS
│   │   ├── models/             # User, Session (raw SQL)
│   │   ├── routes/             # Auth routes, Admin routes
│   │   └── utils/              # DB pool, crypto helpers
│   └── .env                    # AUTH_MODE=cookie
└── README.md
```
# cookiie
