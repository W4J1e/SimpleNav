import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, refreshAccessToken } from '@/lib/auth';
import { OneDriveService } from '@/lib/onedrive';

export const dynamic = 'force-dynamic'; 
export const runtime = 'nodejs'; 

// 获取链接
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { error: '未认证' },
        { status: 401 }
      );
    }
    
    let accessToken = user.accessToken;
    
    try {
      const oneDriveService = new OneDriveService(accessToken);
      const linksData = await oneDriveService.readFile('links.json');
      
      if (linksData) {
        return NextResponse.json({ links: JSON.parse(linksData) });
      } else {
        return NextResponse.json({ links: [] });
      }
    } catch (error: any) {
      // 如果是令牌过期错误，尝试刷新令牌
      if (error.message && error.message.includes('401')) {
        const { accessToken: newAccessToken } = await refreshAccessToken(user.refreshToken);
        
        const oneDriveService = new OneDriveService(newAccessToken);
        const linksData = await oneDriveService.readFile('links.json');
        
        if (linksData) {
          return NextResponse.json({ links: JSON.parse(linksData) });
        } else {
          return NextResponse.json({ links: [] });
        }
      }
      
      throw error;
    }
  } catch (error) {
    console.error('获取链接失败:', error);
    return NextResponse.json(
      { error: '获取链接失败' },
      { status: 500 }
    );
  }
}

// 保存链接
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { error: '未认证' },
        { status: 401 }
      );
    }
    
    const { links } = await request.json();
    
    if (!links) {
      return NextResponse.json(
        { error: '缺少链接数据' },
        { status: 400 }
      );
    }
    
    let accessToken = user.accessToken;
    
    try {
      const oneDriveService = new OneDriveService(accessToken);
      const success = await oneDriveService.writeFile(
        'links.json', 
        JSON.stringify(links, null, 2)
      );
      
      if (success) {
        return NextResponse.json({ success: true });
      } else {
        console.error('OneDriveService.writeFile 返回 false');
        return NextResponse.json(
          { error: '保存链接失败' },
          { status: 500 }
        );
      }
    } catch (error: any) {
      console.error('保存链接到OneDrive时发生错误:', error);
      // 如果是令牌过期错误，尝试刷新令牌
      if (error.message && error.message.includes('401')) {
        try {
          const { accessToken: newAccessToken } = await refreshAccessToken(user.refreshToken);
          
          const oneDriveService = new OneDriveService(newAccessToken);
          const success = await oneDriveService.writeFile(
            'links.json', 
            JSON.stringify(links, null, 2)
          );
          
          if (success) {
            return NextResponse.json({ success: true });
          } else {
            console.error('刷新令牌后，OneDriveService.writeFile 返回 false');
            return NextResponse.json(
              { error: '保存链接失败' },
              { status: 500 }
            );
          }
        } catch (refreshError) {
          console.error('刷新令牌失败:', refreshError);
          return NextResponse.json(
            { error: '刷新令牌失败' },
            { status: 500 }
          );
        }
      }
      
      return NextResponse.json(
        { error: `保存链接失败: ${error.message || '未知错误'}` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('保存链接失败:', error);
    return NextResponse.json(
      { error: '保存链接失败' },
      { status: 500 }
    );
  }
}