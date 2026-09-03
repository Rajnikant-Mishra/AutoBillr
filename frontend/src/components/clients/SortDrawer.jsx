import React from "react";
import RightDrawer from "../layout/RightDrawer";
import Button from "../ui/Button";

const DEFAULT_SORT = {
  field: "",
  direction: "asc",
};

const DIRECTION_OPTIONS = [
  { value: "asc", label: "Ascending", icon: "arrow_upward" },
  { value: "desc", label: "Descending", icon: "arrow_downward" },
];

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
      <Button
        variant="secondary"
        onClick={() => setSortConfig(DEFAULT_SORT)}
      >
        Reset
      </Button>
      <Button onClick={onClose}>Apply Sort</Button>
    </div>
  );

  const selectedColumnLabel = columns.find(
    (c) => c.id === sortConfig.field
  )?.label;

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
        {/* Sort Field */}
        <div>
          <label className="block text-[11.5px] font-bold uppercase tracking-wider text-text-muted mb-3">
            Sort By
          </label>

          <div className="space-y-2" role="radiogroup" aria-label="Sort field">
            {columns.map((col) => {
              const selected = sortConfig.field === col.id;

              return (
                <label
                  key={col.id}
                  className={`
                    flex items-center gap-3 p-3
                    border rounded-lg cursor-pointer
                    transition-colors duration-fast
                    ${
                      selected
                        ? "border-primary bg-primary-soft"
                        : "border-border hover:bg-surface-hover"
                    }
                  `}
                >
                  <input
                    type="radio"
                    name="sortField"
                    checked={selected}
                    onChange={() => updateSort("field", col.id)}
                    className="accent-primary"
                  />
                  <span
                    className={`font-medium ${
                      selected ? "text-primary-dark" : "text-text-secondary"
                    }`}
                  >
                    {col.label}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Sort Direction */}
        <div>
          <label className="block text-[11.5px] font-bold uppercase tracking-wider text-text-muted mb-3">
            Direction
          </label>

          <div className="space-y-2" role="radiogroup" aria-label="Sort direction">
            {DIRECTION_OPTIONS.map((option) => {
              const selected = sortConfig.direction === option.value;

              return (
                <label
                  key={option.value}
                  className={`
                    flex items-center gap-3 p-3
                    border rounded-lg cursor-pointer
                    transition-colors duration-fast
                    ${
                      selected
                        ? "border-primary bg-primary-soft"
                        : "border-border hover:bg-surface-hover"
                    }
                  `}
                >
                  <input
                    type="radio"
                    name="direction"
                    checked={selected}
                    onChange={() => updateSort("direction", option.value)}
                    className="accent-primary"
                  />
                  <span className="material-symbols-outlined text-[18px] text-text-muted">
                    {option.icon}
                  </span>
                  <span
                    className={`font-medium ${
                      selected ? "text-primary-dark" : "text-text-secondary"
                    }`}
                  >
                    {option.label}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Preview */}
        {sortConfig.field && (
          <div className="rounded-xl border border-primary/15 bg-primary-soft p-3">
            <div className="text-[11px] uppercase tracking-wider font-bold text-primary mb-1">
              Current Sort
            </div>
            <div className="text-sm font-medium text-text">
              {selectedColumnLabel} ·{" "}
              {sortConfig.direction === "asc" ? "Ascending" : "Descending"}
            </div>
          </div>
        )}
      </div>
    </RightDrawer>
  );
}