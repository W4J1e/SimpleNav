'use client';

interface FooterProps {
  onToggleAbout: () => void;
  onToggleTheme: () => void;
  darkMode: boolean;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

export default function Footer({
  onToggleAbout,
  onToggleTheme,
  darkMode,
  currentPage,
  totalPages,
  onPageChange
}: FooterProps) {
  const handleAboutClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onToggleAbout();
  };

  return (
    <footer className="bg-transparent text-white py-3 px-6 md:px-12">
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
                        ? 'bg-gray-600 scale-125'
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                    title={`第 ${pageNum} 页`}
                  />
                ));
              })()}
            </div>
          ) : null}
        </div>
        <div className="w-1/3 flex justify-end items-center gap-4">
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-full hover:bg-white/40 transition-all text-white hover:text-white/80"
            title={darkMode ? '切换到日间模式' : '切换到夜间模式'}
          >
            <i className={`fas ${darkMode ? 'fa-sun' : 'fa-moon'}`}></i>
          </button>
          <button
            onClick={handleAboutClick}
            className="p-2 rounded-full hover:bg-white/40 transition-all text-white hover:text-white/80"
            title="关于"
          >
            <i className="fas fa-circle-info"></i>
          </button>
        </div>
      </div>
    </footer>
  );
}
