# 🚀 Quick Deployment Reference Card

## 🔴 CRITICAL: Before Deployment

### Required Environment Variables on Render:
```bash
DATABASE_URL=mongodb+srv://VettiPechu:VettiPechu123@cluster0.hgx6tsx.mongodb.net/vettipechu?retryWrites=true&w=majority
JWT_SECRET=Secret@123
NODE_ENV=production
SEED_KEY=your-random-secret-key
```

---

## 📝 Deployment Sequence

### 1️⃣ Push Code
```bash
git add .
git commit -m "Production fixes"
git push origin main
```

### 2️⃣ Wait for Render Deploy
- Check Render dashboard for deployment status
- Wait 5-10 minutes

### 3️⃣ Verify Health
```bash
curl https://your-backend.onrender.com/health
```
Should show: `"status": "ok"` and `"needsSeeding": true`

### 4️⃣ Seed Database
```bash
curl -X POST https://your-backend.onrender.com/api/seed/admin \
  -H "x-seed-key: your-random-secret-key"
```

### 5️⃣ Test Login
```bash
curl -X POST https://your-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"mobile":"9688257055","password":"Karthick@123"}'
```
Should return a JWT token.

---

## 🎯 Quick Checks

| Check | Endpoint | Expected Result |
|-------|----------|-----------------|
| Server Running | `GET /` | "Backend running" |
| Health Check | `GET /health` | `status: "ok"` |
| DB Connected | `GET /health` | `database.connected: true` |
| Needs Seeding | `GET /api/seed/status` | `needsSeeding: true/false` |
| Login Works | `POST /api/auth/login` | Returns JWT token |

---

## 🐛 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| 503 Service Unavailable | Check DATABASE_URL is set |
| 401 on login | Run seeding (Step 4) |
| 404 on login | Check frontend VITE_API_URL |
| CORS error | Add frontend domain to CORS whitelist |
| Build fails | Check TypeScript errors: `npm run build` |

---

## 🔑 Default Login

- **Mobile**: `9688257055`
- **Password**: `Karthick@123`

---

## 📍 Important Endpoints

```
Base URL: https://your-backend.onrender.com

GET  /                      - Basic health
GET  /health                - Detailed health + DB status
GET  /api/seed/status       - Check seeding status
POST /api/seed/admin        - Seed admin user (requires x-seed-key header)
POST /api/auth/login        - Login
POST /api/auth/register     - Register
GET  /api/auth/profile      - Get profile (requires auth token)
```

---

## ✅ Success Indicators

- [ ] `/health` returns 200 OK
- [ ] `database.connected: true`
- [ ] `userCount: 1` (after seeding)
- [ ] Login returns JWT token
- [ ] No 404 errors
- [ ] No CORS errors

---

## 🔐 Post-Deployment Security

1. Change default password immediately
2. Remove or disable SEED_KEY after initial setup
3. Restrict CORS to specific frontend domain
4. Monitor Render logs for suspicious activity

---

**Full Guide**: See `PRODUCTION_DEPLOYMENT_FIX.md` for detailed instructions.
