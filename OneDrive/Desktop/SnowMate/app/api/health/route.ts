import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'SnowMate API is healthy',
    timestamp: new Date().toISOString(),
  });
}

