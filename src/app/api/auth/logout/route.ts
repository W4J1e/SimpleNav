import { NextRequest, NextResponse } from 'next/server';
import { clearAuthCookie } from '@/lib/auth';

export const dynamic = 'force-dynamic'; 
export const runtime = 'nodejs'; 

export async function GET(request: NextRequest) {
  try {
    // 创建重定向响应
    const response = NextResponse.redirect('/?auth=logged_out');
    
    // 尝试清除认证Cookie
    clearAuthCookie(response);
    
    return response;
  } catch (error) {
    // 发生错误时仍然返回重定向响应，确保用户体验
    console.error('退出登录过程中发生错误:', error);
    return NextResponse.redirect('/?auth=logged_out');
  }
}