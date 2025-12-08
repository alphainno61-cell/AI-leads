# Deployment Guide

## 🚀 Deployment Options

### Option 1: Vercel (Recommended for React + Vite)

#### Prerequisites
- GitHub account
- Vercel account (free tier available)

#### Steps:
1. **Push code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: AI Lead Agent Platform"
   git branch -M main
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Vite configuration
   - Click "Deploy"

3. **Environment Variables** (if needed)
   - Add in Vercel dashboard under Settings → Environment Variables
   - Example: `VITE_API_URL`, `VITE_GOOGLE_PLACES_API_KEY`

#### Build Settings:
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

---

### Option 2: Netlify

#### Steps:
1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy via Netlify CLI**
   ```bash
   npm install -g netlify-cli
   netlify login
   netlify init
   netlify deploy --prod
   ```

3. **Or use Netlify Drop**
   - Go to [app.netlify.com/drop](https://app.netlify.com/drop)
   - Drag and drop the `dist` folder

#### Build Settings:
- **Build Command**: `npm run build`
- **Publish Directory**: `dist`

---

### Option 3: GitHub Pages

#### Steps:
1. **Install gh-pages**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Update vite.config.js**
   ```javascript
   export default defineConfig({
     plugins: [react()],
     base: '/ai-lead-tools/', // Replace with your repo name
     server: {
       port: 3000,
       open: true
     }
   })
   ```

3. **Add deploy script to package.json**
   ```json
   "scripts": {
     "dev": "vite",
     "build": "vite build",
     "preview": "vite preview",
     "deploy": "npm run build && gh-pages -d dist"
   }
   ```

4. **Deploy**
   ```bash
   npm run deploy
   ```

5. **Enable GitHub Pages**
   - Go to repository Settings → Pages
   - Source: Deploy from branch `gh-pages`

---

### Option 4: AWS S3 + CloudFront

#### Steps:
1. **Build the project**
   ```bash
   npm run build
   ```

2. **Create S3 Bucket**
   - Go to AWS S3 Console
   - Create bucket with public access
   - Enable static website hosting

3. **Upload files**
   ```bash
   aws s3 sync dist/ s3://your-bucket-name --delete
   ```

4. **Create CloudFront Distribution**
   - Origin: Your S3 bucket
   - Default Root Object: `index.html`
   - Error Pages: Redirect 404 to `/index.html` (for React Router)

---

### Option 5: Docker Deployment

#### Create Dockerfile:
```dockerfile
# Build stage
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### Create nginx.conf:
```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### Build and Run:
```bash
docker build -t alpha-leads .
docker run -p 80:80 alpha-leads
```

---

## 🔧 Pre-Deployment Checklist

### 1. **Environment Variables**
- [ ] Set up `.env` file for local development
- [ ] Configure production environment variables
- [ ] Never commit API keys to Git

Example `.env`:
```env
VITE_API_URL=https://api.yourapp.com
VITE_GOOGLE_PLACES_API_KEY=your_api_key_here
VITE_VOICE_AI_API_KEY=your_voice_api_key
```

### 2. **Build Optimization**
- [ ] Run production build: `npm run build`
- [ ] Check bundle size
- [ ] Test production build locally: `npm run preview`
- [ ] Verify all routes work correctly

### 3. **Performance**
- [ ] Optimize images (compress, use WebP)
- [ ] Enable lazy loading for routes
- [ ] Minimize CSS/JS bundles
- [ ] Enable gzip compression

### 4. **SEO & Meta Tags**
- [ ] Update `index.html` with proper meta tags
- [ ] Add Open Graph tags
- [ ] Create `robots.txt`
- [ ] Add `sitemap.xml`

### 5. **Security**
- [ ] Enable HTTPS
- [ ] Set up CORS properly
- [ ] Implement Content Security Policy
- [ ] Add security headers

### 6. **Analytics**
- [ ] Add Google Analytics
- [ ] Set up error tracking (Sentry)
- [ ] Configure performance monitoring

---

## 🌐 Custom Domain Setup

### For Vercel:
1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Wait for SSL certificate provisioning

### DNS Records:
```
Type: A
Name: @
Value: 76.76.21.21 (Vercel IP)

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

---

## 🔄 CI/CD Setup

### GitHub Actions Example:

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm install
      
    - name: Build
      run: npm run build
      env:
        VITE_API_URL: ${{ secrets.VITE_API_URL }}
        
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v20
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.ORG_ID }}
        vercel-project-id: ${{ secrets.PROJECT_ID }}
        vercel-args: '--prod'
```

---

## 📊 Post-Deployment Monitoring

### 1. **Uptime Monitoring**
- Use: UptimeRobot, Pingdom, or StatusCake
- Set up alerts for downtime

### 2. **Performance Monitoring**
- Google PageSpeed Insights
- Lighthouse CI
- WebPageTest

### 3. **Error Tracking**
- Sentry for JavaScript errors
- LogRocket for session replay
- Google Analytics for user behavior

### 4. **Server Monitoring**
- CloudWatch (AWS)
- Vercel Analytics
- Netlify Analytics

---

## 🔐 Security Best Practices

1. **HTTPS Only**
   - Force HTTPS redirects
   - Use HSTS headers

2. **API Security**
   - Never expose API keys in frontend
   - Use backend proxy for sensitive APIs
   - Implement rate limiting

3. **Content Security Policy**
   ```html
   <meta http-equiv="Content-Security-Policy" 
         content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;">
   ```

4. **Environment Variables**
   - Use `.env.production` for production
   - Never commit `.env` files
   - Rotate API keys regularly

---

## 🚨 Troubleshooting

### Issue: Routes not working after deployment
**Solution**: Configure server to redirect all routes to `index.html`

### Issue: Environment variables not loading
**Solution**: Ensure variables are prefixed with `VITE_`

### Issue: Build fails
**Solution**: 
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Issue: Large bundle size
**Solution**: 
- Enable code splitting
- Lazy load routes
- Optimize images
- Remove unused dependencies

---

## 📝 Deployment Checklist

- [ ] Code pushed to Git repository
- [ ] Production build tested locally
- [ ] Environment variables configured
- [ ] Custom domain set up (if applicable)
- [ ] SSL certificate active
- [ ] Analytics configured
- [ ] Error tracking enabled
- [ ] Performance monitoring active
- [ ] Backup strategy in place
- [ ] Documentation updated
- [ ] Team notified of deployment

---

## 🎯 Recommended Stack

**For MVP/Small Scale:**
- **Hosting**: Vercel (free tier)
- **Backend**: Vercel Serverless Functions
- **Database**: Supabase (PostgreSQL)
- **Analytics**: Google Analytics
- **Error Tracking**: Sentry (free tier)

**For Production/Scale:**
- **Hosting**: AWS CloudFront + S3
- **Backend**: AWS Lambda + API Gateway
- **Database**: AWS RDS (PostgreSQL)
- **Cache**: Redis (AWS ElastiCache)
- **CDN**: CloudFront
- **Monitoring**: CloudWatch + Datadog

---

## 📞 Support

For deployment issues:
- Check Vercel/Netlify documentation
- Review build logs
- Test locally with `npm run preview`
- Contact platform support

---

**Last Updated**: December 8, 2025  
**Platform**: Vite + React  
**Recommended**: Vercel for fastest deployment
