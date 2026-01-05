'use client';

interface FooterProps {
  onToggleUnifiedSettings: () => void;
  onToggleAbout: () => void;
  onToggleHelp: () => void;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

export default function Footer({
  onToggleUnifiedSettings,
  onToggleAbout,
  onToggleHelp,
  currentPage,
  totalPages,
  onPageChange
}: FooterProps) {
  const handleAboutClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onToggleAbout();
  };

  const handleHelpClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onToggleHelp();
  };

  return (
    <footer className="bg-transparent text-white/70 py-3 px-6 md:px-12">
      <div className="flex justify-between items-center w-full">
        <div className="w-1/3"></div>
        <div className="flex-1 flex justify-center items-center">
          {totalPages && totalPages > 1 && onPageChange && currentPage !== undefined ? (
            <div className="flex justify-center items-center gap-2">
              {(() => {
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

                return displayPages.map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => onPageChange(pageNum)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      currentPage === pageNum
                        ? 'bg-white scale-125'
                        : 'bg-white/30 hover:bg-white/50'
                    }`}
                    title={`第 ${pageNum} 页`}
                  />
                ));
              })()}
            </div>
          ) : null}
        </div>
        <div className="w-1/3 flex justify-end gap-4">
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