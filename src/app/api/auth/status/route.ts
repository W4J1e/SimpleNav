import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json({ 
        authenticated: false 
      });
    }
    
    return NextResponse.json({ 
      authenticated: true,
      user: {
        id: user.id,
        displayName: user.displayName,
        email: user.email
      },
      accessToken: user.accessToken,
      refreshToken: user.refreshToken
    });
  } catch (error) {
    console.error('检查认证状态失败:', error);
    return NextResponse.json({ 
      authenticated: false 
    });
  }
}