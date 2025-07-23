# 🚀 Vercel Deployment Guide for EMS-Formonex

## 📋 Prerequisites

- GitHub/GitLab account with your code repository
- Vercel account (free tier available)
- MongoDB Atlas database (already configured)

## 🔧 Pre-Deployment Setup

### 1. Update Environment Variables

Before deploying, you need to update the API URL in your environment files:

**In `.env.production`:**
```bash
VITE_API_URL=https://your-app-name.vercel.app/api
```

**In `vite.config.js`:**
```javascript
// Update the production API URL to your actual Vercel deployment URL
'https://your-app-name.vercel.app/api'
```

### 2. Verify Configuration Files

Make sure these files are properly configured:
- ✅ `vercel.json` - Vercel deployment configuration
- ✅ `api/index.js` - Serverless function entry point
- ✅ `.env.production` - Frontend environment variables
- ✅ `.env.vercel` - Backend environment variables template

## 🚀 Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Push your code to GitHub:**
   ```bash
   git add .
   git commit -m "Ready for Vercel deployment"
   git push origin main
   ```

2. **Go to [vercel.com](https://vercel.com) and sign in**

3. **Import your repository:**
   - Click "New Project"
   - Import from GitHub/GitLab
   - Select your EMS-Formonex repository

4. **Configure the project:**
   - **Framework Preset:** Vite
   - **Root Directory:** `./` (keep default)
   - **Build Command:** `npm run vercel-build`
   - **Output Directory:** `dist`

5. **Add Environment Variables:**
   In the Vercel dashboard, go to Settings → Environment Variables and add:
   ```
   MONGODB_URI=mongodb+srv://contactsanket1:7Zkn5fLWWMCWTAhP@cluster0.if3q29s.mongodb.net/ems-formonex
   JWT_SECRET=your-super-secure-jwt-secret-change-this
   JWT_EXPIRES_IN=7d
   NODE_ENV=production
   FRONTEND_URL=https://your-app-name.vercel.app
   MAX_FILE_SIZE=5242880
   ```

6. **Deploy:**
   - Click "Deploy"
   - Wait for the build to complete
   - Your app will be available at `https://your-app-name.vercel.app`

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel --prod
   ```

4. **Set environment variables:**
   ```bash
   vercel env add MONGODB_URI
   vercel env add JWT_SECRET
   vercel env add JWT_EXPIRES_IN
   vercel env add NODE_ENV
   vercel env add FRONTEND_URL
   vercel env add MAX_FILE_SIZE
   ```

## 🔧 Post-Deployment Configuration

### 1. Update API URLs

After your first deployment, you'll get a URL like `https://ems-formonex-abc123.vercel.app`. Update:

**In `.env.production`:**
```bash
VITE_API_URL=https://ems-formonex-abc123.vercel.app/api
```

**In `vite.config.js`:**
```javascript
'https://ems-formonex-abc123.vercel.app/api'
```

**In Vercel Environment Variables, update:**
```
FRONTEND_URL=https://ems-formonex-abc123.vercel.app
```

### 2. Redeploy with Updated URLs

Commit the changes and redeploy:
```bash
git add .
git commit -m "Update API URLs for production"
git push origin main
```

Vercel will automatically redeploy.

### 3. Custom Domain (Optional)

1. In Vercel Dashboard → Settings → Domains
2. Add your custom domain
3. Update the environment variables with your custom domain
4. Update DNS settings as instructed by Vercel

## 🔍 Testing Your Deployment

### 1. Verify API Endpoints

Test these URLs in your browser:
- `https://your-app.vercel.app/api/health` - Should return API status
- `https://your-app.vercel.app/api` - Should return API information

### 2. Test Application Features

- ✅ User registration and login
- ✅ Dashboard loading
- ✅ Data persistence (MongoDB)
- ✅ Real-time features
- ✅ Mobile responsiveness

### 3. Check Browser Console

Open developer tools and check for:
- No CORS errors
- API calls working correctly
- No JavaScript errors

## 🚨 Common Issues & Solutions

### Issue 1: CORS Errors
**Problem:** API calls failing due to CORS
**Solution:** Verify FRONTEND_URL environment variable matches your Vercel URL

### Issue 2: API Routes Not Found
**Problem:** 404 errors for API endpoints
**Solution:** Check `vercel.json` routing configuration

### Issue 3: MongoDB Connection Issues
**Problem:** Database connection failures
**Solution:** 
- Verify MongoDB Atlas IP whitelist (add 0.0.0.0/0 for Vercel)
- Check MONGODB_URI environment variable

### Issue 4: Build Failures
**Problem:** Deployment fails during build
**Solution:**
```bash
# Test build locally first
npm run vercel-build

# Check for any missing dependencies
npm install

# Verify all imports are correct
```

### Issue 5: Environment Variables Not Loading
**Problem:** Config values not available in production
**Solution:**
- Double-check environment variables in Vercel dashboard
- Ensure variable names match exactly
- Redeploy after adding variables

## 📊 Performance Optimization

### 1. Enable Analytics
In Vercel dashboard → Analytics → Enable Web Analytics

### 2. Configure Caching
Vercel automatically handles caching, but you can optimize:
- Static assets are cached for 1 year
- API responses can be cached with headers

### 3. Monitor Performance
- Use Vercel Analytics
- Monitor API response times
- Check Core Web Vitals

## 🔒 Security Checklist

- [ ] JWT_SECRET is secure and unique
- [ ] MongoDB Atlas IP whitelist configured
- [ ] HTTPS enforced (automatic with Vercel)
- [ ] Environment variables properly set
- [ ] No sensitive data in client-side code
- [ ] Rate limiting enabled in API
- [ ] CORS properly configured

## 🔄 Continuous Deployment

Vercel automatically deploys when you push to your main branch:

```bash
# Make changes
git add .
git commit -m "Feature: Add new functionality"
git push origin main
# Vercel automatically deploys the changes
```

## 📱 Preview Deployments

Every pull request gets its own preview URL:
- Great for testing features
- Share with team members
- Automatic cleanup after merge

## 📞 Support Resources

- **Vercel Documentation:** https://vercel.com/docs
- **MongoDB Atlas Support:** https://docs.atlas.mongodb.com/
- **GitHub Issues:** Create issues in your repository

## 🎉 Success!

Your EMS-Formonex application is now live on Vercel with:
- ✅ Global CDN for fast loading
- ✅ Automatic HTTPS
- ✅ Serverless backend functions
- ✅ MongoDB integration
- ✅ Real-time features
- ✅ Mobile-responsive design

**Your application URL:** `https://your-app-name.vercel.app`

---

**🌟 Next Steps:**
1. Set up custom domain (optional)
2. Configure monitoring and analytics
3. Set up backup strategies
4. Plan for scaling and optimization
