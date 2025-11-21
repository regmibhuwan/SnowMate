# Clean Deployment Guide - SnowMate Only

## Current Status ✅
- ✅ Git remote is correctly pointing to: `https://github.com/regmibhuwan/SnowMate.git`
- ✅ Repository contains only SnowMate files
- ✅ All SnowMate code is committed and pushed

## Steps to Clean Up and Redeploy

### Step 1: Delete Calmlens from Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Find the **Calmlens** project
3. Click on it → Go to **Settings**
4. Scroll down to **Danger Zone**
5. Click **Delete Project**
6. Confirm deletion

### Step 2: Delete Calmlens from GitHub (Optional)

1. Go to [GitHub](https://github.com/regmibhuwan)
2. Find the **Calmlens** repository
3. Go to **Settings** tab
4. Scroll down to **Danger Zone**
5. Click **Delete this repository**
6. Type the repository name to confirm
7. Click **I understand the consequences, delete this repository**

### Step 3: Verify SnowMate Repository

Your SnowMate repo is already clean:
- ✅ Remote: `https://github.com/regmibhuwan/SnowMate.git`
- ✅ All files are SnowMate-specific
- ✅ No Calmlens files present

### Step 4: Redeploy SnowMate on Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. If SnowMate project exists:
   - Click on **SnowMate** project
   - Go to **Deployments** tab
   - Click **Redeploy** on the latest deployment
   - Or click **Settings** → **Git** → **Redeploy**

3. If SnowMate project doesn't exist:
   - Click **Add New Project**
   - Import from GitHub: `regmibhuwan/SnowMate`
   - Configure environment variables (see below)
   - Click **Deploy**

### Step 5: Set Environment Variables in Vercel

Make sure these are set in Vercel (Settings → Environment Variables):

```
OPENAI_API_KEY=your_openai_api_key
EMAIL_USER=regmibhuwan555@gmail.com
EMAIL_PASSWORD=your_gmail_app_password
NEXT_PUBLIC_BASE_URL=https://your-snowmate-app.vercel.app
```

**Important:** Update `NEXT_PUBLIC_BASE_URL` with your actual Vercel domain after deployment.

### Step 6: Verify Deployment

After redeployment, test these endpoints:

1. **Health Check:**
   ```
   https://your-app.vercel.app/api/health
   ```

2. **Email Route Health:**
   ```
   https://your-app.vercel.app/api/email-daily?health=check
   ```

3. **Main App:**
   ```
   https://your-app.vercel.app
   ```

## Troubleshooting

### If routes still return 404:
- Wait 2-3 minutes for routes to propagate
- Clear browser cache
- Try incognito mode
- Check Vercel deployment logs for errors

### If build fails:
- Check that all environment variables are set
- Verify `package.json` dependencies are correct
- Check Vercel build logs for specific errors

## Current SnowMate Files (Verified ✅)

- ✅ `app/` - Next.js app directory
- ✅ `components/` - React components
- ✅ `package.json` - Dependencies (only SnowMate)
- ✅ `vercel.json` - Vercel configuration
- ✅ All configuration files are SnowMate-specific

No Calmlens files detected in the repository!

