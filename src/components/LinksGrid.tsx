'use client';

import { Link as LinkType, TodoItem } from '../types/index';
import { getFaviconUrl, getBetterFaviconUrl } from '../lib/utils';
import { useState, useEffect, useMemo } from 'react';

import TodoDialog from './TodoDialog';
import MovieCalendarDialog from './MovieCalendarDialog';

// 电影数据接口
interface MovieData {
  gettime: number;
  daily_word: string;
  mov_title: string;
  mov_text: string;
  mov_id: string;
  mov_link: string;
  mov_rating: string;
  mov_director: string;
  mov_year: number;
  mov_area: string;
  mov_type: string[];
  mov_pic: string;
  mov_intro: string;
}

// 电影日历卡片组件
const MovieCalendarCard = ({ 
  movieLink, 
  movieData, 
  isLoading, 
  draggedLinkId, 
  draggedOverLinkId, 
  handleDragStart, 
  handleDragOver, 
  handleDragEnd, 
  handleDragLeave, 
  setIsMovieCalendarDialogOpen 
}: {
  movieLink: LinkType;
  movieData: MovieData | null;
  isLoading: boolean;
  draggedLinkId: string | null;
  draggedOverLinkId: string | null;
  handleDragStart: (e: React.DragEvent, link: LinkType) => void;
  handleDragOver: (e: React.DragEvent, link: LinkType) => void;
  handleDragEnd: () => void;
  handleDragLeave: () => void;
  setIsMovieCalendarDialogOpen: (open: boolean) => void;
}) => {
  const [currentDate, setCurrentDate] = useState<{ day: number; month: string; weekday: string }>({
    day: 0,
    month: '',
    weekday: ''
  });

  // 获取当前日期信息
  useEffect(() => {
    const date = new Date();
    const day = date.getDate();
    const month = `${date.getMonth() + 1}月`;
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const weekday = weekdays[date.getDay()];
    
    setCurrentDate({ day, month, weekday });
  }, []);

  if (isLoading || !movieData) {
    return (
      <div key={movieLink.id} className="col-span-2 row-span-2">
        <div 
          className={`bg-white/10 backdrop-blur-md rounded-xl p-4 text-white hover:bg-white/20 transition-all group link-card relative dark:bg-gray-800/80 dark:hover:bg-gray-700/80 h-full overflow-hidden ${draggedLinkId === movieLink.id ? 'opacity-50 transform scale-105' : ''} ${draggedOverLinkId === movieLink.id ? 'ring-2 ring-blue-400' : ''}`}
          draggable="true"
          onDragStart={(e) => handleDragStart(e, movieLink)}
          onDragOver={(e) => handleDragOver(e, movieLink)}
          onDragEnd={handleDragEnd}
          onDragLeave={handleDragLeave}
          onClick={() => setIsMovieCalendarDialogOpen(true)}
        >
          <div className="flex items-center justify-center h-full">
            <i className="fas fa-spinner fa-spin text-3xl text-gray-400"></i>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div key={movieLink.id} className="col-span-2 row-span-2">
      <div 
        className={`bg-white/10 backdrop-blur-md rounded-xl p-4 text-white hover:bg-white/20 transition-all group link-card relative dark:bg-gray-800/80 dark:hover:bg-gray-700/80 h-full overflow-hidden ${draggedLinkId === movieLink.id ? 'opacity-50 transform scale-105' : ''} ${draggedOverLinkId === movieLink.id ? 'ring-2 ring-blue-400' : ''}`}
        draggable="true"
        onDragStart={(e) => handleDragStart(e, movieLink)}
        onDragOver={(e) => handleDragOver(e, movieLink)}
        onDragEnd={handleDragEnd}
        onDragLeave={handleDragLeave}
        onClick={() => setIsMovieCalendarDialogOpen(true)}
      >
        {/* 电影海报 */}
        <div className="absolute top-0 left-0 w-32 h-full bg-cover bg-center" style={{ backgroundImage: `url(${movieData.mov_pic})` }}>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/50"></div>
        </div>
        
        {/* 日期信息 */}
        <div className="absolute top-4 right-4 backdrop-blur-sm rounded-lg p-1 text-center">
          <div className="text-base font-bold">{currentDate.day}</div>
          <div className="text-[10px] opacity-80">{currentDate.month}/{currentDate.weekday}</div>
        </div>
        
        {/* 电影信息 */}
        <div className="ml-36 h-full flex flex-col justify-between">
          {/* 电影标题和评分 */}
          <div className="overflow-hidden">
            <h3 className="text-lg font-bold mb-1 truncate">{movieData.mov_title}</h3>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-green-400 text-sm">豆 {movieData.mov_rating}</span>
              <span className="text-xs opacity-80 truncate">{movieData.mov_year} {movieData.mov_area}</span>
            </div>
            
            {/* 电影类型 */}
            <div className="flex flex-wrap gap-1 mb-2">
              {movieData.mov_type.slice(0, 3).map((type, index) => (
                <span key={index} className="text-xs bg-white/20 rounded-full px-2 py-0.5 truncate max-w-[60px]">{type}</span>
              ))}
            </div>
          </div>
          
          {/* 电影台词 */}
          <div className="mt-1 text-sm italic opacity-70 line-clamp-3 overflow-hidden">
            "{movieData.mov_text}"
          </div>
        </div>
      </div>
    </div>
  );
};


interface HotBoardItem {
  title: string;
  hot: number;
  url: string;
}

interface LinksGridProps {
  links: LinkType[];
  layout: 'grid' | 'list' | 'masonry';
  selectedCategory: string;
  onEditLink: (link: LinkType) => void;
  onDeleteLink: (link: LinkType) => void;
  onAddLink: () => void;
  onLinksReorder: (newOrder: LinkType[]) => void;
  onHotBoardClick?: () => void;
}

export default function LinksGrid({
  links,
  layout,
  selectedCategory,
  onEditLink,
  onDeleteLink,
  onAddLink,
  onLinksReorder,
  onHotBoardClick
}: LinksGridProps) {
  // TodoDialog状态管理
  const [isTodoDialogOpen, setIsTodoDialogOpen] = useState(false);
  const [activeTodoLink, setActiveTodoLink] = useState<LinkType | null>(null);
  
  // 电影日历对话框状态管理
  const [isMovieCalendarDialogOpen, setIsMovieCalendarDialogOpen] = useState(false);
  
  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const [columns, setColumns] = useState(6);

  const safeLinks = Array.isArray(links) ? links : [];

  // 分页逻辑 - 统一改回每页5行，确保在移动端浏览器（带地址栏/状态栏）中不被遮挡
  const rowsPerPage = 5;

  
  // 使用 useMemo 避免每次渲染都重新计算分页，确保计算过程纯净
  const pages = useMemo(() => {
    // 基础数据处理：去重和过滤
    let filtered = Array.isArray(links) ? [...links] : [];
    
    // 严格去重，防止 ID 重复导致的渲染错误
    const seenIds = new Set();
    filtered = filtered.filter(link => {
      if (!link.id || seenIds.has(link.id)) return false;
      seenIds.add(link.id);
      return true;
    });

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(link => link.category === selectedCategory);
    }
    
    // 如果是瀑布流，不分页
    if (layout === 'masonry') {
      return [[...filtered, { id: 'add-card', isAddCard: true } as any]];
    }
    
    const allCardsToPlace = [...filtered, { id: 'add-card', isAddCard: true } as any];
    const pagesResult: any[][] = [];
    const gridOccupancy: boolean[][] = [];
    // 初始化网格占用，1000行足够容纳绝大多数用户的数据
    for (let i = 0; i < 1000; i++) {
      gridOccupancy[i] = new Array(columns).fill(false);
    }

    allCardsToPlace.forEach((item) => {
      let w = 1;
      let h = 1;
      // 定义不同类型卡片的占用尺寸
      if (item.isMovieCalendar) { w = 2; h = 2; }
      else if (item.isTodo || item.isHotBoard) { w = 1; h = 2; }
      
      // 适配当前列数
      if (w > columns) w = columns;

      let placed = false;
      for (let r = 0; !placed && r < 900; r++) {
        for (let c = 0; c <= columns - w; c++) {
          // 检查该位置是否已被占用
          let fits = true;
          for (let dr = 0; dr < h; dr++) {
            for (let dc = 0; dc < w; dc++) {
              if (gridOccupancy[r + dr][c + dc]) {
                fits = false;
                break;
              }
            }
            if (!fits) break;
          }

          if (fits) {
            // 计算起止页码，确保卡片不跨页
            const startPage = Math.floor(r / rowsPerPage);
            const endPage = Math.floor((r + h - 1) / rowsPerPage);
            
            if (startPage !== endPage) {
              // 跨页处理：将搜索位置移动到下一页开头
              c = columns; 
              r = (startPage + 1) * rowsPerPage - 1; 
              continue;
            }

            // 标记网格占用
            for (let dr = 0; dr < h; dr++) {
              for (let dc = 0; dc < w; dc++) {
                gridOccupancy[r + dr][c + dc] = true;
              }
            }
            
            // 将卡片加入对应页
            if (!pagesResult[startPage]) pagesResult[startPage] = [];
            pagesResult[startPage].push(item);
            placed = true;
            break;
          }
        }
      }
    });
    return pagesResult;
  }, [links, selectedCategory, layout, columns, rowsPerPage]);


  const totalPages = pages.length;

  // 监听窗口大小以确定当前列数
  useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth;
      if (width >= 1024) setColumns(6);
      else if (width >= 768) setColumns(4);
      else if (width >= 640) setColumns(3);
      else setColumns(2);
    };
    
    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, []);

  // 当分类改变时，重置页码
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory]);

  // 确保当前页码在有效范围内
  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);


  const categories = useMemo(() => {
    const linkCategories = new Set(safeLinks.map(link => link.category));

    if (linkCategories.has('常用')) {
      linkCategories.delete('常用');
    }
    return ['all', '常用', ...Array.from(linkCategories)];
  }, [safeLinks]);


  // 处理滚轮和触摸翻页
  useEffect(() => {
    let lastScrollTime = 0;
    const SCROLL_DEBOUNCE = 600; // 600ms 间隔，防止滑得太快

    const handleWheel = (e: WheelEvent) => {
      // 检查是否有垂直滚动位移
      if (Math.abs(e.deltaY) < 30) return;

      // 阻止默认滚动行为（虽然已经设置了 overflow-hidden，但这样更稳妥）
      if (e.cancelable) e.preventDefault();

      const now = Date.now();
      if (now - lastScrollTime < SCROLL_DEBOUNCE) return;


      if (e.deltaY > 0) {
        if (currentPage < totalPages) {
          setCurrentPage(prev => prev + 1);
          lastScrollTime = now;
        }
      } else {
        if (currentPage > 1) {
          setCurrentPage(prev => prev - 1);
          lastScrollTime = now;
        }
      }
    };

    // 触摸翻页 - 改为左右滑动
    let touchStartX = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
    };
    const handleTouchEnd = (e: TouchEvent) => {
      const touchEndX = e.changedTouches[0].clientX;
      const deltaX = touchStartX - touchEndX; // 正值表示向左滑（下一页），负值表示向右滑（上一页）
      const now = Date.now();
      
      if (Math.abs(deltaX) > 50 && now - lastScrollTime < SCROLL_DEBOUNCE) return;
      
      if (Math.abs(deltaX) > 50) {
        if (deltaX > 0 && currentPage < totalPages) {
          setCurrentPage(prev => prev + 1);
          lastScrollTime = now;
        } else if (deltaX < 0 && currentPage > 1) {
          setCurrentPage(prev => prev - 1);
          lastScrollTime = now;
        }
      }
    };


    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);

    
    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [currentPage, totalPages]);





  // 处理待办对话框打开
  const handleTodoDialogOpen = (todoLink: LinkType) => {
    setActiveTodoLink(todoLink);
    setIsTodoDialogOpen(true);
  };
  
  // 处理待办事项更新
  const handleTodosChange = (newTodos: TodoItem[], todoLinkId?: string) => {
    const targetId = todoLinkId || activeTodoLink?.id;
    if (!targetId) return;
    
    // 找到待办事项链接在数组中的位置
    const todoLinkIndex = links.findIndex(link => link.id === targetId);
    if (todoLinkIndex === -1) return;
    
    // 更新链接数组中的待办事项数据
    const newLinks = [...links];
    newLinks[todoLinkIndex] = {
      ...newLinks[todoLinkIndex],
      todoItems: newTodos
    };
    
    // 调用重新排序回调来更新整个链接数组
    onLinksReorder(newLinks);
  };

  const [hotBoardData, setHotBoardData] = useState<HotBoardItem[]>([]);
  const [isLoadingHotBoard, setIsLoadingHotBoard] = useState(false);
  const [movieData, setMovieData] = useState<MovieData | null>(null);
  const [isLoadingMovie, setIsLoadingMovie] = useState(false);

  const fetchMovieData = async () => {
    setIsLoadingMovie(true);
    try {
      const response = await fetch('/api/movie-calendar');
      if (response.ok) {
        const data = await response.json();
        setMovieData(data);
      }
    } catch (error) {
      console.error('Failed to fetch movie data:', error);
    } finally {
      setIsLoadingMovie(false);
    }
  };

  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    link: LinkType | null;
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
    fetchMovieData();
  }, []);


  const closeContextMenu = () => {
    setContextMenu(prev => ({ ...prev, visible: false }));
  };

  useEffect(() => {
    const handleClick = () => closeContextMenu();
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const handleContextMenu = (e: React.MouseEvent, link: LinkType) => {
    if (link.isHotBoard) return;
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      link: link,
    });
  };

  const handleDragStart = (e: React.DragEvent, link: LinkType) => {
    setDraggedLinkId(link.id);
    e.dataTransfer.effectAllowed = 'move';
    if (e.dataTransfer.setDragImage) {
      const dragElement = e.currentTarget as HTMLElement;
      e.dataTransfer.setDragImage(dragElement, dragElement.clientWidth / 2, dragElement.clientHeight / 2);
    }
  };

  const handleDragOver = (e: React.DragEvent, link: LinkType) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (draggedLinkId !== link.id) {
      setDraggedOverLinkId(link.id);
    }
  };

  const handleDragEnd = () => {
    // 确保有有效的拖动源和目标，且不是同一个卡片
    if (draggedLinkId && draggedOverLinkId && draggedLinkId !== draggedOverLinkId) {
      // 复制原始链接数组以进行修改
      const newLinks = [...safeLinks];
      
      // 在原始数组中找到被拖动的卡片索引
      const draggedIndex = newLinks.findIndex(link => link.id === draggedLinkId);
      // 在原始数组中找到目标卡片索引
      const targetIndex = newLinks.findIndex(link => link.id === draggedOverLinkId);
      
      // 确保两个卡片都在数组中找到
      if (draggedIndex !== -1 && targetIndex !== -1) {
        // 移除被拖动的卡片
        const [removedCard] = newLinks.splice(draggedIndex, 1);
        
        // 直接使用targetIndex作为插入位置
        // 由于我们已经从数组中移除了draggedCard，targetIndex会自动调整为正确位置
        const insertIndex = targetIndex;
        
        // 插入到目标位置
        newLinks.splice(insertIndex, 0, removedCard);
        
        // 调用回调更新顺序
        onLinksReorder(newLinks);
      }
    }
    
    // 重置拖动状态
    setDraggedLinkId(null);
    setDraggedOverLinkId(null);
  };

  const handleDragLeave = () => {
    setDraggedOverLinkId(null);
  };


  const getGridClasses = () => {
    if (layout === 'grid' || layout === 'list') {
      return 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 md:gap-4';
    } else if (layout === 'masonry') {

      return 'masonry-grid';
    }
    return '';
  };

  const currentItems = pages[currentPage - 1] || [];





  // 获取显示的页码圆点
  const getPaginationDots = () => {
    if (totalPages <= 1) return null;
    
    let displayPages: number[] = [];
    if (totalPages <= 3) {
      displayPages = Array.from({ length: totalPages }, (_, i) => i + 1);
    } else {
      if (currentPage < 3) {
        displayPages = [1, 2, 3];
      } else if (currentPage >= totalPages) {
        displayPages = [totalPages - 2, totalPages - 1, totalPages];
      } else {
        displayPages = [currentPage - 1, currentPage, currentPage + 1];
      }
    }

    return (
      <div className="flex justify-center items-center gap-3 mt-auto py-4 flex-shrink-0">
        {displayPages.map((pageNum) => (

          <button
            key={pageNum}
            onClick={() => setCurrentPage(pageNum)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              currentPage === pageNum 
                ? 'bg-white scale-125 shadow-[0_0_10px_rgba(255,255,255,0.8)]' 
                : 'bg-white/30 hover:bg-white/50'
            }`}
            title={`第 ${pageNum} 页`}
          />
        ))}
      </div>
    );
  };


  return (
    <div className="w-full max-w-7xl flex flex-col flex-grow overflow-hidden">
      <div id="category-tabs" className="flex overflow-x-auto pb-4 mb-6 gap-2 scrollbar-hide flex-shrink-0">

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

      {/* 链接网格 - 确保有足够的空间显示所有卡片 */}
      <div id="links-grid" className={`${getGridClasses()} min-h-[200px] flex-grow content-start overflow-hidden`}>

        {/* 渲染当前页的所有卡片 */}
        {currentItems.map((item: any) => {
          if (item.isAddCard) {
            return (
              <div key="add-card" className={layout === 'masonry' ? 'masonry-item' : ''}>
                <div 
                  className="bg-white/10 backdrop-blur-md rounded-xl p-4 text-white hover:bg-white/20 transition-all group link-card cursor-pointer flex items-center justify-center h-full min-h-[100px] dark:bg-gray-800/80 dark:hover:bg-gray-700/80"
                  onClick={onAddLink}
                >
                  <i className="fas fa-plus-circle text-3xl"></i>
                </div>
              </div>
            );
          }
          
          if (item.isTodo) {
            // 渲染待办事项卡片
            return (
              <div key={item.id} className="row-span-2">
                <div 
                  className={`bg-white/10 backdrop-blur-md rounded-xl p-4 text-white hover:bg-white/20 transition-all group link-card relative dark:bg-gray-800/80 dark:hover:bg-gray-700/80 h-full ${draggedLinkId === item.id ? 'opacity-50 transform scale-105' : ''} ${draggedOverLinkId === item.id ? 'ring-2 ring-blue-400' : ''}`}
                  draggable="true"
                  onDragStart={(e) => handleDragStart(e, item)}
                  onDragOver={(e) => handleDragOver(e, item)}
                  onDragEnd={handleDragEnd}
                  onDragLeave={handleDragLeave}
                  onClick={() => handleTodoDialogOpen(item)}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-1.5 py-0.5 rounded-full">
                      {(item.todoItems || []).filter((t: any) => !t.completed).length}
                    </span>
                    <h3 className="font-medium truncate text-base text-white">待办事项</h3>
                  </div>
                  <div className="space-y-2 flex-grow overflow-y-auto">
                    {(item.todoItems || []).length > 0 ? (
                      [...(item.todoItems || [])]
                        .sort((a: any, b: any) => (a.completed === b.completed ? 0 : a.completed ? 1 : -1))
                        .slice(0, 3)
                        .map((todo: any) => (
                          <div 
                            key={todo.id} 
                            className={`flex items-center p-2 rounded-md ${todo.completed ? 'opacity-70' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              const updatedItems = item.todoItems.map((t: any) => 
                                t.id === todo.id ? { ...t, completed: !t.completed } : t
                              );
                              handleTodosChange(updatedItems, item.id);

                            }}
                          >
                            <input
                              type="checkbox"
                              checked={todo.completed}
                              readOnly
                              className="mr-2 h-4 w-4 text-green-500 rounded focus:ring-green-400 border-gray-300"
                            />
                            <span className={`text-sm truncate flex-grow ${todo.completed ? 'line-through text-gray-300' : 'text-white'}`}>
                              {todo.content}
                            </span>
                          </div>
                        ))
                    ) : (
                      <div className="text-center text-gray-500 text-sm py-4">暂无待办事项</div>
                    )}
                  </div>
                </div>
              </div>
            );
          }
          
          if (item.isMovieCalendar) {
            return (
              <MovieCalendarCard 
                key={item.id}
                movieLink={item}
                movieData={movieData}
                isLoading={isLoadingMovie}
                draggedLinkId={draggedLinkId}
                draggedOverLinkId={draggedOverLinkId}
                handleDragStart={handleDragStart}
                handleDragOver={handleDragOver}
                handleDragEnd={handleDragEnd}
                handleDragLeave={handleDragLeave}
                setIsMovieCalendarDialogOpen={setIsMovieCalendarDialogOpen}
              />
            );
          }

          
          // 渲染普通卡片或知乎热榜
          return (
            <div 
              key={item.id} 
              className={`${layout === 'masonry' ? 'masonry-item' : ''} ${item.isHotBoard ? 'row-span-2' : ''}`}
            >
              <div 
                className={`bg-white/10 backdrop-blur-md rounded-xl p-4 text-white hover:bg-white/20 transition-all group link-card relative dark:bg-gray-800/80 dark:hover:bg-gray-700/80 ${draggedLinkId === item.id ? 'opacity-50 transform scale-105' : ''} ${draggedOverLinkId === item.id ? 'ring-2 ring-blue-400' : ''} ${item.isHotBoard ? 'h-full' : ''}`}
                onContextMenu={(e) => handleContextMenu(e, item)}
                draggable="true"
                onDragStart={(e) => handleDragStart(e, item)}
                onDragOver={(e) => handleDragOver(e, item)}
                onDragEnd={handleDragEnd}
                onDragLeave={handleDragLeave}
                onClick={(e) => {
                  if (item.isHotBoard && onHotBoardClick) {
                    e.preventDefault();
                    onHotBoardClick();
                  }
                }}
              >
                {item.isHotBoard ? (
                  <div className="flex flex-col max-h-[160px]">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 cursor-pointer hover:text-orange-400 transition-colors" onClick={(e) => { e.preventDefault(); onHotBoardClick?.(); }}>
                        <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center">
                          <i className="fas fa-fire text-xl text-orange-500"></i>
                        </div>
                        <span className="font-medium truncate text-base">知乎热榜</span>
                      </div>
                    </div>
                    <div className="space-y-2 mt-2 flex-grow">
                      {isLoadingHotBoard ? (
                        <div className="text-center py-2"><i className="fas fa-spinner fa-spin text-sm text-gray-400"></i></div>
                      ) : hotBoardData.length === 0 ? (
                        <div className="text-sm text-gray-300 text-center py-2">暂无数据</div>
                      ) : (
                        hotBoardData.slice(0, 5).map((h, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <span className="text-xs font-medium text-gray-400 w-4">{index + 1}</span>
                            <a href={h.url} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-200 hover:text-white truncate flex-grow">{h.title}</a>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4 w-full">
                      <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center">
                        {item.useFavicon ? (
                          <div className="relative w-10 h-10 rounded">
                            <img 
                              src={getFaviconUrl(item.url)} 
                              alt={`${item.name}图标`} 
                              className="w-full h-full rounded" 
                              onError={(e) => { (e.currentTarget as HTMLImageElement).src = getBetterFaviconUrl(item.url) || ''; }}
                            />
                          </div>
                        ) : (
                          <i className={`${item.icon || 'fas fa-link'} text-3xl`}></i>
                        )}
                      </div>
                      <span className="font-medium truncate text-base">{item.name}</span>
                    </div>
                  </div>
                )}
                {!item.isHotBoard && <a href={item.url} target="_blank" rel="noopener noreferrer" className="absolute inset-0 w-full h-full"></a>}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* 分页圆点 */}
      {getPaginationDots()}

      
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
      
      {/* 待办对话框 - 完全参照知乎热榜组件实现 */}
      <TodoDialog 
        isOpen={isTodoDialogOpen} 
        onClose={() => setIsTodoDialogOpen(false)}
        todos={activeTodoLink?.todoItems || []}
        onTodosChange={handleTodosChange}
      />
      
      {/* 电影日历对话框 */}
      <MovieCalendarDialog 
        isOpen={isMovieCalendarDialogOpen} 
        onClose={() => setIsMovieCalendarDialogOpen(false)} 
      />
    </div>
  );
}
