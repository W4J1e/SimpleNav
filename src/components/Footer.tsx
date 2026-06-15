'use client';

interface FooterProps {
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

export default function Footer({
  currentPage,
  totalPages,
  onPageChange
}: FooterProps) {
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
        <div className="w-1/3"></div>
      </div>
    </footer>
  );
}
