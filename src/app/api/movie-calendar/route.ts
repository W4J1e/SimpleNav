import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const apiUrl = 'https://www.cikeee.com/api?app_key=pub_23020990025';
    
    // 服务器端请求，避免CORS问题
    const response = await fetch(apiUrl, {
      cache: 'no-store',
      next: { revalidate: 0 }
    });
    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('获取电影数据失败:', error);
    return NextResponse.json(
      { error: '获取电影数据失败' },
      { status: 500 }
    );
  }
}