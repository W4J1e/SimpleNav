'use client';

import { useState, useRef, useEffect } from 'react';

interface SearchProps {
  searchEngine: 'bing' | 'google';
  onSearchEngineChange: (engine: 'bing' | 'google') => void;
}

export default function Search({ searchEngine, onSearchEngineChange }: SearchProps) {
  const [query, setQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const performSearch = () => {
    if (!query.trim()) return;
    
    const searchUrl = searchEngine === 'bing' 
      ? `https://www.bing.com/search?q=${encodeURIComponent(query)}`
      : `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    window.open(searchUrl, '_blank');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      performSearch();
    }
    if (e.key === 'Escape') {
      setIsExpanded(false);
    }
  };

  const handleEngineChange = () => {
    const newEngine = searchEngine === 'bing' ? 'google' : 'bing';
    onSearchEngineChange(newEngine);
  };

  // 展开时自动聚焦输入框
  useEffect(() => {
    if (isExpanded && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isExpanded]);

  // 鼠标移开且无输入内容时自动收起
  useEffect(() => {
    const handleMouseLeave = () => {
      if (!query.trim()) {
        setIsExpanded(false);
      }
    };
    const container = containerRef.current;
    if (container) {
      container.addEventListener('mouseleave', handleMouseLeave);
    }
    return () => {
      if (container) {
        container.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [query]);

  // 点击外部收起
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsExpanded(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="w-full max-w-2xl mb-8 flex justify-center">
      <div
        ref={containerRef}
        onMouseEnter={() => setIsExpanded(true)}
        className={`relative flex items-center bg-white/10 backdrop-blur-md border border-white/20 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] rounded-full overflow-hidden ${
          isExpanded ? 'w-full h-12 shadow-lg shadow-black/20' : 'w-12 h-12 hover:bg-white/15 cursor-pointer'
        }`}
      >
        {/* 收起状态：放大镜图标 */}
        <div
          className={`flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
            isExpanded ? 'w-0 h-0 opacity-0 overflow-hidden' : 'w-12 h-12'
          }`}
        >
          <i className="fas fa-search text-white/80 text-base"></i>
        </div>

        {/* 展开内容 */}
        <div className={`flex items-center flex-1 min-w-0 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          isExpanded ? 'opacity-100 w-full' : 'opacity-0 w-0 overflow-hidden'
        }`}>
          {/* 搜索引擎切换按钮 */}
          <button
            onClick={handleEngineChange}
            className="shrink-0 w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white/80 hover:text-white font-bold text-sm transition-all rounded-l-full border-r border-white/10"
            title={`当前：${searchEngine === 'bing' ? '必应' : '谷歌'}，点击切换`}
          >
            {searchEngine === 'bing' ? 'B' : 'G'}
          </button>

          <input 
            ref={searchInputRef}
            type="text" 
            placeholder={`使用 ${searchEngine === 'bing' ? '必应' : '谷歌'} 搜索...`} 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 min-w-0 h-full bg-transparent text-white placeholder-white/50 focus:outline-none text-sm px-3"
          />

          {/* 搜索按钮 */}
          <button 
            onClick={performSearch}
            className="shrink-0 w-12 h-12 flex items-center justify-center text-white/60 hover:text-white transition-all"
          >
            <i className="fas fa-search text-sm"></i>
          </button>
        </div>
      </div>
    </div>
  );
}
