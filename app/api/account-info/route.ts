import { NextRequest, NextResponse } from 'next/server';
import { getAccountInfo } from '@/lib/solana-data';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const address = searchParams.get('address');
    
    if (!address) {
      return NextResponse.json(
        { success: false, error: 'Address parameter is required' },
        { status: 400 }
      );
    }
    
    const accountInfo = await getAccountInfo(address);
    
    if (!accountInfo) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch account info' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      balance: accountInfo.balance.toFixed(4),
      exists: accountInfo.exists,
      owner: accountInfo.owner,
      lamports: accountInfo.lamports
    });
  } catch (error: any) {
    console.error('Error fetching account info:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch account info'
      },
      { status: 500 }
    );
  }
}
