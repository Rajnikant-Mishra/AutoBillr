
import React from "react";
import RightDrawer from "../layout/RightDrawer";

const DEFAULT_SORT = {
  field: "",
  direction: "asc",
};

export default function SortDrawer({
  isOpen,
  onClose,
  columns = [],
  sortConfig,
  setSortConfig,
}) {
  const updateSort = (key, value) => {
    setSortConfig((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const footer = (
    <div className="flex justify-end gap-2">
      <button
        onClick={() => setSortConfig(DEFAULT_SORT)}
        className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
      >
        Reset
      </button>

      <button
        onClick={onClose}
        className="px-4 py-2 text-sm font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition"
      >
        Apply Sort
      </button>
    </div>
  );

  return (
    <RightDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Sort"
      icon="sort"
      width="max-w-md"
      footer={footer}
    >
      <div className="space-y-6">
        {/* SORT FIELD */}
        <div>
          <label className="block text-[11.5px] font-bold uppercase tracking-wider text-slate-500 mb-3">
            Sort By
          </label>

          <div className="space-y-2">
            {columns.map((col) => {
              const selected = sortConfig.field === col.id;

              return (
                <label
                  key={col.id}
                  className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition
                    ${
                      selected
                        ? "border-teal-500 bg-teal-50"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                >
                  <input
                    type="radio"
                    name="sortField"
                    checked={selected}
                    onChange={() =>
                      updateSort("field", col.id)
                    }
                  />

                  <span
                    className={`font-medium ${
                      selected
                        ? "text-teal-700"
                        : "text-slate-700"
                    }`}
                  >
                    {col.label}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {/* SORT DIRECTION */}
        <div>
          <label className="block text-[11.5px] font-bold uppercase tracking-wider text-slate-500 mb-3">
            Direction
          </label>

          <div className="space-y-2">
            {[
              {
                value: "asc",
                label: "Ascending",
                icon: "arrow_upward",
              },
              {
                value: "desc",
                label: "Descending",
                icon: "arrow_downward",
              },
            ].map((option) => {
              const selected =
                sortConfig.direction === option.value;

              return (
                <label
                  key={option.value}
                  className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition
                    ${
                      selected
                        ? "border-teal-500 bg-teal-50"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                >
                  <input
                    type="radio"
                    name="direction"
                    checked={selected}
                    onChange={() =>
                      updateSort(
                        "direction",
                        option.value
                      )
                    }
                  />

                  <span className="material-symbols-outlined text-[18px] text-slate-500">
                    {option.icon}
                  </span>

                  <span
                    className={`font-medium ${
                      selected
                        ? "text-teal-700"
                        : "text-slate-700"
                    }`}
                  >
                    {option.label}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {/* PREVIEW */}
        {sortConfig.field && (
          <div className="rounded-xl border border-teal-100 bg-teal-50 p-3">
            <div className="text-[11px] uppercase tracking-wider font-bold text-teal-600 mb-1">
              Current Sort
            </div>

            <div className="text-sm font-medium text-slate-900">
              {
                columns.find(
                  (c) => c.id === sortConfig.field
                )?.label
              }{" "}
              •{" "}
              {sortConfig.direction === "asc"
                ? "Ascending"
                : "Descending"}
            </div>
          </div>
        )}
      </div>
    </RightDrawer>
  );
}