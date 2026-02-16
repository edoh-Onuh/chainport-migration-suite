import { NextResponse } from 'next/server';
import { getLiveAnalytics } from '@/lib/solana-data';

// Cache analytics data for 30 seconds to reduce RPC calls
let cachedData: any = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 30000; // 30 seconds

export async function GET() {
  try {
    const now = Date.now();
    
    // Return cached data if still fresh
    if (cachedData && (now - cacheTimestamp) < CACHE_DURATION) {
      return NextResponse.json({
        success: true,
        data: cachedData,
        source: 'cache',
        cachedAt: cacheTimestamp,
        expiresIn: CACHE_DURATION - (now - cacheTimestamp)
      });
    }
    
    // Fetch fresh data
    const analytics = await getLiveAnalytics();
    
    // Update cache
    cachedData = analytics;
    cacheTimestamp = now;
    
    return NextResponse.json({
      success: true,
      data: analytics,
      source: 'live',
      timestamp: now
    });
  } catch (error: any) {
    console.error('Error fetching live analytics:', error);
    
    // Return cached data if available, even if expired
    if (cachedData) {
      return NextResponse.json({
        success: true,
        data: cachedData,
        source: 'stale-cache',
        warning: 'Using cached data due to error',
        cachedAt: cacheTimestamp
      });
    }
    
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
