import { NextResponse } from 'next/server';
import { getWalletTokenAccounts } from '@/lib/solana-data';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get('address');

  if (!address) {
    return NextResponse.json({ success: false, error: 'Address parameter required' }, { status: 400 });
  }

  try {
    const tokens = await getWalletTokenAccounts(address);
    return NextResponse.json({ success: true, tokens, count: tokens.length });
  } catch (error: any) {
    console.error('Wallet tokens error:', error.message);
    return NextResponse.json({ success: false, error: error.message, tokens: [] }, { status: 500 });
  }
}
