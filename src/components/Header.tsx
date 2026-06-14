'use client';

import Weather from './Weather';

interface UserInfo {
  displayName: string;
  email: string;
  photo?: string;
}

interface HeaderProps {
  onToggleAddLink: () => void;
  onToggleUnifiedSettings: () => void;
  userInfo: UserInfo | null;
}

export default function Header({ onToggleAddLink, onToggleUnifiedSettings, userInfo }: HeaderProps) {
  return (
    <header className="bg-transparent text-gray-700 w-full py-4 px-6 md:px-12 flex justify-between items-center transition-all duration-300 z-50">
      <div className="flex items-center">
        <Weather />
      </div>
      <div className="flex items-center">
        <button
          onClick={onToggleUnifiedSettings}
          className="p-1 rounded-full hover:bg-white/40 transition-all"
          title="设置"
        >
          {userInfo?.photo ? (
            <img
              src={userInfo.photo}
              alt={userInfo.displayName || '用户头像'}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-white/20 hover:ring-white/40 transition-all"
            />
          ) : (
            <i className="fas fa-user-circle text-2xl text-white hover:text-white/80 transition-all"></i>
          )}
        </button>
      </div>
    </header>
  );
}
