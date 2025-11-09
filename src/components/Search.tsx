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

  return (
    <div className="w-full max-w-2xl mb-8">
      <div className="relative">
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
          <i className="fa fa-search text-xl text-white/80"></i>
        </div>
        <input 
          ref={searchInputRef}
          type="text" 
          placeholder="搜索..." 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          className="w-full py-3 px-12 pr-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
        />
        <button 
          onClick={performSearch}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-all"
        >
          <i className="fa fa-arrow-right text-xl"></i>
        </button>
      </div>
    </div>
  );
}