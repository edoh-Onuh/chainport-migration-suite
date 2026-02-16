import { NextResponse } from 'next/server';
import { getLiveAnalytics } from '@/lib/solana-data';

export async function GET() {
  try {
    const analytics = await getLiveAnalytics();
    
    return NextResponse.json({
      success: true,
      data: analytics,
      source: 'live',
      timestamp: Date.now()
    });
  } catch (error: any) {
    console.error('Error fetching live analytics:', error);
    
    // Return error with details
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch live analytics',
        source: 'error'
      },
      { status: 500 }
    );
  }
}
