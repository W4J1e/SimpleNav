import './globals.css'
import { Inter } from 'next/font/google'
import { Metadata } from 'next'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  fallback: ['system-ui', 'arial']
})

export const metadata: Metadata = {
  title: 'SimpleNav',
  description: '个人导航页面',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <head>
        <link href="https://cdn.jsdelivr.net/npm/font-awesome@4.7.0/css/font-awesome.min.css" rel="stylesheet" />
      </head>
      <body className={`${inter.className} font-inter min-h-screen flex flex-col transition-all duration-700`} 
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