import { NextRequest, NextResponse } from 'next/server';
import { getAuthUrl } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const authUrl = getAuthUrl();
    
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('登录错误:', error);
    return NextResponse.json(
      { error: '登录失败' },
      { status: 500 }
    );
  }
}