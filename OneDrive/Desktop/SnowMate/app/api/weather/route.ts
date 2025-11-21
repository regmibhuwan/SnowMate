import { NextRequest, NextResponse } from 'next/server';

// Map Open-Meteo weather codes to readable conditions
const getWeatherCondition = (code: number): string => {
  // WMO Weather interpretation codes (WW)
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

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const lat = searchParams.get('lat') || '43.6532'; // Default to Toronto
  const lon = searchParams.get('lon') || '-79.3832';

  try {
    // Fetch hourly forecast from Open-Meteo (free, no API key needed)
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

    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=${hourlyParams}&models=gem_seamless&timezone=auto`
    );

    if (!response.ok) {
      throw new Error('Weather API request failed');
    }

    const data = await response.json();

    // Get current conditions (first hour)
    const currentIndex = 0;
    
    const currentTemp = data.hourly.temperature_2m[currentIndex];
    const apparentTemp = data.hourly.apparent_temperature[currentIndex];
    const weatherCode = data.hourly.weather_code[currentIndex];
    const windSpeed = data.hourly.wind_speed_10m[currentIndex];
    const humidity = data.hourly.relative_humidity_2m[currentIndex];

    // Transform to match expected structure
    const current = {
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
        speed: windSpeed / 3.6, // Convert km/h to m/s
        deg: data.hourly.wind_direction_10m[currentIndex],
      },
      name: 'Current Location',
    };

    // Create daily forecast from hourly data (group by day)
    const dailyForecast: any[] = [];
    const dayMap = new Map<string, any>();

    data.hourly.time.forEach((time: string, index: number) => {
      const date = new Date(time);
      const dayKey = date.toISOString().split('T')[0];
      
      if (!dayMap.has(dayKey)) {
        dayMap.set(dayKey, {
          date: dayKey,
          temps: [],
          codes: [],
          precipitation: [],
          snowfall: [],
          wind: [],
        });
      }

      const dayData = dayMap.get(dayKey);
      dayData.temps.push(data.hourly.temperature_2m[index]);
      dayData.codes.push(data.hourly.weather_code[index]);
      dayData.precipitation.push(data.hourly.precipitation[index]);
      dayData.snowfall.push(data.hourly.snowfall[index]);
      dayData.wind.push(data.hourly.wind_speed_10m[index]);
    });

    // Convert to forecast list format
    Array.from(dayMap.entries())
      .slice(0, 7) // Next 7 days
      .forEach(([date, dayData]) => {
        dailyForecast.push({
          dt_txt: date,
          main: {
            temp: dayData.temps.reduce((a: number, b: number) => a + b, 0) / dayData.temps.length,
            temp_min: Math.min(...dayData.temps),
            temp_max: Math.max(...dayData.temps),
          },
          weather: [
            {
              main: getWeatherCondition(
                dayData.codes[Math.floor(dayData.codes.length / 2)]
              ),
            },
          ],
          snow: dayData.snowfall.reduce((a: number, b: number) => a + b, 0) > 0 ? { '3h': dayData.snowfall.reduce((a: number, b: number) => a + b, 0) } : null,
          rain: dayData.precipitation.reduce((a: number, b: number) => a + b, 0) > 0 ? { '3h': dayData.precipitation.reduce((a: number, b: number) => a + b, 0) } : null,
        });
      });

    return NextResponse.json({
      current: current,
      forecast: {
        list: dailyForecast,
      },
      hourly: data.hourly, // Keep raw hourly data for detailed queries
      location: {
        lat: parseFloat(lat),
        lon: parseFloat(lon),
        name: 'Current Location',
      },
    });
  } catch (error) {
    console.error('Weather API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weather data' },
      { status: 500 }
    );
  }
}

