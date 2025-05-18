import { NextRequest, NextResponse } from 'next/server';
import { getAllObservations } from '@/lib/database-helpers';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const limitParam = searchParams.get('limit') || '20';
    const limitValue = parseInt(limitParam, 10);
    
    // Get observations from the database
    const observations = await getAllObservations(limitValue);
    
    return NextResponse.json({ observations }, { status: 200 });
  } catch (error) {
    console.error('Error fetching observations:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch observations',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
