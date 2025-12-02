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

// 改进的favicon获取方法 - 使用Favicon.im API获取（带大尺寸参数）
export const getBetterFaviconUrl = (url: string): string | undefined => {
  let parsedUrl;
  
  // 尝试解析URL
  try {
    parsedUrl = new URL(url);
  } catch (e) {
    // URL解析失败，返回undefined触发onError事件
    return undefined;
  }
  
  // URL解析成功，返回Favicon.im API链接（带?larger=true参数获取大尺寸图标）
  if (parsedUrl) {
    const domain = parsedUrl.hostname;
    return `https://favicon.im/${domain}?larger=true`;
  } else {
    // 理论上不会执行到这里，但作为后备
    return undefined;
  }
};

// 从URL获取域名作为图标名
export const getIconFromUrl = (url: string): string => {
  try {
    const parsedUrl = new URL(url);
    const domain = parsedUrl.hostname.replace('www.', '');
    const iconName = domain.split('.')[0];
    
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

// 获取渐变背景
export const getGradientBackground = (preset: string): string => {
  const gradients = {
    'blue-purple': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'green-blue': 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
    'orange-red': 'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 99%, #fad0c4 100%)',
    'pink-purple': 'linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)'
  };
  return gradients[preset as keyof typeof gradients] || gradients['blue-purple'];
};

// 获取Bing每日一图
export const getBingImage = async (): Promise<string> => {
  try {
    // 首先尝试使用我们自己的API路由，这样可以避免CORS问题
    const response = await fetch('/api/bing-image', {
      cache: 'no-store' // 禁用缓存，确保每次都获取最新图片
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.imageUrl) {
        return data.imageUrl;
      }
    }
    
    // 如果我们自己的API失败，尝试直接使用备选API
    const alternativeApis = [
      'https://api.yuafeng.cn/API/ly/bing/',
      'https://bing.img.run/rand.php'
    ];
    
    for (const apiUrl of alternativeApis) {
      try {
        // 直接返回API URL，让浏览器处理图片加载
        return apiUrl;
      } catch (error) {
        console.error(`尝试API ${apiUrl} 失败:`, error);
        // 继续尝试下一个API
        continue;
      }
    }
    
  } catch (error) {
    console.error('获取Bing图片失败:', error);
  }
  
  // 如果所有API都失败，使用默认图片
  const defaultUrl = 'https://cdn2.hin.cool/pic/bg/lg3.jpg';
  return defaultUrl;
};

// 预加载图片
export const preloadImage = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous'; // 启用CORS支持
    
    img.onload = () => {
      resolve(url);
    };
    
    img.onerror = () => {
      reject(new Error(`图片加载失败: ${url}`));
    };
    
    // 为图片加载设置超时
    const timeout = setTimeout(() => {
      reject(new Error(`图片加载超时: ${url}`));
    }, 10000); // 10秒超时
    
    img.src = url;
    
    // 清除超时
    img.onload = () => {
      clearTimeout(timeout);
      resolve(url);
    };
  });
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