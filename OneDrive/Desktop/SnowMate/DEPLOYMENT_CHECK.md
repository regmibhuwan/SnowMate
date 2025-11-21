# Deployment Verification Checklist

## ✅ Build Status
Your build completed successfully! Now let's verify everything is working.

## Step 1: Test Health Check Endpoint

Visit this URL in your browser (replace with your actual Vercel domain):
```
https://your-app-name.vercel.app/api/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "message": "SnowMate API is healthy",
  "timestamp": "2025-01-21T04:53:16.000Z"
}
```

## Step 2: Test Email Route Health Check

Visit:
```
https://your-app-name.vercel.app/api/email-daily?health=check
```

**Expected Response:**
```json
{
  "status": "ok",
  "message": "Email daily route is working",
  "timestamp": "2025-01-21T04:53:16.000Z"
}
```

## Step 3: Test Full Email Endpoint

Visit:
```
https://your-app-name.vercel.app/api/email-daily
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Daily weather email sent successfully",
  "sentTo": "regmibhuwan555@gmail.com"
}
```

**Note:** This will actually send an email, so only test if you want to receive one!

## Step 4: Verify Environment Variables

In Vercel Dashboard:
1. Go to your project
2. Settings → Environment Variables
3. Verify these are set:
   - ✅ `OPENAI_API_KEY`
   - ✅ `EMAIL_USER`
   - ✅ `EMAIL_PASSWORD`
   - ✅ `NEXT_PUBLIC_BASE_URL` (should be your Vercel domain)

## Step 5: Check Vercel Cron (If Using Pro Plan)

1. Go to Vercel Dashboard → Your Project → Cron Jobs
2. Verify the cron job is configured:
   - Path: `/api/email-daily`
   - Schedule: `0 8 * * *` (8 AM daily)

**Note:** Vercel Cron requires Pro plan ($20/month). If you're on free plan, use external cron service.

## Troubleshooting

### If you still get 404:
1. **Wait 1-2 minutes** - Routes may take time to propagate
2. **Clear browser cache** - Try incognito mode
3. **Check deployment logs** - Look for any errors
4. **Verify route exists** - Check that `app/api/email-daily/route.ts` is in the repo

### If email doesn't send:
1. Check environment variables are set correctly
2. Verify `EMAIL_PASSWORD` is a Gmail App Password (not regular password)
3. Check spam folder
4. Review Vercel function logs for errors

## Next Steps

Once everything is verified:
- ✅ Daily emails will run automatically at 8 AM (if using Vercel Pro + Cron)
- ✅ Or set up external cron service pointing to your endpoint
- ✅ Test the main app at: `https://your-app-name.vercel.app`

