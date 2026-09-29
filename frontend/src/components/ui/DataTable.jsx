import { useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

export default function DataTable({
  data = [],
  columns = [],
  loading = false,

  // Controlled Pagination
  pagination: controlledPagination,
  setPagination: setControlledPagination,

  // Server-side flag (Default false = pure client-side auto-pagination)
  manualPagination = false,
  totalRows,

  emptyMessage = "No data found",
  pageSizes = [5, 10, 20, 50],

  // Row selection
  rowSelection = {},
  setRowSelection,

  // Row click
  onRowClick,
  getRowId,
  className = "",
  hidePagination = false,
}) {
  // 1. Uncontrolled fallback agar parent ne pagination state pass na kiya ho
  const [internalPagination, setInternalPagination] = useState({
    pageIndex: 0,
    pageSize: 5, // Default 5 per page
  });

  const isControlled = Boolean(controlledPagination && setControlledPagination);
  const activePagination = isControlled
    ? controlledPagination
    : internalPagination;

  const pageIndex = Number(activePagination?.pageIndex ?? 0);
  const pageSize = Number(activePagination?.pageSize ?? 5);

  const safeData = useMemo(() => (Array.isArray(data) ? data : []), [data]);

  // 2. Total Rows calculation
  const safeTotalRows =
    manualPagination && totalRows !== undefined && totalRows !== null
      ? Number(totalRows)
      : safeData.length;

  const totalPages = Math.max(1, Math.ceil(safeTotalRows / pageSize));
  const safePageIndex = Math.min(pageIndex, Math.max(0, totalPages - 1));

  // 3. Client-side Slicing (Sirf 5 records dikhega agar pageSize 5 hai)
  const paginatedData = useMemo(() => {
    if (manualPagination) {
      return safeData;
    }
    const start = safePageIndex * pageSize;
    return safeData.slice(start, start + pageSize);
  }, [safeData, manualPagination, safePageIndex, pageSize]);

  // 4. Update Handler
  const updatePagination = (updater) => {
    const nextState =
      typeof updater === "function"
        ? updater({ pageIndex: safePageIndex, pageSize })
        : updater;

    if (isControlled) {
      setControlledPagination(nextState);
    } else {
      setInternalPagination(nextState);
    }
  };

  // 5. Table Instance
  const table = useReactTable({
    data: paginatedData,
    columns,
    state: {
      pagination: {
        pageIndex: safePageIndex,
        pageSize,
      },
      rowSelection,
    },
    manualPagination: true,
    rowCount: safeTotalRows,
    enableRowSelection: Boolean(setRowSelection),
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getRowId,
  });

  // 6. Helpers
  const goToPage = (target) => {
    const nextPage = Math.min(Math.max(target, 0), totalPages - 1);
    updatePagination((prev) => ({
      ...prev,
      pageIndex: nextPage,
    }));
  };

  const changePageSize = (newSize) => {
    updatePagination({
      pageIndex: 0,
      pageSize: Number(newSize),
    });
  };

  const startItem =
    safeTotalRows === 0 ? 0 : safePageIndex * pageSize + 1;
  const endItem =
    safeTotalRows === 0
      ? 0
      : Math.min((safePageIndex + 1) * pageSize, safeTotalRows);

  const rangeText =
    safeTotalRows === 0
      ? "0"
      : startItem === endItem
      ? `${startItem}`
      : `${startItem}-${endItem}`;

  const pageNumbers = useMemo(() => {
    const current = safePageIndex + 1;
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (current <= 3) return [1, 2, 3, 4, "...", totalPages];
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
    return [1, "...", current - 1, current, current + 1, "...", totalPages];
  }, [safePageIndex, totalPages]);

  return (
    <div className={["data-table", className].filter(Boolean).join(" ")}>
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
            {loading ? (
              <LoadingRows columnCount={columns.length} />
            ) : table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => onRowClick?.(row.original)}
                  className={[
                    "group transition-colors",
                    onRowClick
                      ? "cursor-pointer hover:bg-slate-50"
                      : "hover:bg-slate-50",
                  ].join(" ")}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-6 py-4 align-middle">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
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

      {!hidePagination && (
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 px-6 py-4 border-t border-slate-100 bg-slate-50">
          <div className="flex items-center gap-4 flex-wrap">
            <p className="text-sm text-slate-500">
              Showing{" "}
              <span className="font-semibold text-slate-900">{rangeText}</span>{" "}
              of{" "}
              <span className="font-semibold text-slate-900">
                {safeTotalRows}
              </span>
            </p>

            <label className="flex items-center gap-2 text-sm text-slate-500">
              <select
                value={pageSize}
                onChange={(e) => changePageSize(e.target.value)}
                disabled={loading}
                className="h-9 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer"
              >
                {pageSizes.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
              <span>per page</span>
            </label>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-sm text-slate-500 whitespace-nowrap">
              Page{" "}
              <span className="font-semibold text-slate-900">
                {safePageIndex + 1}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-slate-900">{totalPages}</span>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => goToPage(safePageIndex - 1)}
                disabled={loading || safePageIndex === 0}
                className="h-9 w-9 rounded-lg flex items-center justify-center text-slate-600 hover:bg-white hover:shadow-sm disabled:opacity-40 disabled:pointer-events-none transition cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">
                  chevron_left
                </span>
              </button>

              <div className="hidden sm:flex items-center gap-1">
                {pageNumbers.map((page, index) =>
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
                      onClick={() => goToPage(page - 1)}
                      disabled={loading}
                      className={[
                        "h-9 min-w-9 px-2 rounded-lg text-sm font-medium transition cursor-pointer",
                        page === safePageIndex + 1
                          ? "bg-primary text-white shadow-sm"
                          : "text-slate-600 hover:bg-white hover:shadow-sm",
                      ].join(" ")}
                    >
                      {page}
                    </button>
                  )
                )}
              </div>

              <button
                type="button"
                onClick={() => goToPage(safePageIndex + 1)}
                disabled={loading || safePageIndex >= totalPages - 1}
                className="h-9 w-9 rounded-lg flex items-center justify-center text-slate-600 hover:bg-white hover:shadow-sm disabled:opacity-40 disabled:pointer-events-none transition cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">
                  chevron_right
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LoadingRows({ columnCount }) {
  const rows = Array.from({ length: 5 }, (_, index) => index);
  return (
    <>
      {rows.map((row) => (
        <tr key={row}>
          {Array.from({ length: Math.max(columnCount, 1) }, (_, col) => (
            <td key={col} className="px-6 py-4">
              <div className="h-4 w-full max-w-[180px] bg-slate-100 rounded animate-pulse" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}