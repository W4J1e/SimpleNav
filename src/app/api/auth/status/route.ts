import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, refreshAccessToken, createJWTToken, setAuthCookie } from '@/lib/auth';

// 强制动态渲染，避免静态生成错误
export const dynamic = 'force-dynamic';

// 从Microsoft Graph获取用户头像URL
async function getUserPhoto(accessToken: string): Promise<string | undefined> {
  try {
    // 直接使用fetch API获取头像
    const response = await fetch('https://graph.microsoft.com/v1.0/me/photo/$value', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'image/*'
      }
    });
    
    if (!response.ok) {
      return undefined;
    }
    
    // 将响应转换为ArrayBuffer
    const arrayBuffer = await response.arrayBuffer();
    
    // 转换为Base64字符串
    const base64String = Buffer.from(arrayBuffer).toString('base64');
    
    // 创建data URL
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const dataUrl = `data:${contentType};base64,${base64String}`;
    
    return dataUrl;
  } catch (error) {
    // 头像获取失败不影响整体功能
    console.log('获取用户头像失败:', error);
    return undefined;
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json({ 
        authenticated: false 
      });
    }
    
    // 尝试验证Microsoft OAuth访问令牌是否有效，如果无效则刷新
    let accessToken = user.accessToken;
    let refreshToken = user.refreshToken;
    let tokenRefreshed = false;
    
    // 尝试获取用户头像来验证访问令牌是否有效
    if (user.accessToken) {
      try {
        // 尝试使用当前访问令牌获取用户头像
        await getUserPhoto(user.accessToken);
      } catch (error) {
        console.log('访问令牌可能已过期，尝试刷新...');
        
        // 访问令牌可能已过期，尝试使用刷新令牌获取新令牌
        if (user.refreshToken) {
          try {
            const refreshedTokens = await refreshAccessToken(user.refreshToken);
            accessToken = refreshedTokens.accessToken;
            refreshToken = refreshedTokens.refreshToken;
            tokenRefreshed = true;
          } catch (refreshError) {
            console.error('刷新令牌失败:', refreshError);
            // 刷新令牌失败，用户需要重新登录
            return NextResponse.json({ authenticated: false });
          }
        } else {
          // 没有刷新令牌，用户需要重新登录
          return NextResponse.json({ authenticated: false });
        }
      }
    }
    
    // 如果令牌已刷新，更新JWT令牌
    let updatedUser = user;
    if (tokenRefreshed) {
      // 更新用户信息中的令牌
      updatedUser = {
        ...user,
        accessToken,
        refreshToken
      };
      
      // 创建新的JWT令牌
      const newJWT = createJWTToken(updatedUser);
      
      // 创建响应对象
      const response = NextResponse.json({ 
        authenticated: true,
        user: updatedUser,
        accessToken,
        refreshToken
      });
      
      // 设置新的认证Cookie
      setAuthCookie(response, newJWT, request);
      
      // 返回带有新Cookie的响应
      return response;
    }
    
    // 准备用户信息对象，使用更宽松的类型定义以支持动态添加photo属性
    const userInfo: { [key: string]: any } = {
      id: user.id || '',
      displayName: user.displayName || 'OneDrive用户',
      email: user.email || ''
    };
    
    // 尝试获取用户头像
    try {
      const photo = await getUserPhoto(accessToken);
      if (photo) {
        userInfo['photo'] = photo;
      }
    } catch (error) {
      // 头像获取失败不影响其他信息返回
      console.log('获取用户头像失败:', error);
    }
    
    return NextResponse.json({ 
      authenticated: true,
      user: userInfo,
      accessToken,
      refreshToken
    });
  } catch (error) {
    console.error('获取认证状态失败:', error);
    return NextResponse.json({ 
      authenticated: false 
    });
  }
}