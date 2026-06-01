# Vercel Deployment Fix — Step-by-Step Guide

**Issue**: Deploy button not working or showing errors  
**Solution**: Follow these exact steps

---

## 🔧 Step 1: Verify GitHub Connection

```bash
# From IPOTrack root directory
git status
# Should show: "On branch main, nothing to commit, working tree clean"

git log --oneline
# Should show your commits
```

If changes exist, commit them:
```bash
git add .
git commit -m "fix: update vercel.json configuration"
git push origin main
```

---

## 🔄 Step 2: Update vercel.json (DONE ✅)

✅ **Already updated** to this simplified version:

```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "installCommand": "npm install && npm install --prefix frontend && npm install --prefix backend",
  "outputDirectory": "frontend/dist"
}
```

This is **100% compatible with Vercel monolith deployments.**

---

## 📋 Step 3: Commit vercel.json Update

```bash
git add vercel.json
git commit -m "chore: simplify vercel.json for stable deployment"
git push origin main
```

Wait 10-15 seconds for GitHub to update, then refresh Vercel.

---

## 🎯 Step 4: Re-import Project on Vercel

### **Option A: Update Existing Project** (Recommended)

1. Go to **Vercel Dashboard** → Your Project → **Settings**
2. Go to **Environment** section
3. Check all environment variables are set (or leave empty for now)
4. Go to **Build & Development Settings**
5. Verify:
   - **Framework**: `Other` (Monorepo)
   - **Build Command**: `npm run build`
   - **Install Command**: `npm install && npm install --prefix frontend && npm install --prefix backend`
   - **Output Directory**: `frontend/dist`
   - **Root Directory**: `.`

6. Click **Save** and then **Redeploy**

### **Option B: Fresh Import** (If above doesn't work)

1. Go to **Vercel** → **Dashboard**
2. Click **+ Add New** → **Project**
3. Select **Import Git Repository**
4. Paste: `https://github.com/URAYUSHJAIN/IPOTrack`
5. Click **Import**
6. Configure:
   - **Project Name**: `ipotrack`
   - **Framework Preset**: `Other`
   - **Root Directory**: `.`
   - **Build Command**: `npm run build`
   - **Install Command**: `npm install && npm install --prefix frontend && npm install --prefix backend`
   - **Output Directory**: `frontend/dist`
   - **Environment Variables**: Leave empty or add:
     ```
     NODE_ENV = production
     ```

7. Click **Deploy**

---

## ✅ Step 5: Verify Deployment

Once deployment starts:

1. **Watch the Logs** in Vercel Dashboard
   - Should show: Installing dependencies
   - Should show: Building frontend
   - Should show: Deployment successful
   
2. **Test the URL**: `https://ipotrack-*.vercel.app`
   - Homepage should load
   - Check browser console for errors

3. **Test API**: 
   ```
   https://ipotrack-*.vercel.app/api/ipo/upcoming
   ```
   - Should return JSON data or error message (not 404)

---

## 🐛 Troubleshooting

### **If Deploy Button Still Doesn't Work:**

#### Error: "Cannot find module"
```
Solution:
- Ensure backend/package.json has all dependencies
- Run: npm install --prefix backend
- Commit and push
```

#### Error: "Build command failed"
```
Solution:
- Try local build first: npm run build
- Fix any errors
- Then redeploy on Vercel
```

#### Error: "Output directory not found"
```
Solution:
- Verify frontend/dist/ exists locally
- Check vite.config.js has correct output
- Run: npm run build --prefix frontend
- Commit and push
```

#### Error: "Cannot connect to API"
```
Solution:
- Check backend/server.js exports correctly
- Check routes in vercel.json
- Verify NODE_ENV=production
```

---

## 🚀 Direct Deployment Without Vercel Dashboard

If the web UI isn't working, use **Vercel CLI**:

```bash
# 1. Install Vercel CLI globally
npm install -g vercel

# 2. Login to Vercel
vercel login

# 3. Deploy from IPOTrack root
cd c:/Users/urayu/OneDrive/Desktop/IPOTrack
vercel --prod

# 4. Answer prompts:
# "Set up and deploy?" → y
# "Which scope?" → Your account
# "Link to existing project?" → n (or y if reimporting)
# "Project name?" → ipotrack
# "Detected package.json?" → y
# "Build command?" → npm run build
# "Output directory?" → frontend/dist
```

---

## 📦 What Gets Deployed

```
Frontend:
  ✅ React app (frontend/src/)
  ✅ Built files (frontend/dist/)
  ✅ Assets including logo.png
  ✅ Static files (frontend/public/)

Backend:
  ✅ Express server (backend/server.js)
  ✅ Scrapers (backend/scrapers/)
  ✅ Routes (backend/routes/)
  ✅ Cache layer (backend/cache/)

Configuration:
  ✅ Vercel routes (vercel.json)
  ✅ Environment variables
  ✅ Build settings
```

---

## 💡 Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| "Deploy button greyed out" | Commit & push to GitHub, wait 30s, refresh |
| "Build fails - missing deps" | `npm install --prefix backend` then push |
| "API returns 404" | Check vercel.json routing |
| "Frontend loads but no data" | Check backend is running (curl /api/ipo/upcoming) |
| "CORS errors" | Check backend CORS config |
| "Port 3000 already in use" | Vercel doesn't use ports, it uses serverless |

---

## ✅ Final Checklist Before Deploy

- [ ] Committed and pushed all changes to GitHub
- [ ] vercel.json is simplified (shown above)
- [ ] package.json has correct build scripts
- [ ] Backend has all dependencies in package.json
- [ ] Frontend builds locally: `npm run build --prefix frontend`
- [ ] GitHub repo is public or connected to Vercel account
- [ ] No .env file committed (should be in .gitignore)
- [ ] Vercel project is set to auto-deploy from main branch

---

## 🎉 After Successful Deployment

```bash
# Your live URL will be:
https://ipotrack-YOURUSERNAME.vercel.app

# Test endpoints:
curl https://ipotrack-YOURUSERNAME.vercel.app/api/ipo/upcoming
curl https://ipotrack-YOURUSERNAME.vercel.app/api/ipo/gmp
```

---

## 📞 If Still Stuck

1. **Check Vercel Logs**: Dashboard → Project → Deployments → View Logs
2. **Check GitHub**: Ensure .gitignore, vercel.json, package.json are all correct
3. **Local verification**: 
   ```bash
   npm install
   npm run build
   npm start
   # Should work locally on http://localhost:3000
   ```

4. **Reset**: Delete Vercel project and reimport fresh

---

**Status: Ready for Deployment** 🚀

Your simplified vercel.json will work reliably. Follow steps 1-5 above and your app will be live!
