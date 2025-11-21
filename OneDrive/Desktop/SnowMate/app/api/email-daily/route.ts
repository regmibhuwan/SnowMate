import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Shared email sending logic
async function sendDailyEmail() {
  // Default location (Toronto) - can be made configurable
  const lat = '43.6532';
  const lon = '-79.3832';
  const recipientEmail = 'regmibhuwan555@gmail.com';

  // Fetch weather data directly (same logic as weather route)
  const hourlyParams = [
    'temperature_2m',
    'apparent_temperature',
    'precipitation',
    'rain',
    'snowfall',
    'weather_code',
    'wind_speed_10m',
    'wind_direction_10m',
    'relative_humidity_2m',
    'cloud_cover',
  ].join(',');

  const weatherApiResponse = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=${hourlyParams}&models=gem_seamless&timezone=auto`
  );

  if (!weatherApiResponse.ok) {
    throw new Error('Weather API request failed');
  }

  const weatherApiData = await weatherApiResponse.json();

  // Transform to match expected structure
  const getWeatherCondition = (code: number): string => {
    if (code === 0) return 'Clear';
    if (code <= 3) return 'Cloudy';
    if (code <= 49) return 'Foggy';
    if (code <= 59) return 'Rain';
    if (code <= 69) return 'Rain';
    if (code <= 79) return 'Snow';
    if (code <= 84) return 'Snow';
    if (code <= 86) return 'Snow';
    if (code <= 99) return 'Thunderstorm';
    return 'Unknown';
  };

  const currentIndex = 0;
  const currentTemp = weatherApiData.hourly.temperature_2m[currentIndex];
  const apparentTemp = weatherApiData.hourly.apparent_temperature[currentIndex];
  const weatherCode = weatherApiData.hourly.weather_code[currentIndex];
  const windSpeed = weatherApiData.hourly.wind_speed_10m[currentIndex];
  const humidity = weatherApiData.hourly.relative_humidity_2m[currentIndex];

  const weatherData = {
    current: {
      main: {
        temp: currentTemp,
        feels_like: apparentTemp,
        humidity: humidity,
      },
      weather: [
        {
          main: getWeatherCondition(weatherCode),
          description: getWeatherCondition(weatherCode).toLowerCase(),
        },
      ],
      wind: {
        speed: windSpeed / 3.6,
        deg: weatherApiData.hourly.wind_direction_10m[currentIndex],
      },
      name: 'Current Location',
    },
    hourly: weatherApiData.hourly,
    location: {
      lat: parseFloat(lat),
      lon: parseFloat(lon),
      name: 'Current Location',
    },
  };

  // Get AI summary
  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const summaryPrompt = `You are a Canadian winter weather assistant. Analyze this weather data and provide a helpful, safety-focused summary.

Weather Data:
${JSON.stringify(weatherData, null, 2)}

Provide a JSON response with this exact structure:
{
  "dailySummary": "A friendly, human-written 2-3 sentence summary of today's weather conditions",
  "clothingAdvice": "Specific clothing recommendations based on temperature, wind, and precipitation",
  "safetyNotes": "Important safety considerations for today",
  "whatToExpect": ["Brief bullet point 1", "Brief bullet point 2", "Brief bullet point 3"],
  "riskScores": {
    "road": 0-2,
    "cold": 0-2,
    "slip": 0-2
  },
  "weeklyMoods": [
    {"day": "Day 1", "mood": "One word mood"},
    {"day": "Day 2", "mood": "..."},
    {"day": "Day 3", "mood": "..."},
    {"day": "Day 4", "mood": "..."},
    {"day": "Day 5", "mood": "..."},
    {"day": "Day 6", "mood": "..."},
    {"day": "Day 7", "mood": "..."}
  ]
}

Return ONLY valid JSON, no markdown formatting.`;

  const summaryAiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${openaiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful Canadian winter weather assistant. Always return valid JSON only, no markdown.'
        },
        {
          role: 'user',
          content: summaryPrompt
        }
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' }
    }),
  });

  if (!summaryAiResponse.ok) {
    throw new Error('Failed to generate summary');
  }

  const summaryData = await summaryAiResponse.json();
  const summary = JSON.parse(summaryData.choices[0]?.message?.content || '{}');

  // Generate detailed driving and safety information using OpenAI
  const detailedPrompt = `Analyze this weather data and provide a comprehensive daily weather report for email delivery.

Weather Data:
${JSON.stringify(weatherData, null, 2)}

Summary:
${JSON.stringify(summary, null, 2)}

Provide a detailed JSON response with this structure:
{
  "temperatureDetails": "Today's temperature range and current temperature",
  "weatherCondition": "Detailed weather description",
  "bestDriveTimes": "Specific times when driving conditions are best (e.g., '10 AM - 2 PM')",
  "avoidDriveTimes": "Specific times to avoid driving (e.g., '6 PM - 8 PM due to heavy snow')",
  "clothingAdvice": "Detailed clothing recommendations and warmth level needed",
  "snowStormInfo": "Information about snow storms, if any, including timing and intensity",
  "windInfo": "Wind speed, direction, and impact on driving",
  "highwaySpeed": "Recommended speed on highways (e.g., 'Reduce to 60-70 km/h due to conditions')",
  "citySpeed": "Recommended speed on city roads (e.g., '30-40 km/h recommended')",
  "visibilityInfo": "Road visibility throughout the day with specific time ranges"
}

Be specific with times and conditions. Return ONLY valid JSON, no markdown.`;

  const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${openaiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful Canadian winter weather assistant. Always return valid JSON only, no markdown.'
        },
        {
          role: 'user',
          content: detailedPrompt
        }
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' }
    }),
  });

  if (!aiResponse.ok) {
    throw new Error('OpenAI API request failed');
  }

  const aiData = await aiResponse.json();
  const detailedInfo = JSON.parse(aiData.choices[0]?.message?.content || '{}');

  // Create email content
  const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px; text-align: center; }
    .content { background: #f9f9f9; padding: 20px; border-radius: 10px; margin-top: 20px; }
    .section { margin-bottom: 20px; padding: 15px; background: white; border-radius: 8px; border-left: 4px solid #667eea; }
    .section h3 { margin-top: 0; color: #667eea; }
    .highlight { background: #fff3cd; padding: 10px; border-radius: 5px; margin: 10px 0; }
    .warning { background: #f8d7da; padding: 10px; border-radius: 5px; margin: 10px 0; }
    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>❄️ SnowMate Daily Weather Report</h1>
      <p>${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
    </div>

    <div class="content">
      <div class="section">
        <h3>🌡️ Temperature Details</h3>
        <p><strong>Current:</strong> ${Math.round(weatherData.current?.main?.temp || 0)}°C</p>
        <p><strong>Feels Like:</strong> ${Math.round(weatherData.current?.main?.feels_like || 0)}°C</p>
        <p>${detailedInfo.temperatureDetails || summary.dailySummary || 'Temperature information'}</p>
      </div>

      <div class="section">
        <h3>☁️ Weather Condition</h3>
        <p>${detailedInfo.weatherCondition || weatherData.current?.weather?.[0]?.main || 'Clear'}</p>
        <p>${summary.dailySummary || ''}</p>
      </div>

      <div class="section highlight">
        <h3>🚗 Best Times to Drive</h3>
        <p><strong>${detailedInfo.bestDriveTimes || 'Check current conditions before driving'}</strong></p>
      </div>

      <div class="section warning">
        <h3>⚠️ Times to Avoid Driving</h3>
        <p><strong>${detailedInfo.avoidDriveTimes || 'No specific warnings'}</strong></p>
      </div>

      <div class="section">
        <h3>👕 Clothing & Warmth</h3>
        <p>${detailedInfo.clothingAdvice || summary.clothingAdvice || 'Dress appropriately for the temperature'}</p>
        <p><strong>Warmth Level:</strong> ${detailedInfo.clothingAdvice?.includes('warm') ? 'Very Warm' : detailedInfo.clothingAdvice?.includes('layers') ? 'Moderate' : 'Light'}</p>
      </div>

      ${detailedInfo.snowStormInfo ? `
      <div class="section warning">
        <h3>❄️ Snow Storm Information</h3>
        <p>${detailedInfo.snowStormInfo}</p>
      </div>
      ` : ''}

      <div class="section">
        <h3>💨 Wind Information</h3>
        <p><strong>Speed:</strong> ${Math.round((weatherData.current?.wind?.speed || 0) * 3.6)} km/h</p>
        <p><strong>Direction:</strong> ${weatherData.current?.wind?.deg || 0}°</p>
        <p>${detailedInfo.windInfo || 'Moderate wind conditions'}</p>
      </div>

      <div class="section">
        <h3>🛣️ Recommended Driving Speeds</h3>
        <p><strong>Highway:</strong> ${detailedInfo.highwaySpeed || 'Follow posted speed limits, adjust for conditions'}</p>
        <p><strong>City Roads:</strong> ${detailedInfo.citySpeed || 'Drive cautiously, reduce speed in poor conditions'}</p>
      </div>

      <div class="section">
        <h3>👁️ Road Visibility Throughout the Day</h3>
        <p>${detailedInfo.visibilityInfo || 'Visibility varies with weather conditions. Check before driving.'}</p>
      </div>

      <div class="section">
        <h3>📊 Risk Assessment</h3>
        <p><strong>Road Risk:</strong> ${summary.riskScores?.road === 0 ? 'Low' : summary.riskScores?.road === 1 ? 'Medium' : 'High'}</p>
        <p><strong>Cold Risk:</strong> ${summary.riskScores?.cold === 0 ? 'Low' : summary.riskScores?.cold === 1 ? 'Medium' : 'High'}</p>
        <p><strong>Slip Risk:</strong> ${summary.riskScores?.slip === 0 ? 'Low' : summary.riskScores?.slip === 1 ? 'Medium' : 'High'}</p>
      </div>

      <div class="section">
        <h3>💡 Safety Notes</h3>
        <p>${summary.safetyNotes || 'Drive safely and check conditions before heading out.'}</p>
      </div>
    </div>

    <div class="footer">
      <p>Stay safe and warm! ❄️</p>
      <p>This is an automated daily weather report from SnowMate</p>
    </div>
  </div>
</body>
</html>
    `;

  // Setup email transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'regmibhuwan555@gmail.com',
      pass: process.env.EMAIL_PASSWORD, // Gmail App Password
    },
  });

  // Send email
  const mailOptions = {
    from: `"SnowMate" <${process.env.EMAIL_USER || 'regmibhuwan555@gmail.com'}>`,
    to: recipientEmail,
    subject: `❄️ SnowMate Daily Weather Report - ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
    html: emailHtml,
    text: `
SnowMate Daily Weather Report - ${new Date().toLocaleDateString()}

Temperature: ${Math.round(weatherData.current?.main?.temp || 0)}°C
Weather: ${weatherData.current?.weather?.[0]?.main || 'Clear'}

Best Times to Drive: ${detailedInfo.bestDriveTimes || 'Check conditions'}
Times to Avoid: ${detailedInfo.avoidDriveTimes || 'None specified'}

Clothing: ${detailedInfo.clothingAdvice || summary.clothingAdvice || 'Dress for the temperature'}

Wind: ${Math.round((weatherData.current?.wind?.speed || 0) * 3.6)} km/h
${detailedInfo.windInfo || ''}

Highway Speed: ${detailedInfo.highwaySpeed || 'Follow posted limits'}
City Speed: ${detailedInfo.citySpeed || 'Drive cautiously'}

Visibility: ${detailedInfo.visibilityInfo || 'Varies with conditions'}

${summary.safetyNotes || 'Drive safely!'}
    `,
  };

  await transporter.sendMail(mailOptions);

  return {
    success: true,
    message: 'Daily weather email sent successfully',
    sentTo: recipientEmail,
  };
}

export async function GET(request: NextRequest) {
  // Health check endpoint
  const searchParams = request.nextUrl.searchParams;
  if (searchParams.get('health') === 'check') {
    return NextResponse.json({
      status: 'ok',
      message: 'Email daily route is working',
      timestamp: new Date().toISOString(),
    });
  }

  try {
    const result = await sendDailyEmail();
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Email sending error:', error);
    return NextResponse.json(
      {
        error: 'Failed to send email',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const result = await sendDailyEmail();
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Email sending error:', error);
    return NextResponse.json(
      {
        error: 'Failed to send email',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
    // Default location (Toronto) - can be made configurable
    const lat = '43.6532';
    const lon = '-79.3832';
    const recipientEmail = 'regmibhuwan555@gmail.com';

    // Fetch weather data directly (same logic as weather route)
    const hourlyParams = [
      'temperature_2m',
      'apparent_temperature',
      'precipitation',
      'rain',
      'snowfall',
      'weather_code',
      'wind_speed_10m',
      'wind_direction_10m',
      'relative_humidity_2m',
      'cloud_cover',
    ].join(',');

    const weatherApiResponse = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=${hourlyParams}&models=gem_seamless&timezone=auto`
    );

    if (!weatherApiResponse.ok) {
      throw new Error('Weather API request failed');
    }

    const weatherApiData = await weatherApiResponse.json();

    // Transform to match expected structure
    const getWeatherCondition = (code: number): string => {
      if (code === 0) return 'Clear';
      if (code <= 3) return 'Cloudy';
      if (code <= 49) return 'Foggy';
      if (code <= 59) return 'Rain';
      if (code <= 69) return 'Rain';
      if (code <= 79) return 'Snow';
      if (code <= 84) return 'Snow';
      if (code <= 86) return 'Snow';
      if (code <= 99) return 'Thunderstorm';
      return 'Unknown';
    };

    const currentIndex = 0;
    const currentTemp = weatherApiData.hourly.temperature_2m[currentIndex];
    const apparentTemp = weatherApiData.hourly.apparent_temperature[currentIndex];
    const weatherCode = weatherApiData.hourly.weather_code[currentIndex];
    const windSpeed = weatherApiData.hourly.wind_speed_10m[currentIndex];
    const humidity = weatherApiData.hourly.relative_humidity_2m[currentIndex];

    const weatherData = {
      current: {
        main: {
          temp: currentTemp,
          feels_like: apparentTemp,
          humidity: humidity,
        },
        weather: [
          {
            main: getWeatherCondition(weatherCode),
            description: getWeatherCondition(weatherCode).toLowerCase(),
          },
        ],
        wind: {
          speed: windSpeed / 3.6,
          deg: weatherApiData.hourly.wind_direction_10m[currentIndex],
        },
        name: 'Current Location',
      },
      hourly: weatherApiData.hourly,
      location: {
        lat: parseFloat(lat),
        lon: parseFloat(lon),
        name: 'Current Location',
      },
    };

    // Get AI summary
    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const summaryPrompt = `You are a Canadian winter weather assistant. Analyze this weather data and provide a helpful, safety-focused summary.

Weather Data:
${JSON.stringify(weatherData, null, 2)}

Provide a JSON response with this exact structure:
{
  "dailySummary": "A friendly, human-written 2-3 sentence summary of today's weather conditions",
  "clothingAdvice": "Specific clothing recommendations based on temperature, wind, and precipitation",
  "safetyNotes": "Important safety considerations for today",
  "whatToExpect": ["Brief bullet point 1", "Brief bullet point 2", "Brief bullet point 3"],
  "riskScores": {
    "road": 0-2,
    "cold": 0-2,
    "slip": 0-2
  },
  "weeklyMoods": [
    {"day": "Day 1", "mood": "One word mood"},
    {"day": "Day 2", "mood": "..."},
    {"day": "Day 3", "mood": "..."},
    {"day": "Day 4", "mood": "..."},
    {"day": "Day 5", "mood": "..."},
    {"day": "Day 6", "mood": "..."},
    {"day": "Day 7", "mood": "..."}
  ]
}

Return ONLY valid JSON, no markdown formatting.`;

    const summaryAiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful Canadian winter weather assistant. Always return valid JSON only, no markdown.'
          },
          {
            role: 'user',
            content: summaryPrompt
          }
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' }
      }),
    });

    if (!summaryAiResponse.ok) {
      throw new Error('Failed to generate summary');
    }

    const summaryData = await summaryAiResponse.json();
    const summary = JSON.parse(summaryData.choices[0]?.message?.content || '{}');

    // Generate detailed driving and safety information using OpenAI
    const detailedPrompt = `Analyze this weather data and provide a comprehensive daily weather report for email delivery.

Weather Data:
${JSON.stringify(weatherData, null, 2)}

Summary:
${JSON.stringify(summary, null, 2)}

Provide a detailed JSON response with this structure:
{
  "temperatureDetails": "Today's temperature range and current temperature",
  "weatherCondition": "Detailed weather description",
  "bestDriveTimes": "Specific times when driving conditions are best (e.g., '10 AM - 2 PM')",
  "avoidDriveTimes": "Specific times to avoid driving (e.g., '6 PM - 8 PM due to heavy snow')",
  "clothingAdvice": "Detailed clothing recommendations and warmth level needed",
  "snowStormInfo": "Information about snow storms, if any, including timing and intensity",
  "windInfo": "Wind speed, direction, and impact on driving",
  "highwaySpeed": "Recommended speed on highways (e.g., 'Reduce to 60-70 km/h due to conditions')",
  "citySpeed": "Recommended speed on city roads (e.g., '30-40 km/h recommended')",
  "visibilityInfo": "Road visibility throughout the day with specific time ranges"
}

Be specific with times and conditions. Return ONLY valid JSON, no markdown.`;

    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful Canadian winter weather assistant. Always return valid JSON only, no markdown.'
          },
          {
            role: 'user',
            content: detailedPrompt
          }
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' }
      }),
    });

    if (!aiResponse.ok) {
      throw new Error('Failed to generate detailed report');
    }

    const aiData = await aiResponse.json();
    const detailedInfo = JSON.parse(aiData.choices[0]?.message?.content || '{}');

    // Create email content
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px; text-align: center; }
    .content { background: #f9f9f9; padding: 20px; border-radius: 10px; margin-top: 20px; }
    .section { margin-bottom: 20px; padding: 15px; background: white; border-radius: 8px; border-left: 4px solid #667eea; }
    .section h3 { margin-top: 0; color: #667eea; }
    .highlight { background: #fff3cd; padding: 10px; border-radius: 5px; margin: 10px 0; }
    .warning { background: #f8d7da; padding: 10px; border-radius: 5px; margin: 10px 0; }
    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>❄️ SnowMate Daily Weather Report</h1>
      <p>${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
    </div>

    <div class="content">
      <div class="section">
        <h3>🌡️ Temperature Details</h3>
        <p><strong>Current:</strong> ${Math.round(weatherData.current?.main?.temp || 0)}°C</p>
        <p><strong>Feels Like:</strong> ${Math.round(weatherData.current?.main?.feels_like || 0)}°C</p>
        <p>${detailedInfo.temperatureDetails || summary.dailySummary || 'Temperature information'}</p>
      </div>

      <div class="section">
        <h3>☁️ Weather Condition</h3>
        <p>${detailedInfo.weatherCondition || weatherData.current?.weather?.[0]?.main || 'Clear'}</p>
        <p>${summary.dailySummary || ''}</p>
      </div>

      <div class="section highlight">
        <h3>🚗 Best Times to Drive</h3>
        <p><strong>${detailedInfo.bestDriveTimes || 'Check current conditions before driving'}</strong></p>
      </div>

      <div class="section warning">
        <h3>⚠️ Times to Avoid Driving</h3>
        <p><strong>${detailedInfo.avoidDriveTimes || 'No specific warnings'}</strong></p>
      </div>

      <div class="section">
        <h3>👕 Clothing & Warmth</h3>
        <p>${detailedInfo.clothingAdvice || summary.clothingAdvice || 'Dress appropriately for the temperature'}</p>
        <p><strong>Warmth Level:</strong> ${detailedInfo.clothingAdvice?.includes('warm') ? 'Very Warm' : detailedInfo.clothingAdvice?.includes('layers') ? 'Moderate' : 'Light'}</p>
      </div>

      ${detailedInfo.snowStormInfo ? `
      <div class="section warning">
        <h3>❄️ Snow Storm Information</h3>
        <p>${detailedInfo.snowStormInfo}</p>
      </div>
      ` : ''}

      <div class="section">
        <h3>💨 Wind Information</h3>
        <p><strong>Speed:</strong> ${Math.round((weatherData.current?.wind?.speed || 0) * 3.6)} km/h</p>
        <p><strong>Direction:</strong> ${weatherData.current?.wind?.deg || 0}°</p>
        <p>${detailedInfo.windInfo || 'Moderate wind conditions'}</p>
      </div>

      <div class="section">
        <h3>🛣️ Recommended Driving Speeds</h3>
        <p><strong>Highway:</strong> ${detailedInfo.highwaySpeed || 'Follow posted speed limits, adjust for conditions'}</p>
        <p><strong>City Roads:</strong> ${detailedInfo.citySpeed || 'Drive cautiously, reduce speed in poor conditions'}</p>
      </div>

      <div class="section">
        <h3>👁️ Road Visibility Throughout the Day</h3>
        <p>${detailedInfo.visibilityInfo || 'Visibility varies with weather conditions. Check before driving.'}</p>
      </div>

      <div class="section">
        <h3>📊 Risk Assessment</h3>
        <p><strong>Road Risk:</strong> ${summary.riskScores?.road === 0 ? 'Low' : summary.riskScores?.road === 1 ? 'Medium' : 'High'}</p>
        <p><strong>Cold Risk:</strong> ${summary.riskScores?.cold === 0 ? 'Low' : summary.riskScores?.cold === 1 ? 'Medium' : 'High'}</p>
        <p><strong>Slip Risk:</strong> ${summary.riskScores?.slip === 0 ? 'Low' : summary.riskScores?.slip === 1 ? 'Medium' : 'High'}</p>
      </div>

      <div class="section">
        <h3>💡 Safety Notes</h3>
        <p>${summary.safetyNotes || 'Drive safely and check conditions before heading out.'}</p>
      </div>
    </div>

    <div class="footer">
      <p>Stay safe and warm! ❄️</p>
      <p>This is an automated daily weather report from SnowMate</p>
    </div>
  </div>
</body>
</html>
    `;

    // Setup email transporter
    // Using Gmail SMTP - user needs to set up app password
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'regmibhuwan555@gmail.com',
        pass: process.env.EMAIL_PASSWORD, // Gmail App Password
      },
    });

    // Send email
    const mailOptions = {
      from: `"SnowMate" <${process.env.EMAIL_USER || 'regmibhuwan555@gmail.com'}>`,
      to: recipientEmail,
      subject: `❄️ SnowMate Daily Weather Report - ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
      html: emailHtml,
      text: `
SnowMate Daily Weather Report - ${new Date().toLocaleDateString()}

Temperature: ${Math.round(weatherData.current?.main?.temp || 0)}°C
Weather: ${weatherData.current?.weather?.[0]?.main || 'Clear'}

Best Times to Drive: ${detailedInfo.bestDriveTimes || 'Check conditions'}
Times to Avoid: ${detailedInfo.avoidDriveTimes || 'None specified'}

Clothing: ${detailedInfo.clothingAdvice || summary.clothingAdvice || 'Dress for the temperature'}

Wind: ${Math.round((weatherData.current?.wind?.speed || 0) * 3.6)} km/h
${detailedInfo.windInfo || ''}

Highway Speed: ${detailedInfo.highwaySpeed || 'Follow posted limits'}
City Speed: ${detailedInfo.citySpeed || 'Drive cautiously'}

Visibility: ${detailedInfo.visibilityInfo || 'Varies with conditions'}

${summary.safetyNotes || 'Drive safely!'}
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({
      success: true,
      message: 'Daily weather email sent successfully',
      sentTo: recipientEmail,
    });
  } catch (error: any) {
    console.error('Email sending error:', error);
    return NextResponse.json(
      {
        error: 'Failed to send email',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

