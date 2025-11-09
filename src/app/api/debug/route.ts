import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; 
export const runtime = 'nodejs'; 

export async function GET(request: NextRequest) {
  try {
    // 收集环境变量信息（不包含敏感信息）
    const envInfo = {
      NODE_ENV: process.env.NODE_ENV,
      // 检查是否有Azure配置（不显示实际值）
      hasAzureClientId: !!process.env.AZURE_CLIENT_ID,
      hasAzureClientSecret: !!process.env.AZURE_CLIENT_SECRET,
      hasAzureTenantId: !!process.env.AZURE_TENANT_ID,
      azureRedirectUri: process.env.AZURE_REDIRECT_URI, // 这个值可以显示，因为它不是敏感信息
      hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
      nextAuthUrl: process.env.NEXTAUTH_URL,
      hasJwtSecret: !!process.env.JWT_SECRET,
    };

    // 检查请求信息
    const requestInfo = {
      url: request.url,
      host: request.headers.get('host'),
      userAgent: request.headers.get('user-agent'),
      cookie: request.headers.get('cookie') ? '存在' : '不存在',
    };

    // 尝试获取认证状态
    let authInfo = null;
    try {
      const authResponse = await fetch(`${request.nextUrl.origin}/api/auth/status`, {
        headers: {
          cookie: request.headers.get('cookie') || '',
        },
      });
      
      if (authResponse.ok) {
        authInfo = await authResponse.json();
      } else {
        authInfo = { error: `认证状态检查失败: ${authResponse.status}` };
      }
    } catch (error) {
      authInfo = { error: `认证状态检查异常: ${error.message}` };
    }

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      environment: envInfo,
      request: requestInfo,
      authentication: authInfo,
    });
  } catch (error) {
    console.error('调试信息获取失败:', error);
    return NextResponse.json(
      { error: '调试信息获取失败', message: error.message },
      { status: 500 }
    );
  }
}