'use client';

import Weather from './Weather';

interface UserInfo {
  displayName: string;
  email: string;
  photo?: string;
}

interface HeaderProps {
  onToggleAddLink: () => void;
  onToggleTheme: () => void;
  onToggleUnifiedSettings: () => void;
  darkMode: boolean;
  userInfo: UserInfo | null;
}

export default function Header({ onToggleAddLink, onToggleTheme, onToggleUnifiedSettings, darkMode, userInfo }: HeaderProps) {
  return (
    <header className="bg-transparent text-white w-full py-4 px-6 md:px-12 flex justify-between items-center transition-all duration-300 z-50">
      <div className="flex items-center">
        <Weather />
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleTheme}
          className="w-9 h-9 rounded-full border border-white/20 hover:bg-white/20 transition-all text-white flex items-center justify-center"
          title={darkMode ? '切换到日间模式' : '切换到夜间模式'}
        >
          <i className={`fas ${darkMode ? 'fa-sun' : 'fa-moon'} text-lg`}></i>
        </button>
        <button
          onClick={onToggleUnifiedSettings}
          className="w-9 h-9 rounded-full border border-white/20 hover:bg-white/20 transition-all flex items-center justify-center overflow-hidden"
          title="设置"
        >
          {userInfo?.photo ? (
            <img
              src={userInfo.photo}
              alt={userInfo.displayName || '用户头像'}
              className="w-[85%] h-[85%] rounded-full object-cover"
            />
          ) : (
            <i className="fas fa-user-circle text-xl text-white"></i>
          )}
        </button>
      </div>
    </header>
  );
}
