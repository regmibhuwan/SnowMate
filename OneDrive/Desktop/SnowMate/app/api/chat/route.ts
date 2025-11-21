import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { message, weatherContext, chatHistory = [] } = await request.json();
    
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const systemPrompt = `You are SnowMate, a helpful Canadian winter weather assistant. You help users understand weather conditions, make safety decisions, and plan their activities.

You have access to current weather data and risk assessments. Use this information to provide practical, safety-focused advice.

When users ask about:
- Weather conditions: Provide specific details from the weather data
- Travel/safety: Consider road conditions, visibility, temperature, and risk scores
- Clothing: Give specific recommendations based on temperature and conditions
- Timing: Use forecast data to answer "when" questions
- Locations: If asked about routes or locations, consider weather conditions along the way

Be concise, friendly, and safety-first. Always prioritize user safety in your recommendations.`;

    const userPrompt = `Current Weather Context:
${JSON.stringify(weatherContext, null, 2)}

User Question: ${message}

Previous conversation:
${chatHistory.map((msg: any) => `${msg.role}: ${msg.content}`).join('\n')}

Provide a helpful, concise response that uses the weather context to answer the user's question.`;

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
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        temperature: 0.7,
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

    return NextResponse.json({ response: content });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}

