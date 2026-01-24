'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Header from '@/components/Header';
import Search from '@/components/Search';
import LinksGrid from '@/components/LinksGrid';
import LinkForm from '@/components/LinkForm';
import Footer from '@/components/Footer';
import UnifiedSettings from '@/components/UnifiedSettings';
import AboutDialog from '@/components/AboutDialog';
import HelpDialog from '@/components/HelpDialog';
import ZhihuHotBoardDialog from '@/components/ZhihuHotBoardDialog';
import { Link, Settings } from '@/types';
import { getLinks, saveLinks, getSettings, saveSettings, useOneDriveStorage, setUseOneDriveStorage, syncFromOneDrive, syncData, defaultSettings } from '@/lib/storage';
import { oneDriveStorage } from '@/lib/onedrive-storage';

import { applyAppBackground } from '@/lib/utils';

export default function HomePage() {
  const [links, setLinks] = useState<Link[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // 使用useRef追踪是否已初始化，避免重复同步
  const wasInitializedRef = useRef(false);

  const [isLinkFormOpen, setIsLinkFormOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<Link | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isUnifiedSettingsOpen, setIsUnifiedSettingsOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isZhihuHotBoardOpen, setIsZhihuHotBoardOpen] = useState(false);
  const [showAuthExpiredToast, setShowAuthExpiredToast] = useState(false);
  const [paginationState, setPaginationState] = useState<{ currentPage: number; totalPages: number }>({
    currentPage: 1,
    totalPages: 1
  });

  // 从links中提取所有唯一分类
  const categories = useMemo(() => {
    const uniqueCategories = new Set<string>();
    links.forEach(link => {
      if (link.category) {
        uniqueCategories.add(link.category);
      }
    });
    // 添加默认分类"未分类"，并排序
    uniqueCategories.add('未分类');
    return Array.from(uniqueCategories).sort();
  }, [links]);

  const handlePaginationChange = (page: number, totalPages: number) => {
    setPaginationState({ currentPage: page, totalPages });
  };

  
  // 页面加载时立即检查认证状态，只检查一次
  useEffect(() => {
    const checkInitialAuthStatus = async () => {
      try {
        const response = await fetch('/api/auth/status', {
          credentials: 'include',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate'
          }
        });
        
        // 无论响应状态如何，都处理结果
        const data = await response.json();
        
        // 检查认证状态是否有变化
        const wasAuthenticated = isAuthenticated;
        
        if (data.authenticated && data.accessToken && data.refreshToken) {
          // 认证有效，更新token和状态
          oneDriveStorage.setUserToken(data.accessToken, data.refreshToken);
          setIsAuthenticated(true);
          
          // 无论是否启用OneDrive存储，只要认证成功，就执行双向同步
          // 但不等待同步完成，在后台进行
          if (!wasAuthenticated || !wasInitializedRef.current) {
            // 在后台执行双向同步，不阻塞页面渲染
            syncData().then(hasChanges => {
              if (hasChanges) {
                // 同步成功后更新页面数据
                const currentLinks = getLinks();
                setLinks(currentLinks);
                // 仅当设置发生变化时才更新settings状态
                const newSettings = getSettings();
                if (newSettings && JSON.stringify(newSettings) !== JSON.stringify(settings)) {
                  setSettings(newSettings);
                }
              }
            });
          }
        } else {
          // 认证无效或已过期，清除状态
          oneDriveStorage.clearUserToken();
          
          // 如果之前是认证状态，或者首次打开网页没有登录，显示提示
          if (wasAuthenticated || !wasInitializedRef.current) {
            setUseOneDriveStorage(false);
            // 显示登录失效提示
            setShowAuthExpiredToast(true);
            // 3秒后自动关闭提示
            setTimeout(() => {
              setShowAuthExpiredToast(false);
            }, 3000);
          }
          
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('检查认证状态失败:', error);
        // 发生错误时，认为认证可能已失效，清除状态
        oneDriveStorage.clearUserToken();
        setIsAuthenticated(false);
        // 重置OneDrive存储设置
        setUseOneDriveStorage(false);
      }
    };
    
    // 立即执行认证检查
    checkInitialAuthStatus().then(() => {
      wasInitializedRef.current = true;
    });
    
    // 移除定期检查，只在首次打开网页时检查一次
  }, []); // 移除 settings 依赖，避免循环触发

  // 监听分类变化事件
  useEffect(() => {
    const handleCategoryChange = (e: CustomEvent) => {
      setSelectedCategory(e.detail);
    };
    
    window.addEventListener('categoryChange', handleCategoryChange as EventListener);
    
    return () => {
      window.removeEventListener('categoryChange', handleCategoryChange as EventListener);
    };
  }, []);
  
  // 初始化数据
  useEffect(() => {
    const initializeData = async () => {
      // 检查URL参数中的认证状态
      const urlParams = new URLSearchParams(window.location.search);
      const authParam = urlParams.get('auth');
      
      if (authParam === 'success') {
        try {
          // 认证成功后，尝试从服务器获取最新的token
          const response = await fetch('/api/auth/status', { 
            credentials: 'include',
            headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
          });
          if (response.ok) {
            const data = await response.json();
            if (data.authenticated && data.accessToken && data.refreshToken) {
              oneDriveStorage.setUserToken(data.accessToken, data.refreshToken);
              setIsAuthenticated(true);
            }
          }
        } catch (error) {
          console.error('认证回调处理失败:', error);
        }
        // 移除参数
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
      }
      
      // 1. 首先使用本地存储加载数据
      let loadedLinks = getLinks();
      let loadedSettings = getSettings() || defaultSettings;
      
      // 2. 确保links是合法数组并去重
      if (Array.isArray(loadedLinks)) {
        const seen = new Set();
        loadedLinks = loadedLinks.filter(link => {
          if (!link.id || seen.has(link.id)) return false;
          seen.add(link.id);
          return true;
        });
      } else {
        loadedLinks = [];
      }

      // 3. 检查并强制注入必要的基础组件卡片（如果列表中不存在）
      const essentialCards = [
        { id: 'zhihu-hot-board', name: '知乎热榜', url: '#', icon: 'fa-fire', category: '常用', useFavicon: false, isHotBoard: true },
        { id: 'todo-card', name: '待办事项', url: '#', icon: 'fa-list-check', category: '常用', useFavicon: false, isTodo: true, todoItems: [] },
        { id: 'movie-calendar', name: '电影日历', url: '#', icon: 'fa-film', category: '常用', useFavicon: false, isMovieCalendar: true }
      ];

      essentialCards.forEach(card => {
        if (!loadedLinks.some(l => l.id === card.id)) {
          loadedLinks = [card as Link, ...loadedLinks];
        }
      });
      
      // 4. 立即应用数据
      setLinks(loadedLinks);
      setSettings(loadedSettings);
    };
    
    initializeData();
  }, []);

  // 监听settings变化，应用背景和主题
  useEffect(() => {
    if (settings) {
      applyAppBackground(settings);
      
      // 应用主题
      if (settings.darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [settings]);

  

  // 切换统一设置面板
  const toggleUnifiedSettings = () => {
    setIsUnifiedSettingsOpen(!isUnifiedSettingsOpen);
  };

  // 切换关于对话框
  const toggleAbout = () => {
    setIsAboutOpen(!isAboutOpen);
  };

  // 切换链接表单
  const toggleLinkForm = () => {
    setIsLinkFormOpen(!isLinkFormOpen);
    if (!isLinkFormOpen) {
      setEditingLink(null);
    }
  };

  // 切换主题
  const toggleTheme = () => {
    if (!settings) return;
    
    const newSettings = { ...settings, darkMode: !settings.darkMode };
    setSettings(newSettings);
    saveSettings(newSettings);
    
    // 应用主题变化
    if (newSettings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // 保存设置
  const handleSaveSettings = (newSettings: Settings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
    applyAppBackground(newSettings);
  };

  // 保存链接
  const handleSaveLink = (link: Link) => {
    let newLinks: Link[];
    
    if (editingLink) {
      // 编辑现有链接（热榜卡片不允许编辑）
      if (!link.isHotBoard) {
        newLinks = links.map(l => l.id === link.id ? link : l);
      } else {
        newLinks = links;
      }
    } else {
      // 添加新链接
      newLinks = [...links, link];
    }
    
    setLinks(newLinks);
    saveLinks(newLinks);
  };

  // 编辑链接
  const handleEditLink = (link: Link) => {
    setEditingLink(link);
    setIsLinkFormOpen(true);
  };

  // 删除链接（热榜卡片不允许删除）
  const handleDeleteLink = (link: Link) => {
    if (link.isHotBoard) return;
    
    if (window.confirm(`确定要删除链接"${link.name}"吗？`)) {
      const newLinks = links.filter(l => l.id !== link.id);
      setLinks(newLinks);
      saveLinks(newLinks);
    }
  };
  
  // 重新排序链接
  const handleLinksReorder = (newLinks: Link[]) => {
    setLinks(newLinks);
    saveLinks(newLinks);
  };

  // 切换知乎热榜对话框
  const toggleZhihuHotBoard = () => {
    setIsZhihuHotBoardOpen(!isZhihuHotBoardOpen);
  };



  // 切换搜索引擎
  const handleSearchEngineChange = (engine: 'bing' | 'google') => {
    if (!settings) return;
    
    const newSettings = { ...settings, searchEngine: engine };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  if (!settings) {
    return <div className="flex items-center justify-center min-h-screen">加载中...</div>;
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header 
        onToggleAddLink={toggleLinkForm}
        onToggleTheme={toggleTheme}
        onToggleUnifiedSettings={toggleUnifiedSettings}
        darkMode={settings.darkMode}
      />
      
      <main className="flex-grow p-4 md:p-12 pb-2 flex flex-col items-center overflow-hidden">
        <Search 
          searchEngine={settings.searchEngine}
          onSearchEngineChange={handleSearchEngineChange}
        />
        
        <div className="w-full max-w-7xl mt-2 md:mt-8 flex-grow overflow-hidden flex flex-col">

          {/* 链接网格 - 包含所有卡片，包括待办组件 */}
          <LinksGrid
            links={links}
            layout={settings.layout}
            enabledComponents={settings.enabledComponents}
            selectedCategory={selectedCategory}
            onEditLink={handleEditLink}
            onDeleteLink={handleDeleteLink}
            onAddLink={toggleLinkForm}
            onLinksReorder={handleLinksReorder}
            onHotBoardClick={toggleZhihuHotBoard}
            onCurrentPageChange={handlePaginationChange}
          />
        </div>
      </main>
      
      <Footer
        onToggleUnifiedSettings={toggleUnifiedSettings}
        onToggleAbout={toggleAbout}
        onToggleHelp={() => setIsHelpOpen(true)}
        currentPage={paginationState.currentPage}
        totalPages={paginationState.totalPages}
        onPageChange={(page) => {
          // 通过自定义事件通知 LinksGrid 翻页
          const event = new CustomEvent('pageChange', { detail: page });
          window.dispatchEvent(event);
        }}
      />

      
      <LinkForm 
        isOpen={isLinkFormOpen}
        onClose={toggleLinkForm}
        onSave={handleSaveLink}
        link={editingLink}
        categories={categories}
      />
      
      {/* 统一设置面板 */}
      <UnifiedSettings 
        isOpen={isUnifiedSettingsOpen}
        onClose={toggleUnifiedSettings}
        onLinksChange={setLinks}
        onSettingsChange={setSettings}
      />
      
      {/* 关于对话框 */}
      <AboutDialog 
        isOpen={isAboutOpen}
        onClose={toggleAbout}
      />
      
      {/* 帮助对话框 */}
      <HelpDialog 
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
      
      {/* 知乎热榜对话框 */}
      <ZhihuHotBoardDialog 
        isOpen={isZhihuHotBoardOpen}
        onClose={() => setIsZhihuHotBoardOpen(false)}
      />
      
      {/* 登录失效提示 */}
      {showAuthExpiredToast && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in-out">
          <div className="flex items-center gap-2">
            <i className="fas fa-exclamation-circle"></i>
            <span>未登陆或登陆已失效，请重新登陆</span>
            <button 
              onClick={() => setShowAuthExpiredToast(false)}
              className="ml-2 text-white hover:text-gray-200"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}