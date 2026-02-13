# 🚀 Railway Deployment - Complete Guide From Scratch

## ✅ Prerequisites Complete

Your code is already on GitHub: `https://github.com/PW-5214/IoT-So2-Project.git`

---

## 🎯 Step 1: Create Railway Account (30 seconds)

1. Go to **https://railway.app**
2. Click **"Login with GitHub"**
3. Authorize Railway to access your GitHub
4. ✅ You get **$5 free credit** automatically

---

## 🎯 Step 2: Create New Project (1 minute)

1. On Railway dashboard, click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Find and click: **IoT-So2-Project**
4. Railway will automatically start deploying

⏳ **Wait 3-4 minutes** - Railway is:
   - Installing npm packages
   - Building React frontend
   - Starting Node.js server

---

## 🎯 Step 3: Add Environment Variables (2 minutes)

1. Click on your deployed service (the purple/blue card)
2. Go to **"Variables"** tab
3. Click **"+ New Variable"**
4. Add this **ONE** variable:

```
Name:  MONGODB_URI
Value: mongodb+srv://prathmeshwavhal83:prathmesh123@cluster0.pmuihdg.mongodb.net/iot_sensors_db?retryWrites=true&w=majority
```

5. Click **"Add"**

⚠️ **IMPORTANT:** Only add `MONGODB_URI` - Railway sets PORT automatically!

6. The service will **auto-redeploy** (takes 2-3 minutes)

---

## 🎯 Step 4: Generate Public URL (30 seconds)

1. Still in your service, go to **"Settings"** tab
2. Scroll down to **"Networking"** section
3. Click **"Generate Domain"**
4. Railway creates a URL like: `https://iot-so2-project-production-xxxx.up.railway.app`

✅ **Copy this URL!**

---

## 🎯 Step 5: Configure MongoDB Atlas (2 minutes)

⚠️ **CRITICAL STEP** - Your app won't work without this!

### Allow Railway to Access MongoDB:

1. Go to **https://cloud.mongodb.com**
2. Login to your account
3. Click **"Network Access"** (left sidebar under SECURITY)
4. Click **"+ ADD IP ADDRESS"**
5. Click **"ALLOW ACCESS FROM ANYWHERE"**
6. It will auto-fill: `0.0.0.0/0`
7. Click **"Confirm"**

⏳ **Wait 2-3 minutes** for MongoDB to apply changes

### Why This is Needed:
Railway's servers use dynamic IPs. Allowing `0.0.0.0/0` means any IP can try to connect, but they still need your username/password (which are in the MONGODB_URI).

---

## 🎯 Step 6: Check Deployment Logs (1 minute)

1. Back in Railway, click your service
2. Go to **"Deployments"** tab
3. Click the latest deployment (should show "Active")
4. Click **"View Logs"**

### ✅ **Success Logs Look Like:**
```
✅ MongoDB Atlas connected successfully!
🚀 Sensor Backend Server Started!
📡 Server listening on port: 8080
✅ Server is READY and LISTENING
```

### ❌ **Error Logs to Watch For:**

**MongoDB Error:**
```
❌ MongoDB connection error
```
→ Go back to Step 5, wait 2 more minutes for IP whitelist

**Build Error:**
```
npm ERR! or ERROR: failed to build
```
→ Check GitHub code pushed correctly

---

## 🎯 Step 7: Test Your Application (30 seconds)

1. Open your Railway URL in browser: `https://your-app.up.railway.app`
2. You should see the **IoT Dashboard** loading
3. Test these URLs:

**Frontend:**
```
https://your-app.up.railway.app/
```

**Health Check:**
```
https://your-app.up.railway.app/api/health
```
Should return JSON with database status

**Simple Health:**
```
https://your-app.up.railway.app/healthz
```
Should return "OK"

---

## ✅ **Deployment Complete!**

Your app is now live at: `https://your-app-name.up.railway.app`

**What's Running:**
- 🌐 React Frontend (Dashboard UI)
- 📡 Node.js Backend (API Server)
- 🗄️ MongoDB Atlas (Database)
- 🔄 Auto-deploys on git push

---

## 📱 Step 8: Update NodeMCU Hardware (Optional)

To send real sensor data to production:

### 1. Open Arduino IDE

### 2. Update NodeMCU Code:

```cpp
// In NodeMCU_Sensor_Code.ino

const char* ssid = "your-wifi-name";
const char* password = "your-wifi-password";

// Change this to your Railway URL:
const char* serverUrl = "https://your-app-name.up.railway.app/api/sensors/data";
```

### 3. Upload to NodeMCU:
- Connect NodeMCU via USB
- Select Board: "NodeMCU 1.0 (ESP-12E Module)"
- Select Port: Your COM port
- Click Upload ⬆️

✅ **Hardware now sends real-time data to production!**

---

## 🔄 How to Update Your App After Changes

### Make Changes Locally:
```bash
# Edit your code, then:
git add .
git commit -m "Your update message"
git push origin main
```

✅ **Railway auto-deploys in 2-3 minutes!**

### Check Deployment:
1. Railway Dashboard → "Deployments" tab
2. Watch build progress
3. Check logs for errors

---

## 🐛 Troubleshooting

### ❌ Problem: 502 Bad Gateway

**Solution 1: Check Logs**
- Railway Dashboard → Deployments → View Logs
- Look for errors

**Solution 2: Redeploy**
- Settings → Click "Redeploy"

**Solution 3: Verify MongoDB**
- MongoDB Atlas → Network Access
- Should show `0.0.0.0/0` in IP Allowlist

---

### ❌ Problem: Database Connection Failed

**Check these:**
1. **MongoDB Atlas IP Whitelist**
   - Must have `0.0.0.0/0` allowed
   - Wait 2-3 minutes after adding

2. **MONGODB_URI Variable**
   - Railway → Variables tab
   - Should be set correctly
   - No extra spaces

3. **MongoDB Atlas Account**
   - Cluster is running (not paused)
   - Username/password are correct

---

### ❌ Problem: Page Shows "Cannot GET /"

**This means:**
- Backend is running ✅
- Frontend build failed ❌

**Solution:**
1. Check Railway build logs
2. Look for `npm run build` errors
3. Verify `dist/` folder was created

---

### ❌ Problem: API Returns 404

**Check:**
1. URL is correct: `/api/sensors/current` (not `/sensors/current`)
2. Backend is running (check logs for "Server Started")
3. Try health endpoint first: `/api/health`

---

## 📊 Monitor Your App

### View Real-Time Logs:
- Railway Dashboard → Click Service → "View Logs"
- See all requests and responses

### Check Resource Usage:
- Railway Dashboard → "Metrics" tab
- CPU, Memory, Network usage

### Restart Service:
- Settings → "Restart"

---

## 💰 Cost & Limits

**Railway Free Tier:**
- $5 free credit per month
- Resets monthly
- ~550 hours of runtime
- Unlimited deployments

**Your App Usage:**
- Estimated: $3-4/month
- Well within free tier ✅

**If You Run Out:**
- Add payment method for $5/month
- Or deploy elsewhere (Render, Vercel, etc.)

---

## 🎉 You're Done!

Your IoT Air Quality Monitoring System is:
- ✅ Live on the internet
- ✅ Accepting sensor data from NodeMCU
- ✅ Storing data in MongoDB Atlas
- ✅ Serving real-time dashboard
- ✅ Auto-deploying on git push

---

## 🆘 Still Having Issues?

1. **Check Railway Status**: https://status.railway.app
2. **Railway Docs**: https://docs.railway.app
3. **Railway Discord**: https://discord.gg/railway
4. **Check this guide again** - follow each step carefully

---

## 🔗 Quick Links

- **Railway Dashboard**: https://railway.app/dashboard
- **MongoDB Atlas**: https://cloud.mongodb.com
- **GitHub Repo**: https://github.com/PW-5214/IoT-So2-Project
- **Your Live App**: `https://your-app-name.up.railway.app`

---

**🚀 Happy Deploying!**
