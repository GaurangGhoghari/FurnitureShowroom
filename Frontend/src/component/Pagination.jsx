const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  productsPerPage,
  onLimitChange,
  limitOptions = [3, 5, 10, 20],
  showLimitSelector = false,
}) => {
  const hasMultiplePages = totalPages > 1;

  if (!showLimitSelector && !hasMultiplePages) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4 border-t border-stone-200 bg-white px-4 py-5 sm:flex-row sm:items-center sm:justify-between">
      {/* Products per page: Admin only */}
      {showLimitSelector && (
        <div className="flex items-center justify-center gap-2">
          <label
            htmlFor="products-limit"
            className="text-xs font-semibold text-stone-800"
          >
            Products per page :
          </label>

          <select
            id="products-limit"
            value={productsPerPage}
            onChange={onLimitChange}
            className="rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs font-semibold text-stone-700 outline-none focus:border-amber-700"
          >
            {limitOptions.map((limit) => (
              <option key={limit} value={limit}>
                {limit}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Page numbers and navigation */}
      {hasMultiplePages && (
        <nav
          aria-label="Product pagination"
          className="flex flex-wrap items-center justify-center gap-2"
        >
          <button
            type="button"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="rounded-lg border border-stone-200 px-3 py-2 text-xs font-semibold text-stone-700 hover:border-amber-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>

          {Array.from(
            { length: totalPages },
            (_, index) => index + 1
          ).map((page) => (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              disabled={page === currentPage}
              aria-current={
                page === currentPage ? "page" : undefined
              }
              className={
                currentPage === page
                  ? "min-w-10 rounded-lg border border-amber-800 bg-amber-800 px-3 py-2 text-xs font-bold text-white"
                  : "min-w-10 rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs font-semibold text-stone-700 hover:border-amber-700"
              }
            >
              {page}
            </button>
          ))}

          <button
            type="button"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="rounded-lg border border-stone-200 px-3 py-2 text-xs font-semibold text-stone-700 hover:border-amber-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </nav>
      )}
    </div>
  );
};

export default Pagination;