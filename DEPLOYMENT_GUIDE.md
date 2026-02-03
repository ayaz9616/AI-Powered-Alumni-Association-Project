# Alumni Hacktopia - Deployment Guide

## 🚀 Deployment Architecture

- **Frontend**: Vercel (React + Vite)
- **Backend**: Render (Node.js + Express)
- **Database**: MongoDB Atlas (or Render PostgreSQL)

---

## 📦 Backend Deployment (Render)

### Step 1: Prepare MongoDB
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get your connection string (e.g., `mongodb+srv://user:password@cluster.mongodb.net/alumni`)

### Step 2: Deploy to Render
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **New +** → **Web Service**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `alumni-backend` (or your choice)
   - **Region**: Oregon (or closest to you)
   - **Branch**: `main`
   - **Root Directory**: Leave empty
   - **Build Command**: `cd backend-node && npm install && npm run build`
   - **Start Command**: `cd backend-node && npm start`
   - **Plan**: Free

### Step 3: Set Environment Variables
Add these in Render dashboard under **Environment**:

```
NODE_ENV=production
PORT=8000
MONGODB_URI=your-mongodb-atlas-connection-string
JWT_SECRET=generate-a-long-random-secret-key
GROQ_API_KEY=your-groq-api-key
OPENAI_API_KEY=your-openai-api-key-optional
ANTHROPIC_API_KEY=your-anthropic-api-key-optional
RAZORPAY_KEY_ID=your-razorpay-key
RAZORPAY_KEY_SECRET=your-razorpay-secret
CORS_ORIGIN=https://your-app.vercel.app
```

4. Click **Create Web Service**
5. Wait for deployment (5-10 minutes)
6. Copy your backend URL: `https://alumni-backend.onrender.com`

---

## 🎨 Frontend Deployment (Vercel)

### Step 1: Prepare Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Add New** → **Project**
3. Import your GitHub repository

### Step 2: Configure Project
- **Framework Preset**: Vite
- **Root Directory**: `frontend1/resume`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### Step 3: Set Environment Variables
Add in Vercel dashboard under **Settings** → **Environment Variables**:

```
VITE_API_URL=https://your-backend-name.onrender.com
```

Replace with your actual Render backend URL from previous step.

### Step 4: Deploy
1. Click **Deploy**
2. Wait for build (2-3 minutes)
3. Your app will be live at `https://your-app.vercel.app`

---

## 🔧 Update Backend CORS

After getting your Vercel URL, go back to Render:
1. Open your backend service
2. Go to **Environment**
3. Update `CORS_ORIGIN` to your Vercel URL: `https://your-app.vercel.app`
4. Click **Save Changes** (this will redeploy)

---

## ✅ Verify Deployment

1. Open your Vercel URL
2. Try signing up / logging in
3. Check browser console for any errors
4. Verify API calls are going to Render backend

---

## 📝 Important Notes

### Render Free Plan Limitations
- **Spin down after 15 minutes of inactivity**
- First request after sleep takes ~30 seconds
- 750 hours/month free (enough for 1 service)

### Vercel Free Plan
- **100GB bandwidth/month**
- **Fast global CDN**
- **Automatic HTTPS**

### Production Checklist
- ✅ Update `VITE_API_URL` in Vercel to point to Render backend
- ✅ Update `CORS_ORIGIN` in Render to allow Vercel domain
- ✅ Ensure MongoDB Atlas allows connections from anywhere (0.0.0.0/0)
- ✅ Test all features: auth, resume upload, jobs, community
- ✅ Check browser console for CORS errors

---

## 🐛 Troubleshooting

### CORS Errors
- Verify `CORS_ORIGIN` in Render matches your Vercel URL exactly
- Check backend logs in Render dashboard

### Backend Not Responding
- Check Render logs for errors
- Verify MongoDB connection string is correct
- Ensure all required environment variables are set

### Frontend Build Fails
- Check if `VITE_API_URL` is set in Vercel
- Verify build command is correct: `npm run build`
- Check Vercel build logs

---

## 🔄 Continuous Deployment

Both Render and Vercel will auto-deploy on every push to `main` branch:
- **Vercel**: Deploys on every commit
- **Render**: Deploys on every commit (takes ~5-10 minutes)

---

## 💡 Optional Enhancements

### Custom Domain
1. **Vercel**: Settings → Domains → Add custom domain
2. **Render**: Settings → Custom Domain → Add domain

### Environment Variables per Branch
- Vercel supports preview deployments with different env vars
- Use `.env.production` and `.env.development` locally

---

Need help? Check deployment logs in both dashboards!
