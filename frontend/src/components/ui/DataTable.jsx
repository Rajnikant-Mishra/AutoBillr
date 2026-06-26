import React from "react";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";

export default function DataTable({
  data = [],
  columns = [],
  loading = false,
  pagination,
  setPagination,
  emptyMessage = "No data found",
  onRowClick,
  pageSizes = [5, 10, 20, 50],
   rowSelection,
  setRowSelection,
}) {
 const table = useReactTable({
  data,
  columns,

  state: {
    pagination,
    rowSelection,
  },

  enableRowSelection: true,

  onRowSelectionChange: setRowSelection,

  onPaginationChange: setPagination,

  getCoreRowModel: getCoreRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
});

  const totalItems = data.length;

  const startItem =
    totalItems === 0
      ? 0
      : pagination.pageIndex * pagination.pageSize + 1;

  const endItem = Math.min(
    (pagination.pageIndex + 1) * pagination.pageSize,
    totalItems
  );

  const totalPages = Math.ceil(
    totalItems / pagination.pageSize
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">

          <thead className="bg-slate-50 border-b border-slate-100">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500"
                  >
                    {flexRender(
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
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center py-10"
                >
                  Loading...
                </td>
              </tr>
            ) : table.getRowModel().rows.length ? (
              table.getPaginationRowModel().rows.map(
                (row) => (
                  <tr
                    key={row.id}
                    onClick={() =>
                      onRowClick?.(row.original)
                    }
                   className="group hover:bg-slate-50 transition cursor-pointer"
                  >
                    {row
                      .getVisibleCells()
                      .map((cell) => (
                        <td
                          key={cell.id}
                          className="px-6 py-4"
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      ))}
                  </tr>
                )
              )
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center py-10 text-slate-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}

          </tbody>
        </table>
      </div>

      {/* Pagination */}

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 px-6 py-4 border-t border-slate-100 bg-slate-50">

        <div className="flex items-center gap-4 flex-wrap">

          <p className="text-sm text-slate-500">
            Showing
            <span className="font-semibold text-slate-900 mx-1">
              {startItem}-{endItem}
            </span>
            of
            <span className="font-semibold text-slate-900 mx-1">
              {totalItems}
            </span>
          </p>

          <select
            value={pagination.pageSize}
            onChange={(e) =>
              setPagination({
                pageIndex: 0,
                pageSize: Number(e.target.value),
              })
            }
            className="h-9 px-3 rounded-lg border border-slate-200"
          >
           {pageSizes.map((size) => (
  <option key={size} value={size}>
    {size}
  </option>
))}
          </select>

        </div>

        <div className="flex items-center gap-3">

          <div className="text-sm text-slate-500">
            Page {pagination.pageIndex + 1} of{" "}
            {totalPages || 1}
          </div>

          <div className="flex items-center bg-slate-100 rounded-xl p-1">

            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="h-9 w-9"
            >
              <span className="material-symbols-outlined">
                chevron_left
              </span>
            </button>

            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="h-9 w-9"
            >
              <span className="material-symbols-outlined">
                chevron_right
              </span>
            </button>

          </div>

        </div>

      </div>
    </div>
  );
}