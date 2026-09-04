import React, { useMemo } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

export default function DataTable({
  data = [],
  columns = [],

  loading = false,

  // Server-side pagination
  pagination = {
    pageIndex: 0,
    pageSize: 10,
  },

  setPagination,

  // Total records from backend
  totalRows = 0,

  emptyMessage = "No data found",

  pageSizes = [5, 10, 20, 50],

  // Row selection
  rowSelection = {},
  setRowSelection,

  // Row click
  onRowClick,

  // Optional
  getRowId,

  className = "",
}) {
  /*
   * =========================================================
   * SAFE VALUES
   * =========================================================
   */

  const pageIndex = pagination?.pageIndex ?? 0;
  const pageSize = pagination?.pageSize ?? 10;

  const safeTotalRows = Math.max(
    0,
    Number(totalRows) || 0
  );

  const totalPages = Math.max(
    1,
    Math.ceil(safeTotalRows / pageSize)
  );

  /*
   * Prevent invalid page indexes.
   */
  const safePageIndex = Math.min(
    pageIndex,
    Math.max(0, totalPages - 1)
  );

  /*
   * =========================================================
   * TABLE
   * =========================================================
   */

  const table = useReactTable({
    data,
    columns,

    state: {
      pagination: {
        pageIndex: safePageIndex,
        pageSize,
      },

      rowSelection,
    },

    /*
     * IMPORTANT:
     * We are doing pagination on the backend.
     */
    manualPagination: true,

    /*
     * Tell TanStack the total number of backend rows.
     */
    rowCount: safeTotalRows,

    /*
     * Row selection is optional.
     */
    enableRowSelection: Boolean(setRowSelection),

    /*
     * Selection handler only exists when provided.
     */
    onRowSelectionChange: setRowSelection,

    /*
     * Pagination changes are handled by the parent.
     */
    onPaginationChange: setPagination,

    getCoreRowModel: getCoreRowModel(),

    /*
     * Allows stable row IDs from backend.
     */
    getRowId,
  });

  /*
   * =========================================================
   * DISPLAY RANGE
   * =========================================================
   */

  const startItem =
    safeTotalRows === 0
      ? 0
      : safePageIndex * pageSize + 1;

  const endItem =
    safeTotalRows === 0
      ? 0
      : Math.min(
          (safePageIndex + 1) * pageSize,
          safeTotalRows
        );

  /*
   * =========================================================
   * PAGE NUMBERS
   * =========================================================
   */

  const pageNumbers = useMemo(() => {
    const current = safePageIndex + 1;

    if (totalPages <= 5) {
      return Array.from(
        { length: totalPages },
        (_, index) => index + 1
      );
    }

    if (current <= 3) {
      return [1, 2, 3, 4, "...", totalPages];
    }

    if (current >= totalPages - 2) {
      return [
        1,
        "...",
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }

    return [
      1,
      "...",
      current - 1,
      current,
      current + 1,
      "...",
      totalPages,
    ];
  }, [safePageIndex, totalPages]);

  /*
   * =========================================================
   * PAGINATION HELPERS
   * =========================================================
   */

  const goToPage = (page) => {
    if (!setPagination) return;

    const nextPage = Math.min(
      Math.max(page, 0),
      totalPages - 1
    );

    setPagination((previous) => ({
      ...previous,
      pageIndex: nextPage,
    }));
  };

  const changePageSize = (size) => {
    if (!setPagination) return;

    setPagination((previous) => ({
      ...previous,
      pageIndex: 0,
      pageSize: Number(size),
    }));
  };

  /*
   * =========================================================
   * RENDER
   * =========================================================
   */

  return (
   <div
  className={[
    "data-table",
    className,
  ]
    .filter(Boolean)
    .join(" ")}
>
      {/* =====================================================
          TABLE
      ===================================================== */}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead className="bg-slate-50 border-b border-slate-100">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    scope="col"
                    className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500 whitespace-nowrap"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody className="divide-y divide-slate-100">
            {/* =================================================
                LOADING
            ================================================= */}

            {loading ? (
              <LoadingRows
                columnCount={columns.length}
              />
            ) : table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  onClick={() =>
                    onRowClick?.(row.original)
                  }
                  className={[
                    "group",
                    "transition-colors",
                    onRowClick
                      ? "cursor-pointer hover:bg-slate-50"
                      : "hover:bg-slate-50",
                  ].join(" ")}
                >
                  {row
                    .getVisibleCells()
                    .map((cell) => (
                      <td
                        key={cell.id}
                        className="px-6 py-4 align-middle"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                </tr>
              ))
            ) : (
              /* ===============================================
                 EMPTY
              =============================================== */

              <tr>
                <td
                  colSpan={Math.max(columns.length, 1)}
                  className="px-6 py-12 text-center"
                >
                  <div className="flex flex-col items-center justify-center">
                    <span
                      className="material-symbols-outlined text-4xl text-slate-300 mb-3"
                      aria-hidden="true"
                    >
                      inbox
                    </span>

                    <p className="text-sm font-medium text-slate-600">
                      {emptyMessage}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* =====================================================
          PAGINATION
      ===================================================== */}

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 px-6 py-4 border-t border-slate-100 bg-slate-50">
        {/* ===================================================
            LEFT
        =================================================== */}

        <div className="flex items-center gap-4 flex-wrap">
          <p className="text-sm text-slate-500">
            Showing{" "}
            <span className="font-semibold text-slate-900">
              {startItem}
              {safeTotalRows > 0 && `-${endItem}`}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-slate-900">
              {safeTotalRows}
            </span>
          </p>

          <label className="flex items-center gap-2 text-sm text-slate-500">
            <span className="sr-only">
              Rows per page
            </span>

            <select
              value={pageSize}
              onChange={(event) =>
                changePageSize(event.target.value)
              }
              disabled={loading}
              className="h-9 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-50"
            >
              {pageSizes.map((size) => (
                <option
                  key={size}
                  value={size}
                >
                  {size}
                </option>
              ))}
            </select>

            <span>per page</span>
          </label>
        </div>

        {/* ===================================================
            RIGHT
        =================================================== */}

        <div className="flex items-center gap-3">
          <div className="text-sm text-slate-500 whitespace-nowrap">
            Page{" "}
            <span className="font-semibold text-slate-900">
              {safePageIndex + 1}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-slate-900">
              {totalPages}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {/* Previous */}

            <button
              type="button"
              onClick={() =>
                goToPage(safePageIndex - 1)
              }
              disabled={
                loading ||
                safePageIndex === 0
              }
              aria-label="Previous page"
              className="h-9 w-9 rounded-lg flex items-center justify-center text-slate-600 hover:bg-white hover:shadow-sm disabled:opacity-40 disabled:pointer-events-none transition"
            >
              <span
                className="material-symbols-outlined text-[20px]"
                aria-hidden="true"
              >
                chevron_left
              </span>
            </button>

            {/* Page numbers */}

            <div className="hidden sm:flex items-center gap-1">
              {pageNumbers.map(
                (page, index) =>
                  page === "..." ? (
                    <span
                      key={`ellipsis-${index}`}
                      className="h-9 w-7 flex items-center justify-center text-slate-400"
                    >
                      ...
                    </span>
                  ) : (
                    <button
                      key={page}
                      type="button"
                      onClick={() =>
                        goToPage(page - 1)
                      }
                      disabled={loading}
                      aria-label={`Go to page ${page}`}
                      aria-current={
                        page ===
                        safePageIndex + 1
                          ? "page"
                          : undefined
                      }
                      className={[
                        "h-9",
                        "min-w-9",
                        "px-2",
                        "rounded-lg",
                        "text-sm",
                        "font-medium",
                        "transition",

                        page ===
                        safePageIndex + 1
                          ? "bg-primary text-white shadow-sm"
                          : "text-slate-600 hover:bg-white hover:shadow-sm",

                        "disabled:opacity-40",
                      ].join(" ")}
                    >
                      {page}
                    </button>
                  )
              )}
            </div>

            {/* Next */}

            <button
              type="button"
              onClick={() =>
                goToPage(safePageIndex + 1)
              }
              disabled={
                loading ||
                safePageIndex >= totalPages - 1
              }
              aria-label="Next page"
              className="h-9 w-9 rounded-lg flex items-center justify-center text-slate-600 hover:bg-white hover:shadow-sm disabled:opacity-40 disabled:pointer-events-none transition"
            >
              <span
                className="material-symbols-outlined text-[20px]"
                aria-hidden="true"
              >
                chevron_right
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===========================================================
   LOADING ROWS
=========================================================== */

function LoadingRows({
  columnCount,
}) {
  const rows = Array.from(
    { length: 5 },
    (_, index) => index
  );

  return (
    <>
      {rows.map((row) => (
        <tr key={row}>
          {Array.from(
            {
              length: Math.max(
                columnCount,
                1
              ),
            },
            (_, column) => (
              <td
                key={column}
                className="px-6 py-4"
              >
                <div className="h-4 w-full max-w-[180px] bg-slate-100 rounded animate-pulse" />
              </td>
            )
          )}
        </tr>
      ))}
    </>
  );
}