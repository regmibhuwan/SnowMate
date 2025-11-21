# Quick Setup Guide

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Create Environment File

Create a `.env.local` file in the root directory with your OpenAI API key:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

**Note:** Weather data uses Open-Meteo API which is completely free and requires no API key.

## Step 3: Run the Development Server

```bash
npm run dev
```

## Step 4: Open in Browser

Navigate to [http://localhost:3000](http://localhost:3000)

---

## API Keys

### OpenAI API Key (Required)
- Get your API key from: https://platform.openai.com/api-keys
- Add it to `.env.local` as `OPENAI_API_KEY`

### Weather API (Not Required)
- Uses Open-Meteo: https://open-meteo.com/
- Completely free, no API key needed
- Provides accurate weather forecasts for any location

---

## Troubleshooting

### "OpenAI API key not configured"
- Make sure you created `.env.local` (not `.env`)
- Restart the dev server after creating the file
- Check that the key starts with `sk-`

### Weather data not loading
- Check your internet connection
- Open-Meteo API should work without any configuration
- Try refreshing the page

