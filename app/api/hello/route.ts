import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    message: 'Hello from Dungeon Crawler API!',
    timestamp: new Date().toISOString()
  });
}
