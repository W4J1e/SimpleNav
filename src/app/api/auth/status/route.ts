import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';

// 强制动态渲染，避免静态生成错误
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log('认证状态API：开始检查用户认证状态');
    console.log('认证状态API：请求URL:', request.url);
    console.log('认证状态API：请求头:', {
      host: request.headers.get('host'),
      'x-forwarded-host': request.headers.get('x-forwarded-host'),
      'x-forwarded-proto': request.headers.get('x-forwarded-proto'),
      cookie: request.headers.get('cookie') ? '存在' : '不存在'
    });
    
    const user = await getUserFromRequest(request);
    console.log('认证状态API：getUserFromRequest返回:', user ? '有用户' : '无用户');
    
    if (!user) {
      console.log('认证状态API：用户未认证，返回false');
      return NextResponse.json({ 
        authenticated: false 
      });
    }
    
    console.log('认证状态API：用户已认证，返回用户信息和令牌');
    console.log('认证状态API：用户ID:', user.id);
    console.log('认证状态API：用户名:', user.displayName);
    console.log('认证状态API：accessToken长度:', user.accessToken?.length);
    console.log('认证状态API：refreshToken长度:', user.refreshToken?.length);
    
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
    console.error('认证状态API：检查认证状态失败:', error);
    return NextResponse.json({ 
      authenticated: false 
    });
  }
}