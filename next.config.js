/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['picsum.photos', 'api.yuafeng.cn', 'www.bing.com', 'bing.img.run', 'api.btstu.cn', 'api.ixiaowai.cn'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/zhihu-hot',
        destination: 'https://uapis.cn/api/v1/misc/hotboard?type=zhihu',
      },
    ];
  },
  webpack: (config, { dev, isServer }) => {
    // 解决开发环境下的文件监听报错
    if (dev) {
      config.watchOptions = {
        // 忽略 node_modules、.next 和系统文件夹
        // Webpack 5 的 watchOptions.ignored 仅支持 string 或 string[] (glob 模式)
        ignored: [
          '**/node_modules/**',
          '**/.next/**',
          '**/System Volume Information/**'
        ],
        // 增加超时时间，减少扫描频率
        aggregateTimeout: 600,
      };

      // 禁用缓存以避免缓存问题
      config.cache = false;
    }


    
    return config;
  },
}

module.exports = nextConfig