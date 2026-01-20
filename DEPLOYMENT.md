# Textile Business Management System - Deployment Guide

This is a full-stack application with separate frontend and backend deployments.

## 📁 Project Structure

```
Tex-tool/
├── frontend/          # React + Vite + TypeScript
├── backend/           # Node.js + Express + TypeScript
└── README.md
```

## 🚀 Deployment Architecture

- **Frontend**: Deployed on **Vercel**
- **Backend**: Deployed on **Render**

---

## 🔧 Backend Deployment (Render)

### Prerequisites
- Render account
- MongoDB Atlas database (or other MongoDB instance)

### Steps

1. **Push code to GitHub** (if not already done)

2. **Create a new Web Service on Render**
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure the service:

3. **Build & Start Configuration**
   ```
   Root Directory: backend
   Build Command: npm install && npm run build
   Start Command: npm start
   ```

4. **Environment Variables** (Add in Render Dashboard)
   ```
   DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/database-name
   JWT_SECRET=your-super-secret-jwt-key-min-32-chars
   NODE_ENV=production
   ```
   
   ⚠️ **Note**: Do NOT set `PORT` - Render sets this automatically

5. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Copy your backend URL (e.g., `https://your-app.onrender.com`)

### Health Check
Once deployed, visit: `https://your-app.onrender.com/`
- Should return: `Backend running`

---

## 🎨 Frontend Deployment (Vercel)

### Prerequisites
- Vercel account
- Backend deployed and URL available

### Steps

1. **Create a new Project on Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New..." → "Project"
   - Import your GitHub repository

2. **Configure Build Settings**
   ```
   Framework Preset: Vite
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

3. **Environment Variables** (Add in Vercel Dashboard)
   ```
   VITE_API_URL=https://your-backend-url.onrender.com/api
   ```
   
   Replace `your-backend-url.onrender.com` with your actual Render backend URL

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live at `https://your-app.vercel.app`

---

## 🧪 Local Development

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your local MongoDB connection
npm run dev
```

Backend runs on: `http://localhost:3000`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: `http://localhost:5173`

The Vite dev server will proxy `/api` requests to `http://localhost:3000` automatically.

---

## ✅ Deployment Checklist

### Backend (Render)
- [ ] MongoDB database is accessible from Render
- [ ] Environment variables are set in Render dashboard
- [ ] Build completes successfully
- [ ] Health check endpoint returns "Backend running"
- [ ] API endpoints are accessible

### Frontend (Vercel)
- [ ] `VITE_API_URL` points to production backend
- [ ] Build completes without errors
- [ ] No console errors in production
- [ ] API calls work correctly

---

## 🔐 Environment Variables Reference

### Backend (.env)
| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | ✅ Yes | MongoDB connection string | `mongodb+srv://...` |
| `JWT_SECRET` | ✅ Yes | Secret key for JWT tokens (min 32 chars) | `your-secret-key` |
| `PORT` | ❌ No | Server port (auto-set by Render) | `3000` |
| `NODE_ENV` | ❌ No | Environment mode | `production` |

### Frontend (.env)
| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `VITE_API_URL` | ✅ Yes (prod) | Backend API base URL | `https://api.onrender.com/api` |

---

## 🐛 Troubleshooting

### Backend Issues

**Build fails on Render**
- Check that `package.json` has correct `build` script
- Verify all dependencies are in `dependencies`, not `devDependencies`

**Database connection fails**
- Verify `DATABASE_URL` is correct
- Check MongoDB Atlas allows connections from Render IPs (0.0.0.0/0)
- Ensure database user has proper permissions

**Server crashes on startup**
- Check Render logs for error messages
- Verify `JWT_SECRET` is set
- Ensure `start` script points to correct file

### Frontend Issues

**Build fails on Vercel**
- Check TypeScript errors: `npm run build` locally
- Verify all imports are correct
- Check that `vite.config.ts` is valid

**API calls fail in production**
- Verify `VITE_API_URL` is set correctly
- Check CORS is enabled on backend
- Verify backend is running and accessible

**Environment variable not working**
- Ensure variable starts with `VITE_`
- Rebuild and redeploy after adding variables
- Check Vercel deployment logs

---

## 📝 Notes

- Backend uses `process.env.PORT` (Render sets this automatically)
- Frontend uses Vite's `import.meta.env` for environment variables
- All environment variables must be prefixed with `VITE_` for frontend
- Backend and frontend are completely independent - no shared dependencies
- CORS is configured to allow all origins (adjust in production if needed)

---

## 🔄 Continuous Deployment

Both Vercel and Render support automatic deployments:

- **Vercel**: Auto-deploys on push to `main` branch
- **Render**: Auto-deploys on push to `main` branch

Configure branch settings in respective dashboards if needed.

---

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Render/Vercel deployment logs
3. Verify environment variables are set correctly
4. Ensure backend is accessible before deploying frontend
