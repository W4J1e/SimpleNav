'use client';

import { useState, useEffect } from 'react';

interface HotBoardItem {
  title: string;
  hot: number;
  url: string;
}

interface ZhihuHotBoardDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ZhihuHotBoardDialog({ isOpen, onClose }: ZhihuHotBoardDialogProps) {
  const [hotBoardData, setHotBoardData] = useState<HotBoardItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 移除对话框打开时的自动刷新，只在组件首次加载时初始化一次
  useEffect(() => {
    // 组件首次加载时初始化数据
    fetchHotBoardData();
  }, []);

  const fetchHotBoardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // 调用本地代理API获取知乎热榜数据
      const response = await fetch('/api/zhihu-hot', {
        method: 'GET',
        cache: 'no-store' // 禁用缓存，确保每次都获取最新数据
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Hot board data received:', data);
      
      // 根据返回的数据结构进行转换
      const formattedData = data.list.map((item: any) => ({
        title: item.title,
        hot: item.hot_value,
        url: item.url
      }));
      
      setHotBoardData(formattedData);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '未知错误';
      setError(`获取知乎热榜失败: ${errorMsg}`);
      console.error('Error fetching hot board:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
      {/* 对话框容器 */}
      <div className="relative w-full max-w-2xl max-h-[80vh] overflow-y-auto bg-white/10 backdrop-blur-md rounded-xl text-white shadow-2xl flex flex-col">
        {/* 顶部栏 */}
        <div className="flex items-center justify-between p-6 pb-2 sticky top-0 bg-white/5 backdrop-blur-md z-10 border-b border-white/20">
          <h2 className="text-xl font-semibold">
            <i className="fas fa-fire text-orange-500 mr-2"></i>知乎热榜
          </h2>
          <div className="flex items-center gap-3">
            <button
            onClick={fetchHotBoardData}
            className="p-2 text-white/70 hover:text-white transition-colors"
            title="刷新热榜"
          >
            <i className="fas fa-arrows-rotate"></i>
          </button>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white transition-colors"
            >
              <i className="fas fa-times text-lg"></i>
            </button>
          </div>
        </div>
        
        {/* 内容区域 */}
        <div className="p-6 pt-4 overflow-y-auto flex-grow custom-scrollbar" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255, 255, 255, 0.3) transparent' }}>
        
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-10">
              <i className="fas fa-spinner fa-spin text-xl text-gray-400"></i>
              <p className="mt-2 text-gray-300">加载中...</p>
            </div>
          ) : error ? (
            <div className="text-center py-10 text-red-400">
              <i className="fas fa-circle-exclamation text-xl mb-2"></i>
              <p>{error}</p>
              <button 
                onClick={fetchHotBoardData}
                className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm transition-colors"
              >
                重试
              </button>
            </div>
          ) : hotBoardData.length === 0 ? (
            <div className="text-center py-10 text-gray-300">
              <p>暂无热榜数据</p>
            </div>
          ) : (
            <div className="space-y-2">
              {/* 限制显示数量以提高性能 */}
              {hotBoardData.slice(0, 50).map((item, index) => (
                <div key={index} className="border-b border-white/20 pb-2">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 font-medium text-sm mr-3 mt-0.5">
                      {index + 1}
                    </div>
                    <div className="flex-grow">
                      <a 
                        href={item.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-white hover:text-blue-400 transition-colors text-sm line-clamp-2"
                      >
                        {item.title}
                      </a>
                      <div className="mt-1 flex items-center">
                        <span className="text-xs text-gray-300 flex items-center">
                          <i className="fas fa-fire text-orange-400 mr-1"></i>
                          {item.hot}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        

      </div>
    </div>
  </div>
  );
}