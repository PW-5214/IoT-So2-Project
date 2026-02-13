# 🚀 Quick Start: Railway Deployment

## ⚡ Super Quick Guide (5 Minutes)

### **Before You Start:**
1. ✅ Create GitHub account (if you don't have one)
2. ✅ Push your code to GitHub
3. ✅ Create Railway account at https://railway.app

---

## **Step 1: Push to GitHub (2 min)**

```bash
# In your project folder (C:\Users\prath\Downloads\so2 v1)
git init
git add .
git commit -m "Ready for Railway deployment"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

---

## **Step 2: Deploy Backend on Railway (2 min)**

1. Go to **https://railway.app** → Login with GitHub
2. Click **"New Project"** → **"Deploy from GitHub"**
3. Select your repository
4. Click on the service → **"Variables"** tab
5. Add these variables:
   ```
   MONGODB_URI = mongodb+srv://prathmeshwavhal83:prathmesh123@cluster0.pmuihdg.mongodb.net/iot_sensors_db?retryWrites=true&w=majority
   PORT = 3001
   HOST = 0.0.0.0
   NODE_ENV = production
   ```
6. Go to **"Settings"** → **"Deploy"** tab:
   - **Start Command**: `node backend-server.js`
7. Go to **"Settings"** → **"Networking"** → **"Generate Domain"**
8. ✅ **Copy your backend URL!** (e.g., `https://abc123.up.railway.app`)

---

## **Step 3: Deploy Frontend on Railway (1 min)**

1. Same Railway project → Click **"+ New"** → **"GitHub Repo"** (same repo)
2. Click on the new service → **"Variables"** tab:
   ```
   VITE_API_URL = https://your-backend-url.up.railway.app
   NODE_ENV = production
   ```
3. **"Settings"** → **"Deploy"**:
   - **Build Command**: `npm run build`
   - **Start Command**: `npm run preview`
4. **"Settings"** → **"Networking"** → **"Generate Domain"**
5. ✅ **Copy your frontend URL!**

---

## **Done! 🎉**

Visit your frontend URL and see your app live!

For detailed instructions, see [RAILWAY_DEPLOYMENT.md](RAILWAY_DEPLOYMENT.md)

---

## 💡 Quick Fixes

**Can't see data?** 
- Wait 2-3 minutes for deployment
- Check backend logs in Railway

**CORS error?**
- Add `FRONTEND_URL` variable to backend with your frontend Railway URL
- Redeploy backend

**Need to update?**
```bash
git add .
git commit -m "Update"
git push
# Railway auto-deploys!
```

---

## 📱 Update NodeMCU After Deployment

In your Arduino code, change:
```cpp
const char* serverUrl = "https://your-backend.up.railway.app/api/sensors/data";
```

Upload to NodeMCU, and you're done! 🚀
