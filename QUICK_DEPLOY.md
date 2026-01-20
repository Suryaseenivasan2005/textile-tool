# 🚀 Quick Deployment Reference

## Backend (Render)

### Configuration
```
Root Directory:    backend
Build Command:     npm install && npm run build
Start Command:     npm start
```

### Environment Variables
```
DATABASE_URL       mongodb+srv://user:pass@cluster.mongodb.net/dbname
JWT_SECRET         your-secret-key-min-32-characters
```

### Health Check
```
GET https://your-app.onrender.com/
Response: "Backend running"
```

---

## Frontend (Vercel)

### Configuration
```
Framework:         Vite
Root Directory:    frontend
Build Command:     npm run build
Output Directory:  dist
```

### Environment Variables
```
VITE_API_URL       https://your-backend.onrender.com/api
```

---

## Deployment Order

1. **Deploy Backend First** (Render)
   - Get backend URL after deployment

2. **Deploy Frontend Second** (Vercel)
   - Use backend URL in `VITE_API_URL`

---

## Local Testing

### Backend
```bash
cd backend
npm install
npm run build
npm start
```

### Frontend
```bash
cd frontend
npm install
npm run build
```

---

## Troubleshooting

**Backend won't start on Render?**
- Check environment variables are set
- Verify DATABASE_URL is correct
- Check Render logs for errors

**Frontend can't connect to backend?**
- Verify VITE_API_URL is set correctly
- Check backend is running
- Verify CORS is enabled on backend

**Build fails?**
- Check all dependencies are in package.json
- Verify Node version compatibility
- Check build logs for specific errors
