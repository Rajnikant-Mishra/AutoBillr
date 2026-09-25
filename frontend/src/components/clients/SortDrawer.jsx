
import React, { useMemo } from "react";

import RightDrawer from "../layout/RightDrawer";
import Button from "../ui/Button";

/* =========================================================
   DEFAULT SORT
========================================================= */

const DEFAULT_SORT = {
  field: "",
  direction: "asc",
};

/* =========================================================
   SORT DIRECTION OPTIONS
========================================================= */

const DIRECTION_OPTIONS = [
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
];

/* =========================================================
   COMPONENT
========================================================= */

export default function SortDrawer({
  isOpen = false,
  onClose,
  columns = [],
  sortConfig = DEFAULT_SORT,
  setSortConfig,
}) {
  /* =======================================================
     SAFE SORT CONFIG
  ======================================================= */

  const currentSort = useMemo(
    () => ({
      ...DEFAULT_SORT,
      ...(sortConfig || {}),
    }),
    [sortConfig]
  );

  /* =======================================================
     UPDATE SORT
  ======================================================= */

  const updateSort = (key, value) => {
    if (typeof setSortConfig !== "function") {
      return;
    }

    setSortConfig((previous) => ({
      ...DEFAULT_SORT,
      ...(previous || {}),
      [key]: value,
    }));
  };

  /* =======================================================
     RESET SORT
  ======================================================= */

  const handleReset = () => {
    if (typeof setSortConfig !== "function") {
      return;
    }

    setSortConfig({
      ...DEFAULT_SORT,
    });
  };

  /* =======================================================
     APPLY SORT
  ======================================================= */

  const handleApply = () => {
    onClose?.();
  };

  /* =======================================================
     SELECTED COLUMN
  ======================================================= */

  const selectedColumnLabel = useMemo(() => {
    if (!currentSort.field) {
      return "";
    }

    return (
      columns.find(
        (column) =>
          column?.id === currentSort.field
      )?.label || currentSort.field
    );
  }, [columns, currentSort.field]);

  /* =======================================================
     FOOTER
  ======================================================= */

  const footer = (
    <div className="flex w-full items-center justify-end gap-2">
      <Button
        variant="secondary"
        onClick={handleReset}
      >
        Reset
      </Button>

      <Button onClick={handleApply}>
        Apply Sort
      </Button>
    </div>
  );

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <RightDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Sort"
      icon="sort"
      width="max-w-md"
      footer={footer}
    >
      <div
        className="space-y-6"
        aria-label="Client sorting options"
      >
        {/* =================================================
            SORT FIELD
        ================================================= */}

        <div>
          <label
            className="
              mb-3
              block
              text-[11.5px]
              font-bold
              uppercase
              tracking-wider
              text-text-muted
            "
          >
            Sort By
          </label>

          <div
            className="space-y-2"
            role="radiogroup"
            aria-label="Sort field"
          >
            {columns.length > 0 ? (
              columns.map((column) => {
                const selected =
                  currentSort.field ===
                  column.id;

                return (
                  <label
                    key={column.id}
                    className={`
                      flex
                      cursor-pointer
                      items-center
                      gap-3
                      rounded-lg
                      border
                      p-3
                      transition-colors
                      duration-fast
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
                      value={column.id}
                      checked={selected}
                      onChange={() =>
                        updateSort(
                          "field",
                          column.id
                        )
                      }
                      className="
                        h-4
                        w-4
                        accent-primary
                        focus:ring-primary
                      "
                    />

                    <span
                      className={`
                        text-sm
                        font-medium
                        ${
                          selected
                            ? "text-primary-dark"
                            : "text-text-secondary"
                        }
                      `}
                    >
                      {column.label}
                    </span>
                  </label>
                );
              })
            ) : (
              <div
                className="
                  rounded-lg
                  border
                  border-border
                  bg-surface-secondary
                  p-4
                  text-sm
                  text-text-muted
                "
              >
                No sortable fields available.
              </div>
            )}
          </div>
        </div>

        {/* =================================================
            SORT DIRECTION
        ================================================= */}

        <div>
          <label
            className="
              mb-3
              block
              text-[11.5px]
              font-bold
              uppercase
              tracking-wider
              text-text-muted
            "
          >
            Direction
          </label>

          <div
            className="space-y-2"
            role="radiogroup"
            aria-label="Sort direction"
          >
            {DIRECTION_OPTIONS.map(
              (option) => {
                const selected =
                  currentSort.direction ===
                  option.value;

                return (
                  <label
                    key={option.value}
                    className={`
                      flex
                      cursor-pointer
                      items-center
                      gap-3
                      rounded-lg
                      border
                      p-3
                      transition-colors
                      duration-fast
                      ${
                        selected
                          ? "border-primary bg-primary-soft"
                          : "border-border hover:bg-surface-hover"
                      }
                    `}
                  >
                    <input
                      type="radio"
                      name="sortDirection"
                      value={option.value}
                      checked={selected}
                      onChange={() =>
                        updateSort(
                          "direction",
                          option.value
                        )
                      }
                      className="
                        h-4
                        w-4
                        accent-primary
                        focus:ring-primary
                      "
                    />

                    <span
                      className="
                        material-symbols-outlined
                        text-[18px]
                        text-text-muted
                      "
                      aria-hidden="true"
                    >
                      {option.icon}
                    </span>

                    <span
                      className={`
                        text-sm
                        font-medium
                        ${
                          selected
                            ? "text-primary-dark"
                            : "text-text-secondary"
                        }
                      `}
                    >
                      {option.label}
                    </span>
                  </label>
                );
              }
            )}
          </div>
        </div>

        {/* =================================================
            SORT PREVIEW
        ================================================= */}

        {currentSort.field && (
          <div
            className="
              rounded-xl
              border
              border-primary/15
              bg-primary-soft
              p-3
            "
          >
            <div
              className="
                mb-1
                text-[11px]
                font-bold
                uppercase
                tracking-wider
                text-primary
              "
            >
              Current Sort
            </div>

            <div
              className="
                text-sm
                font-medium
                text-text
              "
            >
              {selectedColumnLabel}
              {" · "}
              {currentSort.direction ===
              "asc"
                ? "Ascending"
                : "Descending"}
            </div>
          </div>
        )}
      </div>
    </RightDrawer>
  );
}

