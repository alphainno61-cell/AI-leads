# 🚀 Quick Deployment Guide for Alpha Leads

## Option 1: Deploy with Vercel CLI (Recommended - Fastest)

### Step 1: Login to Vercel
Run this command in your terminal:
```bash
npx vercel login
```
This will open your browser to authenticate with Vercel (GitHub, GitLab, or email).

### Step 2: Deploy to Production
Once logged in, run:
```bash
npx vercel --prod
```

Follow the prompts:
- **Set up and deploy?** → Yes
- **Which scope?** → Select your account
- **Link to existing project?** → No
- **Project name?** → alpha-leads (or press Enter)
- **Directory?** → ./ (press Enter)
- **Override settings?** → No

Vercel will:
1. Build your project
2. Deploy it to production
3. Give you a live URL (e.g., `https://alpha-leads.vercel.app`)

### Step 3: Access Your Live Site
Once deployment completes, you'll see:
```
✅ Production: https://alpha-leads-xxxxx.vercel.app
```

---

## Option 2: Deploy via Vercel Dashboard (Alternative)

### Step 1: Build the Project
```bash
npm run build
```

### Step 2: Go to Vercel
1. Visit https://vercel.com
2. Sign up/Login with GitHub, GitLab, or Email
3. Click "Add New" → "Project"

### Step 3: Import from Git (Recommended)
If you want to use Git:

1. **Push to GitHub first:**
   ```bash
   # Create a new repository on GitHub, then:
   git remote add origin https://github.com/YOUR_USERNAME/alpha-leads.git
   git branch -M main
   git push -u origin main
   ```

2. **Import in Vercel:**
   - Click "Import Git Repository"
   - Select your repository
   - Vercel auto-detects Vite
   - Click "Deploy"

### Step 4: Or Upload Manually
1. After running `npm run build`, drag the `dist` folder to Vercel
2. Vercel will deploy it instantly

---

## Option 3: Deploy to Netlify

### Using Netlify CLI:
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Build
npm run build

# Deploy
netlify deploy --prod --dir=dist
```

### Using Netlify Drop:
1. Run `npm run build`
2. Go to https://app.netlify.com/drop
3. Drag and drop the `dist` folder

---

## 🎯 Recommended: Vercel CLI (Fastest)

**Just run these 2 commands:**
```bash
npx vercel login
npx vercel --prod
```

**That's it!** Your site will be live in ~2 minutes.

---

## 📝 What Happens During Deployment

1. **Build Process:**
   - Vite bundles your React app
   - Optimizes CSS and JavaScript
   - Generates production-ready files in `dist/`

2. **Deployment:**
   - Files uploaded to CDN
   - SSL certificate automatically provisioned
   - Global edge network distribution

3. **Result:**
   - Live URL (e.g., `https://alpha-leads.vercel.app`)
   - Automatic HTTPS
   - Lightning-fast loading
   - Free hosting on Vercel's free tier

---

## 🔧 Custom Domain (Optional)

After deployment, you can add a custom domain:

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your domain (e.g., `alphaleads.com`)
3. Update DNS records as instructed
4. SSL certificate auto-provisioned

---

## 🚨 Troubleshooting

**Issue: Build fails**
```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

**Issue: Routes not working**
- Vercel automatically handles this for Vite/React
- No additional configuration needed

**Issue: Environment variables needed**
- Add in Vercel Dashboard → Settings → Environment Variables
- Prefix with `VITE_` (e.g., `VITE_API_URL`)

---

## ✅ Deployment Checklist

Before deploying:
- [x] Project builds successfully (`npm run build`)
- [x] All routes work in preview (`npm run preview`)
- [x] Git repository initialized
- [x] .gitignore configured
- [ ] Environment variables configured (if needed)
- [ ] Custom domain ready (optional)

---

## 🎉 You're Ready to Deploy!

**Fastest method:**
```bash
npx vercel login
npx vercel --prod
```

Your Alpha Leads platform will be live in minutes! 🚀

---

**Need help?** Check the full DEPLOYMENT.md guide in the project root.
