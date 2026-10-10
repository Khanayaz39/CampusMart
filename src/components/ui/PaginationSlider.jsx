import React from 'react';

export default function PaginationSlider({
    totalItems = 0,
    perPage = 10,
    currentPage = 1,
    sliderId = 'adminPageSlider',
    onPageChange
}) {
    const totalPages = Math.max(1, Math.ceil(totalItems / perPage));
    const safePage = Math.min(Math.max(1, currentPage), totalPages);
    const startIdx = (safePage - 1) * perPage;
    const endIdx = Math.min(startIdx + perPage, totalItems);

    if (totalItems <= perPage) {
        return null;
    }

    return (
        <div className="flex items-center justify-between flex-wrap gap-4 py-4 px-5 bg-background border-t border-border">
            <div className="text-[0.85rem] text-slate-500 font-medium">
                Showing <strong className="text-slate-900">{startIdx + 1}–{endIdx}</strong> of{' '}
                <strong className="text-slate-900">{totalItems}</strong>
            </div>

            <div className="flex items-center gap-3 flex-1 max-w-[380px] min-w-[240px]">
                <button
                    type="button"
                    className={`btn btn-outline btn-sm ${safePage <= 1 ? 'opacity-45 cursor-not-allowed' : ''}`}
                    disabled={safePage <= 1}
                    onClick={() => onPageChange && onPageChange(safePage - 1)}
                >
                    <i className="fas fa-chevron-left"></i> Prev
                </button>

                <div className="flex-1 flex flex-col items-center gap-1">
                    <input
                        type="range"
                        id={sliderId}
                        min="1"
                        max={totalPages}
                        value={safePage}
                        step="1"
                        className="w-full accent-primary cursor-pointer h-1.5"
                        onChange={(e) => onPageChange && onPageChange(Number(e.target.value))}
                        title="Slide to switch page"
                    />
                    <span className="text-xs font-bold text-primary">
                        Page {safePage} of {totalPages}
                    </span>
                </div>

                <button
                    type="button"
                    className={`btn btn-outline btn-sm ${safePage >= totalPages ? 'opacity-45 cursor-not-allowed' : ''}`}
                    disabled={safePage >= totalPages}
                    onClick={() => onPageChange && onPageChange(safePage + 1)}
                >
                    Next <i className="fas fa-chevron-right"></i>
                </button>
            </div>
        </div>
    );
}
