import { NextRequest, NextResponse } from 'next/server';
import { isAdminLoggedIn } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const isAdmin = await isAdminLoggedIn();
    return NextResponse.json({ isAdmin });
  } catch (error) {
    console.error('Admin check error:', error);
    return NextResponse.json({ isAdmin: false });
  }
}
