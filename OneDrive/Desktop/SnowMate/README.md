# SnowMate - Canadian Winter Assistant

A mobile-first Canadian winter weather assistant app that helps users understand the weather, not just read it. Built with Next.js, TypeScript, and TailwindCSS.

## Features

- **Mobile-First Design**: Optimized for 390px screens with graceful desktop scaling
- **Weather Summaries**: AI-powered human-readable weather summaries
- **Risk Assessment**: Road, Cold, and Slip risk indicators
- **Weekly Planner**: Horizontal carousel with mood-based day tiles
- **AI Chat**: Interactive chat interface (NorthSense) for weather questions
- **Glassmorphism UI**: Modern, beautiful design with backdrop blur effects

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))
- Note: Weather data uses [Open-Meteo](https://open-meteo.com/) (free, no API key required)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd SnowMate
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory:
```env
OPENAI_API_KEY=your_openai_api_key_here
EMAIL_USER=your_gmail_address@gmail.com
EMAIL_PASSWORD=your_gmail_app_password
NEXT_PUBLIC_BASE_URL=http://localhost:3001
```

**Note for Email Setup:**
- For Gmail, you need to create an [App Password](https://support.google.com/accounts/answer/185833)
- Go to Google Account → Security → 2-Step Verification → App Passwords
- Generate an app password and use it as `EMAIL_PASSWORD`
- The daily email will be sent at 8 AM to the configured email address

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
SnowMate/
├── app/
│   ├── api/
│   │   ├── weather/      # Weather data fetching
│   │   ├── summarize/    # AI weather summarization
│   │   └── chat/         # AI chat endpoint
│   ├── chat/             # Chat page
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── components/
│   ├── WeatherCard.tsx   # Main weather display card
│   ├── RiskBar.tsx       # Risk indicator chips
│   ├── WeekCarousel.tsx  # Weekly forecast carousel
│   ├── ChatUI.tsx        # Chat interface
│   └── MiniForecastBar.tsx # Mini forecast in chat
└── package.json
```

## API Routes

### `/api/weather`
Fetches current weather and forecast from [Open-Meteo API](https://open-meteo.com/) (free, no API key required).

**Query Parameters:**
- `lat` (optional): Latitude (defaults to Toronto: 43.6532)
- `lon` (optional): Longitude (defaults to Toronto: -79.3832)

### `/api/summarize`
Generates AI-powered weather summary with risk scores and mood labels.

**Request Body:**
```json
{
  "current": {...},
  "forecast": {...}
}
```

### `/api/chat`
Handles chat messages with weather context.

**Request Body:**
```json
{
  "message": "User message",
  "weatherContext": {...},
  "chatHistory": [...]
}
```

## Technologies Used

- **Next.js 14+** - React framework with App Router
- **TypeScript** - Type safety
- **TailwindCSS** - Utility-first CSS
- **Lucide React** - Icon library
- **Open-Meteo API** - Free weather data (no API key required)
- **OpenAI API** - AI summarization and chat

## Mobile-First Design

The app is designed with mobile screens (390px) as the primary target, with responsive scaling for larger screens. All components use:

- Touch-friendly tap targets (minimum 44x44px)
- Comfortable spacing for thumb navigation
- Horizontal scrolling carousels with snap points
- Fixed bottom input bars for chat
- Glassmorphism effects for modern aesthetics

## License

MIT

