'use client';

import { Link } from '@/types';
import { getBetterFaviconUrl } from '@/lib/utils';
import { useState, useEffect } from 'react';

interface HotBoardItem {
  title: string;
  hot: number;
  url: string;
}

interface LinksGridProps {
  links: Link[];
  layout: 'grid' | 'list' | 'masonry';
  selectedCategory: string;
  onEditLink: (link: Link) => void;
  onDeleteLink: (link: Link) => void;
  onAddLink: () => void;
  onLinksReorder: (newOrder: Link[]) => void;
  onHotBoardClick?: () => void;
}

export default function LinksGrid({ links, layout, selectedCategory, onEditLink, onDeleteLink, onAddLink, onLinksReorder, onHotBoardClick }: LinksGridProps) {
  const safeLinks = Array.isArray(links) ? links : [];
  const [hotBoardData, setHotBoardData] = useState<HotBoardItem[]>([]);
  const [isLoadingHotBoard, setIsLoadingHotBoard] = useState(false);
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    link: Link | null;
  }>({
    visible: false,
    x: 0,
    y: 0,
    link: null,
  });
  const [draggedLinkId, setDraggedLinkId] = useState<string | null>(null);
  const [draggedOverLinkId, setDraggedOverLinkId] = useState<string | null>(null);

  const fetchHotBoardData = async () => {
    setIsLoadingHotBoard(true);
    try {
      const response = await fetch('/api/zhihu-hot', {
        cache: 'no-store'
      });
      if (response.ok) {
        const data = await response.json();
        const formattedData = data.list.slice(0, 5).map((item: any) => ({
          title: item.title,
          hot: item.hot_value,
          url: item.url
        }));
        setHotBoardData(formattedData);
      }
    } catch (error) {
      console.error('Failed to fetch hot board data:', error);
    } finally {
      setIsLoadingHotBoard(false);
    }
  };

  useEffect(() => {
    fetchHotBoardData();
    const interval = setInterval(fetchHotBoardData, 180000);
    return () => clearInterval(interval);
  }, []);

  const closeContextMenu = () => {
    setContextMenu(prev => ({ ...prev, visible: false }));
  };

  useEffect(() => {
    const handleClick = () => closeContextMenu();
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const handleContextMenu = (e: React.MouseEvent, link: Link) => {
    if (link.isHotBoard) return;
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      link: link,
    });
  };

  const handleDragStart = (e: React.DragEvent, link: Link) => {
    setDraggedLinkId(link.id);
    e.dataTransfer.effectAllowed = 'move';
    if (e.dataTransfer.setDragImage) {
      const dragElement = e.currentTarget as HTMLElement;
      e.dataTransfer.setDragImage(dragElement, dragElement.clientWidth / 2, dragElement.clientHeight / 2);
    }
  };

  const handleDragOver = (e: React.DragEvent, link: Link) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (draggedLinkId !== link.id) {
      setDraggedOverLinkId(link.id);
    }
  };

  const handleDragEnd = () => {
    if (draggedLinkId && draggedOverLinkId && draggedLinkId !== draggedOverLinkId) {
      const draggedIndex = safeLinks.findIndex(l => l.id === draggedLinkId);
      const overIndex = safeLinks.findIndex(l => l.id === draggedOverLinkId);
      
      if (draggedIndex !== -1 && overIndex !== -1) {
        const newLinks = [...safeLinks];
        const [draggedLink] = newLinks.splice(draggedIndex, 1);
        newLinks.splice(overIndex, 0, draggedLink);
        onLinksReorder(newLinks);
      }
    }
    
    setDraggedLinkId(null);
    setDraggedOverLinkId(null);
  };

  const handleDragLeave = () => {
    setDraggedOverLinkId(null);
  };

  let filteredLinks = safeLinks;
  if (selectedCategory !== 'all') {
    filteredLinks = safeLinks.filter(link => link.category === selectedCategory);
  }

  const linkCategories = new Set(safeLinks.map(link => link.category));
  if (linkCategories.has('常用')) {
    linkCategories.delete('常用');
  }
  const categories = ['all', '常用', ...linkCategories];

  const getGridClasses = () => {
    if (layout === 'grid') {
      return 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6';
    } else if (layout === 'list') {
      return 'flex flex-col gap-3';
    } else if (layout === 'masonry') {
      return 'masonry-grid';
    }
    return '';
  };

  return (
    <div className="w-full max-w-5xl">
      <div className="flex overflow-x-auto pb-4 mb-6 gap-2 scrollbar-hide" id="category-tabs">
        {categories.map(category => (
          <button 
            key={category}
            className={`category-tab px-4 py-2 rounded-full whitespace-nowrap transition-all ${selectedCategory === category ? 'bg-primary text-white' : 'bg-white/10 hover:bg-white/20 text-white dark:bg-gray-800/80 dark:hover:bg-gray-700/80 dark:text-white'}`}
            onClick={() => {
              const event = new CustomEvent('categoryChange', { detail: category });
              window.dispatchEvent(event);
            }}
          >
            {category === 'all' ? '全部' : category}
          </button>
        ))}
      </div>

      <div id="links-grid" className={getGridClasses()}>
        {filteredLinks.map((link) => (
          <div 
            key={link.id} 
            className={`${layout === 'masonry' ? 'masonry-item' : ''} ${link.isHotBoard ? 'row-span-2' : ''}`}
          >
            <div 
              className={`bg-white/10 backdrop-blur-md rounded-xl p-4 text-white hover:bg-white/20 transition-all group link-card relative dark:bg-gray-800/80 dark:hover:bg-gray-700/80 ${draggedLinkId === link.id ? 'opacity-50 transform scale-105' : ''} ${draggedOverLinkId === link.id ? 'ring-2 ring-blue-400' : ''} ${link.isHotBoard ? 'h-full flex flex-col justify-between' : ''}`}
              onContextMenu={(e) => handleContextMenu(e, link)}
              draggable="true"
              onDragStart={(e) => handleDragStart(e, link)}
              onDragOver={(e) => handleDragOver(e, link)}
              onDragEnd={handleDragEnd}
              onDragLeave={handleDragLeave}
              onClick={(e) => {
                if (link.isHotBoard && onHotBoardClick) {
                  e.preventDefault();
                  onHotBoardClick();
                }
              }}
            >
              {link.isHotBoard ? (
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between mb-3">
                    <div 
                      className="flex items-center gap-2 cursor-pointer hover:text-orange-400 transition-colors"
                      onClick={(e) => {
                        e.preventDefault();
                        if (onHotBoardClick) {
                          onHotBoardClick();
                        }
                      }}
                    >
                      <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center">
                        <i className="fas fa-fire text-xl text-orange-500"></i>
                      </div>
                      <span className="font-medium truncate text-base">知乎热榜</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mt-2 flex-grow">
                    {isLoadingHotBoard ? (
                      <div className="text-center py-2">
                        <i className="fas fa-spinner fa-spin text-sm text-gray-400"></i>
                      </div>
                    ) : hotBoardData.length === 0 ? (
                      <div className="text-sm text-gray-300 text-center py-2">
                        暂无数据
                      </div>
                    ) : (
                      hotBoardData.map((item, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <span className="text-xs font-medium text-gray-400 w-4">{index + 1}</span>
                          <a 
                            href={item.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-gray-200 hover:text-white truncate flex-grow"
                          >
                            {item.title}
                          </a>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4 w-full">
                    <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center">
                      {link.useFavicon ? (
                        <img 
                          src={getBetterFaviconUrl(link.url)} 
                          alt={`${link.name}图标`} 
                          className="w-10 h-10 rounded" 
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const defaultIcon = document.createElement('i');
                            defaultIcon.className = 'fas fa-link text-2xl';
                            e.currentTarget.parentNode?.insertBefore(defaultIcon, e.currentTarget.nextSibling);
                          }}
                        />
                      ) : (
                        <i className={`${link.icon || 'fas fa-link'} text-3xl`}></i>
                      )}
                    </div>
                    <span className="font-medium truncate text-lg">{link.name}</span>
                  </div>
                </div>
              )}
              <a href={link.url} target="_blank" rel="noopener noreferrer" className="absolute inset-0 w-full h-full"></a>
            </div>
          </div>
        ))}
        
        <div className={layout === 'masonry' ? 'masonry-item' : ''}>
          <div 
            className="bg-white/10 backdrop-blur-md rounded-xl p-4 text-white hover:bg-white/20 transition-all group link-card cursor-pointer flex items-center justify-center h-full dark:bg-gray-800/80 dark:hover:bg-gray-700/80"
            onClick={onAddLink}
          >
            <i className="fas fa-plus-circle text-3xl"></i>
          </div>
        </div>
      </div>
      
      {contextMenu.visible && contextMenu.link && (
        <div 
          className="fixed z-50 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-1 dark:bg-gray-800/90"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <button 
            onClick={(e) => {
              e.stopPropagation();
              window.open(contextMenu.link!.url, '_blank', 'noopener noreferrer');
              closeContextMenu();
            }}
            className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-200 rounded-md text-sm dark:text-white dark:hover:bg-gray-700"
          >
            <i className="fas fa-up-right-from-square mr-2"></i>新标签页打开
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onEditLink(contextMenu.link!);
              closeContextMenu();
            }}
            className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-200 rounded-md text-sm dark:text-white dark:hover:bg-gray-700"
          >
            <i className="fas fa-pencil mr-2"></i>编辑
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onDeleteLink(contextMenu.link!);
              closeContextMenu();
            }}
            className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-200 rounded-md text-sm dark:text-white dark:hover:bg-gray-700"
          >
            <i className="fas fa-trash mr-2"></i>删除
          </button>
        </div>
      )}
    </div>
  );
}