import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const weatherData = await request.json();
    
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    const prompt = `You are a Canadian winter weather assistant. Analyze this weather data and provide a helpful, safety-focused summary.

Weather Data:
${JSON.stringify(weatherData, null, 2)}

Provide a JSON response with this exact structure:
{
  "dailySummary": "A friendly, human-written 2-3 sentence summary of today's weather conditions",
  "clothingAdvice": "Specific clothing recommendations based on temperature, wind, and precipitation",
  "safetyNotes": "Important safety considerations for today",
  "whatToExpect": "Brief bullet points about what to expect today (max 3 items)",
  "riskScores": {
    "road": 0-2 (0=low, 1=medium, 2=high),
    "cold": 0-2,
    "slip": 0-2
  },
  "weeklyMoods": [
    {"day": "Day 1", "mood": "One word mood label like 'Crisp', 'Cozy', 'Challenging', 'Mild'"},
    {"day": "Day 2", "mood": "..."},
    {"day": "Day 3", "mood": "..."},
    {"day": "Day 4", "mood": "..."},
    {"day": "Day 5", "mood": "..."},
    {"day": "Day 6", "mood": "..."},
    {"day": "Day 7", "mood": "..."}
  ]
}

Tone: Calm, practical, friendly, safety-first. Consider Canadian winter conditions.
Risk scoring guidelines:
- Road Risk: Consider precipitation, visibility, temperature (freezing conditions)
- Cold Risk: Consider wind chill, temperature, exposure time
- Slip Risk: Consider precipitation type, temperature, freezing conditions

Return ONLY valid JSON, no markdown formatting.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
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
            content: prompt
          }
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' }
      }),
    });

    if (!response.ok) {
      throw new Error('OpenAI API request failed');
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No content in OpenAI response');
    }

    const summary = JSON.parse(content);

    return NextResponse.json(summary);
  } catch (error) {
    console.error('Summarize API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate summary' },
      { status: 500 }
    );
  }
}

