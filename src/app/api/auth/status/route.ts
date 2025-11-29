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
    
    // 尝试验证Microsoft OAuth访问令牌是否有效，如果无效或接近过期则刷新
    let accessToken = user.accessToken;
    let refreshToken = user.refreshToken;
    let tokenRefreshed = false;
    let refreshedTokensResult = null; // 用于保存refreshAccessToken的返回结果
    const now = Math.floor(Date.now() / 1000);
    
    // 检查token是否已过期或接近过期（优先检查过期情况）
    if (user.accessTokenExpiresAt) {
      const timeRemaining = user.accessTokenExpiresAt - now;
      console.log(`当前token剩余有效时间: ${Math.floor(timeRemaining / 60)} 分钟`);
      
      // 如果token已过期或剩余时间少于10分钟，主动刷新
      // 这样即使长时间不活动后再次打开页面，也能正确刷新令牌
      if (timeRemaining <= 0 || timeRemaining < 600) { // 600秒 = 10分钟
        console.log(timeRemaining <= 0 ? 'Token已过期，需要刷新...' : 'Token接近过期，主动刷新...');
        if (user.refreshToken) {
          try {
            refreshedTokensResult = await refreshAccessToken(user.refreshToken);
            accessToken = refreshedTokensResult.accessToken;
            refreshToken = refreshedTokensResult.refreshToken;
            tokenRefreshed = true;
            console.log('令牌刷新成功');
          } catch (refreshError) {
            console.error('主动刷新令牌失败:', refreshError);
            // 刷新令牌失败，用户需要重新登录
            return NextResponse.json({ authenticated: false });
          }
        } else {
          // 没有刷新令牌，用户需要重新登录
          return NextResponse.json({ authenticated: false });
        }
      }
    } else {
      // 如果没有accessTokenExpiresAt字段，这可能是旧的JWT
      // 为了安全起见，尝试刷新令牌
      if (user.refreshToken) {
        console.log('未找到accessTokenExpiresAt字段，尝试刷新令牌以确保安全...');
        try {
          refreshedTokensResult = await refreshAccessToken(user.refreshToken);
          accessToken = refreshedTokensResult.accessToken;
          refreshToken = refreshedTokensResult.refreshToken;
          tokenRefreshed = true;
          console.log('令牌刷新成功');
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
    
    // 尝试获取用户头像来验证访问令牌是否有效
    if (accessToken) {
      try {
        // 尝试使用当前访问令牌获取用户头像
        await getUserPhoto(accessToken);
      } catch (error) {
        console.log('访问令牌可能已过期或无效，尝试刷新...');
        
        // 访问令牌可能已过期，尝试使用刷新令牌获取新令牌
        if (user.refreshToken) {
          try {
            refreshedTokensResult = await refreshAccessToken(user.refreshToken);
            accessToken = refreshedTokensResult.accessToken;
            refreshToken = refreshedTokensResult.refreshToken;
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
    
    // 更新JWT令牌，无论token是否被刷新
    // 这样可以确保JWT令牌中的accessTokenExpiresAt字段总是准确的
    let updatedUser = user;
    
    // 如果token被刷新，更新用户信息中的令牌
    if (tokenRefreshed) {
      updatedUser = {
        ...user,
        accessToken,
        refreshToken,
        // 使用统一保存的refreshAccessToken返回结果中的expiresIn值
        expiresIn: refreshedTokensResult?.expiresIn || 3600 // 保留默认值作为安全网
      };
    } 
    // 如果token没有被刷新，但accessTokenExpiresAt字段存在，确保它是准确的
    else if (user.accessTokenExpiresAt) {
      // 计算剩余时间
      const timeRemaining = user.accessTokenExpiresAt - now;
      
      // 如果剩余时间大于0，更新expiresIn字段
      if (timeRemaining > 0) {
        updatedUser = {
          ...user,
          expiresIn: timeRemaining // 使用剩余时间作为新的expiresIn值
        };
      }
    }
    
    // 创建新的JWT令牌，包含expiresIn
    const newJWT = createJWTToken(updatedUser);
    
    // 准备用户信息对象，使用更宽松的类型定义以支持动态添加photo属性
    const userInfo: { [key: string]: any } = {
      id: updatedUser.id || '',
      displayName: updatedUser.displayName || 'OneDrive用户',
      email: updatedUser.email || ''
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
    
    // 创建最终响应对象，包含用户头像信息
    const finalResponse = NextResponse.json({ 
      authenticated: true,
      user: userInfo,
      accessToken,
      refreshToken
    });
    
    // 设置新的认证Cookie
    setAuthCookie(finalResponse, newJWT, request);
    
    // 返回带有新Cookie的响应
    return finalResponse;
  } catch (error) {
    console.error('获取认证状态失败:', error);
    return NextResponse.json({ 
      authenticated: false 
    });
  }
}