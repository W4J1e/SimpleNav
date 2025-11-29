'use client';

interface FooterProps {
  onToggleUnifiedSettings: () => void;
  onToggleAbout: () => void;
  onToggleHelp: () => void;
}

export default function Footer({ onToggleUnifiedSettings, onToggleAbout, onToggleHelp }: FooterProps) {
  const handleAboutClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onToggleAbout();
  };

  const handleHelpClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onToggleHelp();
  };

  return (
    <footer className="bg-transparent text-white/70 py-4 px-6 md:px-12">
      <div className="flex justify-between items-center">
        <div></div>
        <div className="flex gap-4">
          <button 
            onClick={handleAboutClick}
            className="hover:text-white transition-all text-sm bg-transparent border-none cursor-pointer"
          >
            关于
          </button>
          <button 
            onClick={onToggleUnifiedSettings}
            className="hover:text-white transition-all text-sm bg-transparent border-none cursor-pointer"
          >
            设置
          </button>
          <button 
            onClick={handleHelpClick}
            className="hover:text-white transition-all text-sm bg-transparent border-none cursor-pointer"
          >
            帮助
          </button>
        </div>
      </div>
    </footer>
  );
}