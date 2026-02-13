# 🚀 Railway Deployment - Complete Guide From Scratch

## 📋 What You'll Deploy

**One Unified Service** that hosts:
- ✅ Backend API (Node.js + Express)
- ✅ Frontend Dashboard (React)
- ✅ MongoDB Atlas (already cloud-hosted)

---

## 🎯 Prerequisites (If Not Done Already)

### 1️⃣ **Create GitHub Account**
Go to https://github.com and sign up (free)

### 2️⃣ **Create Railway Account**
Go to https://railway.app and login with GitHub (free $5 credit)

### 3️⃣ **MongoDB Atlas Setup**
You already have this:
```
mongodb+srv://prathmeshwavhal83:prathmesh123@cluster0.pmuihdg.mongodb.net/iot_sensors_db
```

---

## 🔥 Step-by-Step Deployment (5 Minutes)

### **STEP 1: Push Code to GitHub** (If Not Already Done)

If your code is already on GitHub, **skip to STEP 2**.

```bash
# Open PowerShell in your project folder
cd "C:\Users\prath\Downloads\so2 v1"

# Initialize git (if not done)
git init
git add .
git commit -m "Initial commit for Railway deployment"

# Create new repository on GitHub:
# 1. Go to github.com → Click "+" → "New repository"
# 2. Name it: IoT-So2-Project
# 3. Click "Create repository"
# 4. Copy the commands GitHub shows you, or use:

git remote add origin https://github.com/YOUR-USERNAME/IoT-So2-Project.git
git branch -M main
git push -u origin main
```

✅ **Code is now on GitHub!**

---

### **STEP 2: Create Railway Project**

1. Go to **https://railway.app**
2. Click **"Login"** → Sign in with GitHub
3. Click **"New Project"**
4. Select **"Deploy from GitHub repo"**
5. Choose your repository: **IoT-So2-Project**
6. Railway will start deploying automatically

⏳ **Wait 2-3 minutes for initial build...**

---

### **STEP 3: Configure Environment Variables**

1. In Railway dashboard, click on your deployed service (should see a purple/blue card)
2. Go to **"Variables"** tab
3. Click **"+ New Variable"**
4. Add **ONLY THIS ONE** variable:

```
Variable Name:  MONGODB_URI
Variable Value: mongodb+srv://prathmeshwavhal83:prathmesh123@cluster0.pmuihdg.mongodb.net/iot_sensors_db?retryWrites=true&w=majority
```

5. Click **"Add"**

**IMPORTANT:** 
- ❌ DO NOT add `PORT` (Railway sets this automatically)
- ❌ DO NOT add any variables with empty names
- ✅ ONLY add `MONGODB_URI`

---

### **STEP 4: Generate Public URL**

1. Still in your service, go to **"Settings"** tab
2. Scroll down to **"Networking"** section
3. Click **"Generate Domain"**
4. Railway will create a URL like: `https://iot-so2-project-production-xxxx.up.railway.app`

✅ **Copy this URL!**

---

### **STEP 5: Wait for Deployment**

1. Go to **"Deployments"** tab
2. Watch the build logs (should see "Building..." → "Deploying..." → "Success")
3. Build takes **3-5 minutes**

You'll see logs like:
```
✓ Installing dependencies...
✓ Building frontend...
✓ Starting server...
✓ MongoDB connected
```

---

### **STEP 6: Test Your Application**

1. **Open your Railway URL** in browser
2. You should see the IoT Dashboard
3. Test the pages:
   - Dashboard
   - Monitoring
   - Alerts
   - Reports
   - Settings

---

## ✅ Deployment Complete!

**Your app is now live at:**
```
https://your-app-name.up.railway.app
```

**What's deployed:**
- 🌐 Frontend: React dashboard at `/`
- 📡 Backend API: Available at `/api/*`
- 🗄️ Database: MongoDB Atlas (managed separately)

---

## 📱 Update NodeMCU Hardware

Now update your NodeMCU to send data to production:

### **1. Open Arduino IDE**

### **2. Update WiFi and Server URL:**

```cpp
// In NodeMCU_Sensor_Code.ino

const char* ssid = "your-wifi-name";
const char* password = "your-wifi-password";

// Change this to your Railway URL:
const char* serverUrl = "https://your-app-name.up.railway.app/api/sensors/data";
```

### **3. Upload to NodeMCU**
- Connect NodeMCU via USB
- Select Board: "NodeMCU 1.0 (ESP-12E Module)"
- Select Port: Your COM port
- Click Upload ⬆️

✅ **Hardware now sending data to production!**

---

## 🔄 How to Update After Changes

### **Update Code:**

```bash
# Make your changes, then:
git add .
git commit -m "Your update message"
git push origin main
```

✅ **Railway auto-deploys in 2-3 minutes!**

### **Check Deployment Status:**
1. Go to Railway dashboard
2. Click "Deployments" tab
3. See real-time build logs

---

## 🐛 Troubleshooting

### **Deployment Failed?**

1. **Check Build Logs:**
   - Railway dashboard → "Deployments" → Click latest deployment
   - Look for red error messages

2. **Common Issues:**

   **Error: "Cannot find module"**
   ```bash
   # Fix: Ensure package.json has all dependencies
   npm install
   git add package.json package-lock.json
   git commit -m "Update dependencies"
   git push
   ```

   **Error: "MongoDB connection failed"**
   - Check Railway "Variables" tab
   - Ensure `MONGODB_URI` is set correctly
   - Should start with `mongodb+srv://`

   **Error: "Empty key-value pair"**
   - Go to Railway "Variables" tab
   - Delete any variables with empty names
   - Only keep `MONGODB_URI`

### **App Deployed But Not Loading?**

1. **Check Service Status:**
   - Railway dashboard → Should show green "Active"
   
2. **View Runtime Logs:**
   - Click "View Logs" button
   - Should see: `✅ MongoDB Atlas connected successfully!`

3. **Test API Directly:**
   ```
   https://your-app.up.railway.app/api/health
   ```
   Should return: `{"status":"ok","mongodb":"connected"}`

### **Can't See Sensor Data?**

- NodeMCU must send data first
- Check Serial Monitor in Arduino IDE (115200 baud)
- Should see: `HTTP Response code: 200`
- If not, verify WiFi connection and server URL

---

## 📊 Monitor Your App

### **View Logs:**
Railway Dashboard → Click service → "View Logs"

### **Check Resource Usage:**
Railway Dashboard → "Metrics" tab

### **Restart Service:**
Railway Dashboard → "Settings" → "Restart"

---

## 💰 Cost (Free Tier)

- **Railway:** $5 free credit/month
- **MongoDB Atlas:** Free tier (512MB)
- **Estimated usage:** ~$3-4/month (within free tier)

---

## 🎉 You're Done!

Your IoT Air Quality Monitoring System is now:
- ✅ Live on the internet
- ✅ Accepting sensor data from NodeMCU
- ✅ Storing data in MongoDB Atlas
- ✅ Serving real-time dashboard
- ✅ Auto-deploying on git push

---

## 📚 Next Steps

1. **Share your app:** Send Railway URL to others
2. **Set up alerts:** Configure email notifications in Settings page
3. **Monitor uptime:** Railway provides 99.9% uptime
4. **Scale if needed:** Railway can handle 100k+ requests/month on free tier

---

## 🆘 Need Help?

**Railway Issues:** https://docs.railway.app  
**GitHub Issues:** Create issue in your repo  
**MongoDB Issues:** https://www.mongodb.com/docs/atlas/

---

**🚀 Happy Deploying!**
