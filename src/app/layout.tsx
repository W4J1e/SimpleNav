import './globals.css'
import { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  // 基础信息
  title: {
    template: '%s - SimpleNav',
    default: 'SimpleNav - 个性化导航页面',
  },
  description: 'SimpleNav是一个功能丰富的个性化导航页面，支持自定义链接管理、个性化背景设置、OneDrive同步、天气显示、电影日历和待办事项等功能，让您的上网体验更加高效便捷。',
  keywords: 'SimpleNav, 导航页面, 个人导航, 自定义导航, 书签管理, 个性化主页, 上网导航',
  
  // 作者和版权
  authors: [
    {
      name: 'W4J1e',
      url: 'https://hin.cool',
    },
  ],
  creator: 'W4J1e',
  publisher: 'SimpleNav',
  
  // 语言和区域
  metadataBase: new URL('https://a.hin.cool'), // 替换为实际域名
  alternates: {
    canonical: '/',
    languages: {
      'zh-CN': '/',
    },
  },
  
  // 图标设置
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
  

  
  // Open Graph 标签（用于社交媒体分享）
  openGraph: {
    title: 'SimpleNav - 个性化导航页面',
    description: 'SimpleNav是一个功能丰富的个性化导航页面，支持自定义链接管理、个性化背景设置、OneDrive同步、天气显示、电影日历和待办事项等功能。',
    url: 'https://a.hin.cool', // 替换为实际域名
    type: 'website',
    siteName: 'SimpleNav',
  },
  
  // Twitter 卡片
  twitter: {
    card: 'summary',
    title: 'SimpleNav - 个性化导航页面',
    description: 'SimpleNav是一个功能丰富的个性化导航页面，支持自定义链接管理、个性化背景设置、OneDrive同步等功能。'
  },
  
  // robots 标签
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  // 其他SEO相关标签
  applicationName: 'SimpleNav',
  referrer: 'origin-when-cross-origin',
  generator: 'Next.js',
};

// 视口设置
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#1a1a2e',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <head>
      </head>
      <body className="font-sans min-h-screen flex flex-col transition-all duration-700" 
            style={{
              backgroundImage: 'var(--bg-image)',
              backgroundColor: 'var(--bg-color)',
              backgroundSize: 'var(--bg-size, cover)',
              backgroundPosition: 'var(--bg-position, center)',
              backgroundRepeat: 'var(--bg-repeat, no-repeat)'
            }}
            id="app-body">
        {children}
      </body>
    </html>
  )
}