# Smart Link Hub - Deployment Guide

## Quick Deploy to Vercel (Recommended - 5 minutes)

### Step 1: Prepare Your Repository
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/smart-link-hub.git
git push -u origin main
```

### Step 2: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Click "Deploy"
5. **Done!** Your app is live at `https://project-name.vercel.app`

### Step 3: Update Frontend
After deployment, update the API URL in your frontend files:

**Frontend/auth-script.js** (lines with `http://localhost:3000`):
```javascript
const API_BASE = "https://your-vercel-domain.vercel.app";
```

**Frontend/admin-script.js** (lines with `http://localhost:3000`):
```javascript
const API_BASE = "https://your-vercel-domain.vercel.app";
```

---

## Alternative: Deploy to Heroku (10 minutes)

### Step 1: Install Heroku CLI
Download from [heroku.com/download](https://www.heroku.com/download)

### Step 2: Create Heroku App
```bash
heroku login
heroku create your-app-name
git push heroku main
```

### Step 3: Open App
```bash
heroku open
```

---

## Mobile Testing (Important!)

After deployment, test on:
- ✅ Desktop browser (1920px)
- ✅ Tablet (768px - iPad)
- ✅ Mobile phone (375px - iPhone)

Use Chrome DevTools: F12 → Toggle Device Toolbar (Ctrl+Shift+M)

---

## Production Checklist

- [ ] Git repository created
- [ ] Deployed to Vercel or Heroku
- [ ] Frontend API URLs updated to production domain
- [ ] Tested on mobile devices
- [ ] All features working (auth, hubs, analytics, delete account)
- [ ] Charts displaying correctly
- [ ] Dark theme renders properly

---

## Environment Variables

Your production environment automatically uses:
- `NODE_ENV`: production
- `PORT`: 3000 (managed by Vercel)
- `API_BASE`: Your Vercel domain

No additional setup needed!

---

## Access Your App

After deployment:
- **Landing Page**: `https://your-domain.vercel.app/`
- **Admin Dashboard**: `https://your-domain.vercel.app/admin.html`
- **API Base**: `https://your-domain.vercel.app/api`

---

## Need Help?

- Server running: `npm run dev`
- Check logs: `vercel logs` (Vercel) or `heroku logs --tail` (Heroku)
- Database: Uses in-memory SQLite (resets on redeploy - see below)

### Database Persistence Note
Current setup uses in-memory SQLite. For production with persistent data, upgrade to:
- PostgreSQL (free tier at railway.app)
- MongoDB (free tier at mongodb.com)
- Better for production use

Contact me if you need database migration help!
