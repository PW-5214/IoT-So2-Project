# 🚂 Railway Deployment Guide

## 📋 Pre-Deployment Checklist

- [ ] GitHub account created
- [ ] Project pushed to GitHub repository
- [ ] Railway account created (https://railway.app)
- [ ] MongoDB Atlas connection string ready
- [ ] Python requirements.txt in root folder

---

## 🚀 Step-by-Step Deployment Instructions

### **Step 1: Prepare Your GitHub Repository**

1. **Initialize Git (if not already done)**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - IoT Air Quality Monitor"
   ```

2. **Create GitHub Repository**:
   - Go to https://github.com/new
   - Repository name: `iot-air-quality-monitor` (or your preferred name)
   - Make it **Public** or **Private**
   - Do NOT initialize with README (you already have files)
   - Click "Create repository"

3. **Push to GitHub**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/iot-air-quality-monitor.git
   git branch -M main
   git push -u origin main
   ```

---

### **Step 2: Create Railway Account & Connect GitHub**

1. Go to **https://railway.app**
2. Click **"Start a New Project"** or **"Login with GitHub"**
3. Authorize Railway to access your GitHub repositories
4. You'll get **$5 free credit** per month

---

### **Step 3: Deploy Backend Service**

1. **Create New Project**:
   - Click **"New Project"**
   - Select **"Deploy from GitHub repo"**
   - Choose your `iot-air-quality-monitor` repository

2. **Configure Backend**:
   - Railway will auto-detect Node.js
   - Click on the deployed service
   - Go to **"Settings"** tab

3. **Set Root Directory** (Important!):
   - In Settings → **"Root Directory"**: Leave empty (we're deploying from root)
   - **"Start Command"**: `node backend-server.js`

4. **Add Environment Variables**:
   - Go to **"Variables"** tab
   - Click **"+ New Variable"** for each:
   
   ```
   MONGODB_URI=mongodb+srv://prathmeshwavhal83:prathmesh123@cluster0.pmuihdg.mongodb.net/iot_sensors_db?retryWrites=true&w=majority
   PORT=3001
   HOST=0.0.0.0
   NODE_ENV=production
   ```

5. **Generate Domain**:
   - Go to **"Settings"** → **"Networking"**
   - Click **"Generate Domain"**
   - Copy the URL (e.g., `your-backend.up.railway.app`)
   - ✅ Your backend is now live! 🎉

---

### **Step 4: Deploy Frontend Service**

1. **Add Another Service**:
   - In the same Railway project, click **"+ New"**
   - Select **"GitHub Repo"** → Same repository

2. **Configure Frontend Build**:
   - Go to **"Settings"** tab
   - **"Start Command"**: Leave empty (Railway auto-detects)
   - **"Build Command"**: `npm run build`
   - **"Custom Start Command"**: `npx vite preview --host 0.0.0.0 --port $PORT`

3. **Set Frontend Environment**:
   - Go to **"Variables"** tab
   - Add:
   ```
   VITE_API_URL=https://your-backend.up.railway.app
   NODE_ENV=production
   ```

4. **Generate Domain**:
   - Go to **"Settings"** → **"Networking"**
   - Click **"Generate Domain"**
   - Copy the URL (e.g., `your-frontend.up.railway.app`)
   - ✅ Your frontend is now live! 🎉

---

### **Step 5: Update CORS in Backend**

1. **Update Backend CORS Settings**:
   - Go back to **Backend service** on Railway
   - Add a new variable:
   ```
   FRONTEND_URL=https://your-frontend.up.railway.app
   ```

2. **Redeploy** (Railway will auto-redeploy)

---

### **Step 6: Update NodeMCU Configuration**

1. **Open Arduino IDE**
2. **Update these lines** in `NodeMCU_Sensor_Code.ino`:
   ```cpp
   const char* serverUrl = "https://your-backend.up.railway.app/api/sensors/data";
   const char* settingsUrl = "https://your-backend.up.railway.app/api/devices";
   ```

3. **Upload to NodeMCU**
4. ✅ Your hardware is now sending data to Railway! 🎉

---

## 🎯 Testing Your Deployment

### Test Backend:
Visit: `https://your-backend.up.railway.app/api/health`

Expected response:
```json
{
  "status": "healthy",
  "database": "connected",
  "uptime": 123.45,
  "timestamp": "2026-02-13T...",
  "totalReadings": 0
}
```

### Test Frontend:
Visit: `https://your-frontend.up.railway.app`

You should see your dashboard!

---

## 🔧 Common Issues & Solutions

### **Issue 1: Build Failed**
**Solution**: Check logs in Railway dashboard
- Ensure all dependencies are in `package.json`
- Check Node.js version compatibility

### **Issue 2: Backend can't connect to MongoDB**
**Solution**: 
- Verify `MONGODB_URI` is correct
- Ensure MongoDB Atlas allows connections from anywhere (0.0.0.0/0)
- Check MongoDB Atlas user has read/write permissions

### **Issue 3: CORS Errors**
**Solution**:
- Add `FRONTEND_URL` variable to backend
- Update frontend API URL to backend domain
- Redeploy both services

### **Issue 4: Python LSTM Not Working**
**Solution**:
- Ensure `requirements.txt` is in root
- Railway should auto-install Python dependencies
- Check logs for any Python errors

### **Issue 5: NodeMCU Can't Connect**
**Solution**:
- Ensure using HTTPS URL (Railway provides this)
- Some ESP8266 boards have issues with modern SSL
- May need to update ESP8266 core library

---

## 💰 Cost Management

### Railway Pricing:
- **$5 free credit per month**
- **~$0.000231 per second** of usage
- Typical usage: $5-10/month for both services
- View usage: Railway Dashboard → Project → Usage

### Cost Optimization:
1. Use single service for both frontend/backend (more complex)
2. Set up auto-sleep for low traffic
3. Optimize build times (faster builds = lower cost)

---

## 📊 Monitoring & Logs

### View Logs:
1. Go to Railway Dashboard
2. Click on service (Backend or Frontend)
3. Click **"Deployments"** tab
4. Click on latest deployment
5. View real-time logs

### Set Up Alerts:
1. Go to **"Settings"** → **"Notifications"**
2. Enable deployment notifications
3. Get notified of failures via email

---

## 🔄 Continuous Deployment

Railway automatically redeploys when you push to GitHub!

```bash
# Make changes to your code
git add .
git commit -m "Updated feature X"
git push origin main

# Railway automatically:
# 1. Detects push
# 2. Builds new version
# 3. Deploys if build succeeds
# 4. Notifies you via email
```

---

## 🌐 Custom Domain (Optional)

1. Buy domain from Namecheap, Google Domains, etc.
2. In Railway → Service → **"Settings"** → **"Networking"**
3. Click **"Custom Domain"**
4. Add your domain: `iot.yourdomain.com`
5. Update DNS records as instructed
6. Wait for SSL certificate (automatic, 5-10 min)

---

## 🎓 Next Steps

✅ **Deployed**: Your app is live!
✅ **Configured**: NodeMCU sending data
✅ **Monitored**: Check logs regularly

### Enhancements:
- [ ] Add authentication (user login)
- [ ] Set up automated backups
- [ ] Add email alerts for critical thresholds
- [ ] Optimize frontend performance
- [ ] Add more visualizations

---

## 📞 Support

- **Railway Docs**: https://docs.railway.app
- **Railway Discord**: https://discord.gg/railway
- **GitHub Issues**: Use your repo for tracking bugs

---

## ✨ Congratulations! 🎉

Your IoT Air Quality Monitoring System is now live on Railway!

**Backend**: `https://your-backend.up.railway.app`
**Frontend**: `https://your-frontend.up.railway.app`

Share it with others and keep building! 🚀
