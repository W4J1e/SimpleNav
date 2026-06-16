import { Settings } from '@/types';

// ============ Favicon IndexedDB 缓存 ============
const FAVICON_DB_NAME = 'favicon_cache';
const FAVICON_STORE_NAME = 'favicons';
const FAVICON_CACHE_DAYS = 30; // 缓存有效期30天

function openFaviconDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(FAVICON_DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(FAVICON_STORE_NAME)) {
        db.createObjectStore(FAVICON_STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

interface CachedFavicon {
  dataUrl: string;
  timestamp: number;
}

// 从缓存获取favicon
export async function getCachedFavicon(domain: string): Promise<string | null> {
  try {
    const db = await openFaviconDB();
    return new Promise((resolve) => {
      const tx = db.transaction(FAVICON_STORE_NAME, 'readonly');
      const store = tx.objectStore(FAVICON_STORE_NAME);
      const request = store.get(domain);
      request.onsuccess = () => {
        const cached = request.result as CachedFavicon | undefined;
        if (cached && (Date.now() - cached.timestamp < FAVICON_CACHE_DAYS * 24 * 60 * 60 * 1000)) {
          resolve(cached.dataUrl);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

// 将favicon存入缓存
export async function setCachedFavicon(domain: string, dataUrl: string): Promise<void> {
  try {
    const db = await openFaviconDB();
    return new Promise((resolve) => {
      const tx = db.transaction(FAVICON_STORE_NAME, 'readwrite');
      const store = tx.objectStore(FAVICON_STORE_NAME);
      store.put({ dataUrl, timestamp: Date.now() } as CachedFavicon, domain);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch {
    // 缓存写入失败不影响功能
  }
}

// 通过fetch获取favicon并转为dataUrl缓存
export async function fetchAndCacheFavicon(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, { mode: 'cors', credentials: 'omit' });
    if (!response.ok) return null;
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        resolve(dataUrl);
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

// 默认背景图片 URL
export const DEFAULT_BG_IMAGE = 'https://cn.bing.com/th?id=OHR.OldRockArch_EN-US2422589534_1920x1080.jpg';

// Bing 图片源
export const BING_IMAGE_SOURCES = [
  'https://bing.ee123.net/img/',
  'https://api.xinyew.cn/api/bing',
  'https://api.nxvav.cn/api/bing/',
  'https://bing.img.run/1920x1080.php'
];

// 获取网站favicon - 默认方式：直接获取网站的favicon.ico
export const getFaviconUrl = (url: string): string | undefined => {
  let parsedUrl;
  
  // 尝试解析URL
  try {
    parsedUrl = new URL(url);
  } catch (e) {
    // URL解析失败，返回undefined触发onError事件
    return undefined;
  }
  
  // URL解析成功，返回favicon.ico链接
  if (parsedUrl) {
    return `${parsedUrl.protocol}//${parsedUrl.hostname}/favicon.ico`;
  } else {
    // 理论上不会执行到这里，但作为后备
    return undefined;
  }
};

// 使用Favicon.im代理获取高清图标
export const getProxyFaviconUrl = (url: string): string | undefined => {
  let parsedUrl;
  
  try {
    parsedUrl = new URL(url);
  } catch (e) {
    return undefined;
  }
  
  if (parsedUrl) {
    const domain = parsedUrl.hostname;
    return `https://favicon.im/${domain}?larger=true`;
  } else {
    return undefined;
  }
};

// 从URL获取域名作为图标名
export const getIconFromUrl = (url: string): string => {
  try {
    const parsedUrl = new URL(url);
    const domain = parsedUrl.hostname.replace('www.', '');
    const iconName = domain.split('.')[0] || 'link';
    
    // 品牌图标列表，这些应该使用fab前缀
    const brandIcons = [
      'github', 'twitter', 'facebook', 'youtube', 'instagram', 'linkedin', 
      'google', 'apple', 'microsoft', 'amazon', 'slack', 'discord', 
      'telegram', 'whatsapp', 'messenger', 'pinterest', 'reddit', 'twitch'
    ];
    
    if (brandIcons.includes(iconName)) {
      return `fab fa-${iconName}`;
    } else {
      return `fas fa-${iconName}`;
    }
  } catch (e) {
    return 'fas fa-link';
  }
};

// 获取渐变背景 - 已迁移至 SVG 渐变方案，此函数保留兼容
export const getGradientBackground = (preset: string): string => {
  const gradients: Record<string, string> = {
    'purple-sunset': 'linear-gradient(135deg, #E8DFF5 0%, #FFE4D1 50%, #FCE4EC 100%)',
    'ocean-depth': 'linear-gradient(135deg, #D1E4FF 0%, #C8DDF5 50%, #B0C8E0 100%)',
    'aurora': 'linear-gradient(135deg, #D0F0E8 0%, #DDE4F5 50%, #C8E8D0 100%)',
    'rose-dawn': 'linear-gradient(135deg, #FBE4D5 0%, #F5DDF0 50%, #FDF0D5 100%)',
    'deep-space': 'linear-gradient(135deg, #E0D5F5 0%, #D5D0F0 50%, #C0D0F5 100%)',
  };
  return (gradients[preset] || gradients['purple-sunset'])!;
};

// 预加载图片
export const preloadImage = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    // 对于背景图展示，不需要跨域许可，移除 crossOrigin 避免某些镜像站报错
    
    const timeout = setTimeout(() => {
      img.src = ''; // 停止加载
      reject(new Error(`图片加载超时: ${url}`));
    }, 5000); // 缩短超时时间到5秒

    img.onload = () => {
      clearTimeout(timeout);
      resolve(url);
    };
    
    img.onerror = () => {
      clearTimeout(timeout);
      reject(new Error(`图片加载失败: ${url}`));
    };
    
    img.src = url;
  });
};

// 获取Bing每日一图
export const getBingImage = async (): Promise<string> => {
  try {
    // 1. 尝试使用内置 API
    const response = await fetch('/api/bing-image', { cache: 'no-store' });
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.imageUrl) {
        try {
          await preloadImage(data.imageUrl);
          return data.imageUrl;
        } catch (e) {
          console.warn('内置API图片加载失败，尝试备选源');
        }
      }
    }
    
    // 2. 尝试备选源，必须经过验证
    const alternativeApis = BING_IMAGE_SOURCES;
    for (const apiUrl of alternativeApis) {
      try {
        await preloadImage(apiUrl);
        return apiUrl;
      } catch (error) {
        console.error(`备选源 ${apiUrl} 无效:`, error);
        continue;
      }
    }
  } catch (error) {
    console.error('获取Bing图片过程出错:', error);
  }
  
  // 3. 终极兜底
  return DEFAULT_BG_IMAGE;
};

// 统一应用背景逻辑
export const applyAppBackground = (settings: Settings) => {
  if (typeof window === 'undefined') return;

  const root = document.documentElement;
  const body = document.getElementById('app-body') || document.body;
  if (!body) return;

  // 设置基础背景样式
  body.style.backgroundSize = 'cover';
  body.style.backgroundPosition = 'center';
  body.style.backgroundAttachment = 'fixed';
  body.style.backgroundRepeat = 'no-repeat';

  const setStyles = (bgImage: string, bgColor: string = 'transparent') => {
    root.style.setProperty('--bg-image', bgImage);
    root.style.setProperty('--bg-color', bgColor);
    body.style.backgroundImage = bgImage;
    body.style.backgroundColor = bgColor;
  };

  // 1. 同步部分立即应用
  if (settings.bgType === 'color') {
    setStyles('none', settings.bgColor);
    return;
  } 
  
  if (settings.bgType === 'gradient') {
    // 渐变背景由 DynamicBackground 组件渲染，这里只清除旧背景
    setStyles('none', 'transparent');
    body.classList.add('bg-gradient');
    return;
  }

  // 非渐变背景时移除标记类
  body.classList.remove('bg-gradient');

  // 2. 异步加载前，先确保有一个基础背景（如果是首次进入）
  if (!body.style.backgroundImage || body.style.backgroundImage === 'none') {
    setStyles(`url(${DEFAULT_BG_IMAGE})`);
  }

  // 3. 异步处理
  const loadAsyncBackground = async () => {
    try {
      let targetUrl = DEFAULT_BG_IMAGE;

      if (settings.bgType === 'image' && settings.bgImageUrl) {
        targetUrl = settings.bgImageUrl;
      } else if (settings.bgType === 'upload' && settings.bgUploadUrl) {
        targetUrl = settings.bgUploadUrl;
      } else if (settings.bgType === 'bing') {
        targetUrl = await getBingImage();
      } else {
        targetUrl = DEFAULT_BG_IMAGE;
      }

      // 所有的网络图片在应用前都进行最后的加载验证
      try {
        await preloadImage(targetUrl);
        setStyles(`url(${targetUrl})`);
      } catch (e) {
        console.warn('目标背景图加载失败，回退到默认图:', targetUrl);
        setStyles(`url(${DEFAULT_BG_IMAGE})`);
      }
    } catch (error) {
      console.error('背景处理逻辑崩溃:', error);
      setStyles(`url(${DEFAULT_BG_IMAGE})`);
    }
  };

  loadAsyncBackground();
};

// 格式化时间
export const formatTime = (date: Date): string => {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

// 格式化日期
export const formatDate = (date: Date): string => {
  const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  const weekday = weekdays[date.getDay()];
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${weekday}, ${year}年${month}月${day}日`;
};