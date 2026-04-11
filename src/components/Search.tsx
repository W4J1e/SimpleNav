'use client';

import { useState, useRef } from 'react';

interface SearchProps {
  searchEngine: 'bing' | 'google';
  onSearchEngineChange: (engine: 'bing' | 'google') => void;
}

export default function Search({ searchEngine, onSearchEngineChange }: SearchProps) {
  const [query, setQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

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
  };

  const handleEngineChange = () => {
    const newEngine = searchEngine === 'bing' ? 'google' : 'bing';
    onSearchEngineChange(newEngine);
  };

  return (
    <div className="w-full max-w-2xl mb-8">
      <div className="relative h-12">
        {/* 搜索引擎切换按钮 - 磨砂玻璃风格 */}
        <button
          onClick={handleEngineChange}
          className="absolute left-0 top-0 w-12 h-full flex items-center justify-center bg-white/10 backdrop-blur-md border border-white/20 border-r-0 text-white/80 font-bold text-lg transition-all hover:bg-white/20 hover:text-white rounded-l-full z-20"
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
          className="w-full h-full pl-14 pr-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
        />
        <button 
          onClick={performSearch}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-all z-20"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
}