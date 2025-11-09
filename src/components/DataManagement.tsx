'use client';

import { useState } from 'react';
import { Link } from '@/types';
import { getLinks, saveLinks, getSettings, saveSettings } from '@/lib/storage';

interface DataManagementProps {
  onLinksChange: (links: Link[]) => void;
  onSettingsChange: (settings: any) => void;
}

export default function DataManagement({ onLinksChange, onSettingsChange }: DataManagementProps) {
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // 导出数据
  const handleExportData = () => {
    const links = getLinks();
    const settings = getSettings();
    
    const dataStr = JSON.stringify({ links, settings }, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `nav-backup-${new Date().toISOString().slice(0, 10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // 导入数据
  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsImporting(true);
    setImportStatus('正在导入数据...');
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target?.result as string);
        
        // 导入链接
        if (importedData.links && Array.isArray(importedData.links)) {
          saveLinks(importedData.links);
          onLinksChange(importedData.links);
        }
        
        // 导入设置
        if (importedData.settings) {
          saveSettings(importedData.settings);
          onSettingsChange(importedData.settings);
        }
        
        setImportStatus('数据导入成功');
        setTimeout(() => setImportStatus(null), 3000);
      } catch (error) {
        console.error('导入失败:', error);
        setImportStatus('导入失败：无效的数据格式');
        setTimeout(() => setImportStatus(null), 3000);
      } finally {
        setIsImporting(false);
      }
    };
    
    reader.onerror = () => {
      setImportStatus('文件读取失败');
      setTimeout(() => setImportStatus(null), 3000);
      setIsImporting(false);
    };
    
    reader.readAsText(file);
    
    // 重置文件输入，以便可以再次选择同一文件
    e.target.value = '';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-4">
      <h3 className="text-lg font-medium mb-4">数据管理</h3>
      
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            导出您的设置和链接数据，以便备份或迁移到其他设备。
          </p>
          <button 
            onClick={handleExportData}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm"
          >
            导出数据
          </button>
        </div>
        
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            从备份文件中导入设置和链接数据。
          </p>
          <label className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded text-sm cursor-pointer inline-block">
            {isImporting ? '导入中...' : '导入数据'}
            <input 
              type="file" 
              accept=".json" 
              onChange={handleImportData}
              className="hidden" 
              disabled={isImporting}
            />
          </label>
        </div>
        
        {importStatus && (
          <div className={`p-2 rounded text-sm ${
            importStatus.includes('成功') 
              ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' 
              : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
          }`}>
            {importStatus}
          </div>
        )}
      </div>
    </div>
  );
}