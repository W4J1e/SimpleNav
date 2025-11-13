'use client';

import { useState, useEffect } from 'react';
import { useOneDriveStorage, setUseOneDriveStorage, syncFromOneDrive, syncToOneDrive } from '@/lib/storage';
import { oneDriveStorage } from '@/lib/onedrive-storage';

export default function StorageSettings() {
  const [useOneDrive, setUseOneDrive] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // 检查当前存储设置
    setUseOneDrive(useOneDriveStorage());
    
    // 检查OneDrive认证状态
    const checkAuthStatus = async () => {
      // 验证令牌有效性
      const isValid = await oneDriveStorage.validateAndRefreshToken();
      setIsAuthenticated(isValid);
    };
    
    checkAuthStatus();
  }, []);

  const handleToggleStorage = async () => {
    const newUseOneDrive = !useOneDrive;
    
    if (newUseOneDrive && !isAuthenticated) {
      setSyncStatus('请先登录OneDrive');
      setTimeout(() => setSyncStatus(null), 3000);
      return;
    }
    
    setUseOneDrive(newUseOneDrive);
    setUseOneDriveStorage(newUseOneDrive);
    
    if (newUseOneDrive) {
      // 切换到OneDrive存储，尝试同步数据
      await handleSyncFromOneDrive();
    } else {
      setSyncStatus('已切换到本地存储');
      setTimeout(() => setSyncStatus(null), 3000);
    }
  };

  const handleSyncFromOneDrive = async () => {
    if (!isAuthenticated) {
      setSyncStatus('请先登录OneDrive');
      setTimeout(() => setSyncStatus(null), 3000);
      return;
    }
    
    setIsSyncing(true);
    setSyncStatus('正在从OneDrive同步数据...');
    
    try {
      const success = await syncFromOneDrive();
      if (success) {
        setSyncStatus('从OneDrive同步数据成功');
        // 刷新页面以显示新数据
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setSyncStatus('从OneDrive同步数据失败');
      }
    } catch (error) {
      console.error('同步失败:', error);
      setSyncStatus('同步过程中发生错误');
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncStatus(null), 3000);
    }
  };

  const handleSyncToOneDrive = async () => {
    if (!isAuthenticated) {
      setSyncStatus('请先登录OneDrive');
      setTimeout(() => setSyncStatus(null), 3000);
      return;
    }
    
    setIsSyncing(true);
    setSyncStatus('正在同步数据到OneDrive...');
    
    try {
      const success = await syncToOneDrive();
      if (success) {
        setSyncStatus('同步数据到OneDrive成功');
      } else {
        setSyncStatus('同步数据到OneDrive失败');
      }
    } catch (error) {
      console.error('同步失败:', error);
      setSyncStatus('同步过程中发生错误');
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncStatus(null), 3000);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-4">
      <h3 className="text-lg font-medium mb-4">存储设置</h3>
      
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            使用OneDrive同步
          </label>
          <button
            onClick={handleToggleStorage}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              useOneDrive ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                useOneDrive ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        
        <p className="text-xs text-gray-500 dark:text-gray-400">
          启用后，您的设置和链接将同步到OneDrive，实现跨设备访问
        </p>
        
        {!isAuthenticated && (
          <p className="text-xs text-amber-500 mt-1">
            需要先登录OneDrive才能使用同步功能
          </p>
        )}
      </div>
      
      {useOneDrive && isAuthenticated && (
        <div className="flex space-x-2">
          <button
            onClick={handleSyncFromOneDrive}
            disabled={isSyncing}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-3 py-1 rounded text-sm"
          >
            {isSyncing ? '同步中...' : '从OneDrive同步'}
          </button>
          
          <button
            onClick={handleSyncToOneDrive}
            disabled={isSyncing}
            className="bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white px-3 py-1 rounded text-sm"
          >
            {isSyncing ? '同步中...' : '同步到OneDrive'}
          </button>
        </div>
      )}
      
      {syncStatus && (
        <div className={`mt-3 p-2 rounded text-sm relative flex justify-between items-center ${
          syncStatus.includes('成功') 
            ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' 
            : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
        }`}>
          <span>{syncStatus}</span>
          <button 
            onClick={() => setSyncStatus(null)}
            className="ml-2 text-current opacity-70 hover:opacity-100 focus:outline-none"
            aria-label="关闭"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}