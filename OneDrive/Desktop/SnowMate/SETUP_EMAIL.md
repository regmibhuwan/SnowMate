# Daily Email Setup Guide

## Overview
SnowMate can send you a daily weather report at 8 AM with comprehensive information about:
- Temperature details
- Weather conditions
- Best times to drive
- Times to avoid driving
- Clothing recommendations
- Snow storm information
- Wind conditions
- Recommended speeds (highway & city)
- Road visibility throughout the day

## Setup Instructions

### 1. Gmail App Password Setup

Since you're using Gmail (regmibhuwan555@gmail.com), you need to create an App Password:

1. Go to your [Google Account](https://myaccount.google.com/)
2. Navigate to **Security**
3. Enable **2-Step Verification** (if not already enabled)
4. Go to **App Passwords** (under 2-Step Verification)
5. Select **Mail** and **Other (Custom name)**
6. Enter "SnowMate" as the name
7. Click **Generate**
8. Copy the 16-character password (it will look like: `abcd efgh ijkl mnop`)

### 2. Environment Variables

Add these to your `.env.local` file:

```env
OPENAI_API_KEY=your_openai_api_key_here
EMAIL_USER=regmibhuwan555@gmail.com
EMAIL_PASSWORD=your_16_character_app_password_here
NEXT_PUBLIC_BASE_URL=http://localhost:3001
```

**Important:** 
- Use the 16-character App Password (remove spaces) as `EMAIL_PASSWORD`
- Do NOT use your regular Gmail password

### 3. Scheduling Options

#### Option A: Vercel Cron (Recommended for Production)
If you deploy to Vercel, the `vercel.json` file is already configured to run the email at 8 AM daily.

#### Option B: External Cron Service
Use a free service like [cron-job.org](https://cron-job.org/) or [EasyCron](https://www.easycron.com/):

1. Sign up for a free account
2. Create a new cron job
3. Set the URL to: `https://your-domain.com/api/email-daily`
4. Set schedule to: `0 8 * * *` (8 AM daily)
5. Save and activate

#### Option C: Manual Testing
You can test the email by visiting:
```
http://localhost:3001/api/email-daily
```

### 4. Customization

To change the recipient email or location, edit `app/api/email-daily/route.ts`:

```typescript
const recipientEmail = 'your-email@gmail.com'; // Line 9
const lat = '43.6532'; // Line 7 (Toronto default)
const lon = '-79.3832'; // Line 8
```

### 5. Test the Email

1. Make sure your `.env.local` has all required variables
2. Restart your dev server: `npm run dev`
3. Visit: `http://localhost:3001/api/email-daily`
4. Check your email inbox (and spam folder)

## Troubleshooting

### Email not sending?
- Check that `EMAIL_PASSWORD` is the App Password (not regular password)
- Verify 2-Step Verification is enabled on your Google Account
- Check server logs for error messages
- Make sure `EMAIL_USER` matches the account with the App Password

### Cron job not working?
- Verify the URL is accessible
- Check that the API endpoint returns success
- For Vercel, ensure you're on a paid plan (cron jobs require Pro plan)

### Email going to spam?
- Check your spam folder
- Mark the email as "Not Spam"
- The email is sent from your own Gmail account, so it should be trusted

## Email Content

Each email includes:
- ✅ Current temperature and feels-like temperature
- ✅ Detailed weather conditions
- ✅ Best times to drive (AI-generated based on conditions)
- ✅ Times to avoid driving (with reasons)
- ✅ Clothing recommendations and warmth level
- ✅ Snow storm alerts (if applicable)
- ✅ Wind speed, direction, and impact
- ✅ Recommended speeds for highway and city roads
- ✅ Road visibility information throughout the day
- ✅ Risk assessments (Road, Cold, Slip)
- ✅ Safety notes and tips

The email is beautifully formatted with HTML styling and includes all the information you need to plan your day safely!

