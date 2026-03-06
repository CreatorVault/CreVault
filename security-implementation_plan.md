# Security Hardening Plan

Full security audit completed. Below are all vulnerabilities found and the exact fixes.

## Vulnerabilities Found

| # | Issue | Severity | Location |
|---|---|---|---|
| 1 | No HTTP security headers (Helmet missing) | 🔴 High | [app.ts](file:///c:/Users/mrsjh/OneDrive/Desktop/Less%20fuckingg%20goo/Backend/src/app.ts) |
| 2 | No rate limiting — auth endpoints brute-forceable | 🔴 High | [auth.routes.ts](file:///c:/Users/mrsjh/OneDrive/Desktop/Less%20fuckingg%20goo/Backend/src/routes/auth.routes.ts) |
| 3 | Console.logs leak user emails & socket IDs to server logs | 🟡 Medium | [auth.controller.ts](file:///c:/Users/mrsjh/OneDrive/Desktop/Less%20fuckingg%20goo/Backend/src/controllers/auth.controller.ts), [server.ts](file:///c:/Users/mrsjh/OneDrive/Desktop/Less%20fuckingg%20goo/Backend/src/server.ts) |
| 4 | No email format validation on register/login | 🟡 Medium | [auth.controller.ts](file:///c:/Users/mrsjh/OneDrive/Desktop/Less%20fuckingg%20goo/Backend/src/controllers/auth.controller.ts) |
| 5 | No input length limits (name/password/title) | 🟡 Medium | [auth.controller.ts](file:///c:/Users/mrsjh/OneDrive/Desktop/Less%20fuckingg%20goo/Backend/src/controllers/auth.controller.ts) |
| 6 | Socket.io CORS is `"*"` (open to any origin) | 🟡 Medium | [server.ts](file:///c:/Users/mrsjh/OneDrive/Desktop/Less%20fuckingg%20goo/Backend/src/server.ts) |
| 7 | JWT tokens last 7 days with no refresh mechanism | 🟡 Medium | [generateToken.ts](file:///c:/Users/mrsjh/OneDrive/Desktop/Less%20fuckingg%20goo/Backend/src/utils/generateToken.ts) |

---

## Proposed Changes

### Backend — Dependencies

Install two new packages:
- `helmet` — sets secure HTTP response headers (XSS protection, clickjacking, MIME sniffing, etc.)
- `express-rate-limit` — blocks brute-force attacks on login/register

---

### Backend — Core Files

#### [MODIFY] [app.ts](file:///c:/Users/mrsjh/OneDrive/Desktop/Less%20fuckingg%20goo/Backend/src/app.ts)
- Add `helmet()` middleware (before all routes)
- Add `express-rate-limit` as a strict limiter on `/api/auth` routes (10 requests / 15 min)

#### [MODIFY] [auth.controller.ts](file:///c:/Users/mrsjh/OneDrive/Desktop/Less%20fuckingg%20goo/Backend/src/controllers/auth.controller.ts)
- Remove all `console.log` statements that print `req.body`, emails, and registration details
- Add email format validation (regex check)
- Add input length limits: name ≤ 50 chars, password ≥ 8 chars, password ≤ 128 chars

#### [MODIFY] [server.ts](file:///c:/Users/mrsjh/OneDrive/Desktop/Less%20fuckingg%20goo/Backend/src/server.ts)
- Remove `console.log` for socket connect/disconnect (leaks socket IDs to server logs)
- Restrict Socket.io `origin` to env var `ALLOWED_ORIGIN` with fallback to `http://localhost:3000`

#### [MODIFY] [generateToken.ts](file:///c:/Users/mrsjh/OneDrive/Desktop/Less%20fuckingg%20goo/Backend/src/utils/generateToken.ts)
- Reduce JWT expiry from `7d` → `24h` for better security

---

## Verification Plan

### Automated — Manual curl tests (run in terminal after restarting backend)

**Rate limiting:**
```bash
# Run from Backend folder — should get 429 after 10 attempts
for i in {1..12}; do curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d '{"email":"x@x.com","password":"wrong"}'; done
```

**Helmet headers present:**
```bash
curl -I http://localhost:5000/api/auth/login
# Should see: X-Content-Type-Options, X-Frame-Options, etc.
```

**Input validation:**
```bash
# Short password — should get 400
curl -X POST http://localhost:5000/api/auth/register -H "Content-Type: application/json" -d '{"name":"Test","email":"test@test.com","password":"abc"}'

# Bad email format — should get 400
curl -X POST http://localhost:5000/api/auth/register -H "Content-Type: application/json" -d '{"name":"Test","email":"notanemail","password":"password123"}'
```

### Manual checks
- Open browser DevTools → Network tab → any API response → verify security headers are present (`X-Frame-Options`, `X-Content-Type-Options`)
- Check backend terminal — ensure no emails or socket IDs appear in logs during login/register
