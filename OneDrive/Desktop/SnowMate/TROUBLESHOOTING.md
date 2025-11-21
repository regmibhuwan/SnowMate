# Troubleshooting Guide

## 404 NOT_FOUND Error

If you're getting a `404: NOT_FOUND` error when accessing `/api/email-daily`, here are the solutions:

### 1. Check Route Accessibility

Test the route manually:
```
https://your-app.vercel.app/api/email-daily?health=check
```

This should return:
```json
{
  "status": "ok",
  "message": "Email daily route is working",
  "timestamp": "..."
}
```

### 2. Vercel Cron Job Issues

**Note:** Vercel Cron requires a **Pro plan** ($20/month). If you're on the free plan, cron jobs won't work.

**Solutions:**
- **Option A:** Upgrade to Vercel Pro plan
- **Option B:** Use an external cron service:
  - [cron-job.org](https://cron-job.org/) (free)
  - [EasyCron](https://www.easycron.com/) (free tier available)
  - Set the URL to: `https://your-app.vercel.app/api/email-daily`
  - Schedule: `0 8 * * *` (8 AM daily)

### 3. Environment Variables

Make sure all environment variables are set in Vercel:
- `OPENAI_API_KEY`
- `EMAIL_USER`
- `EMAIL_PASSWORD`
- `NEXT_PUBLIC_BASE_URL` (should be your Vercel domain)

### 4. Check Vercel Deployment Logs

1. Go to your Vercel dashboard
2. Click on your project
3. Go to "Deployments"
4. Check the build logs for any errors

### 5. Test Locally First

Before deploying, test locally:
```bash
npm run dev
```

Then visit:
```
http://localhost:3001/api/email-daily?health=check
```

### 6. Manual Email Trigger

You can always trigger the email manually by visiting:
```
https://your-app.vercel.app/api/email-daily
```

### 7. Check Email Service

If the route works but emails aren't sending:
- Verify `EMAIL_PASSWORD` is a Gmail App Password (not regular password)
- Check that 2-Step Verification is enabled on your Google Account
- Check spam folder for test emails

## Common Issues

### "OpenAI API key not configured"
- Add `OPENAI_API_KEY` to Vercel environment variables
- Redeploy after adding

### "Failed to send email"
- Check `EMAIL_USER` and `EMAIL_PASSWORD` are correct
- Verify Gmail App Password is valid
- Check email isn't going to spam

### Route not found after deployment
- Wait a few minutes for deployment to complete
- Clear browser cache
- Try accessing the route directly in a new incognito window

## Health Check Endpoints

- `/api/health` - General API health check
- `/api/email-daily?health=check` - Email route health check

## Support

If issues persist:
1. Check Vercel deployment logs
2. Check browser console for errors
3. Verify all environment variables are set
4. Test routes individually to isolate the issue

