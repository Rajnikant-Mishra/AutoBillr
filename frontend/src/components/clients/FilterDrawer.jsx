import React, { memo, useCallback, useMemo } from "react";

import RightDrawer from "../layout/RightDrawer";
import Button from "../ui/Button";
import FormInput from "../ui/FormInput";

/* =========================================================
   DEFAULT FILTERS
========================================================= */

const DEFAULT_FILTERS = Object.freeze({
  status: [],
  fromDate: "",
  toDate: "",
  country: "",
  stateRegion: "",
  city: "",
  postalCode: "",
  industry: "",
  tier: "",
});

/* =========================================================
   STATUS OPTIONS
========================================================= */

const STATUSES = Object.freeze([
  {
    label: "Active",
    value: "active",
  },
  {
    label: "Inactive",
    value: "inactive",
  },
  {
    label: "Pending",
    value: "pending",
  },
]);

/* =========================================================
   INDUSTRY OPTIONS
========================================================= */

const INDUSTRIES = Object.freeze([
  {
    label: "Technology",
    value: "Technology",
  },
  {
    label: "Finance",
    value: "Finance",
  },
  {
    label: "Healthcare",
    value: "Healthcare",
  },
  {
    label: "Retail",
    value: "Retail",
  },
  {
    label: "Manufacturing",
    value: "Manufacturing",
  },
  {
    label: "Consulting",
    value: "Consulting",
  },
  {
    label: "Other",
    value: "Other",
  },
]);

/* =========================================================
   CLIENT TIER OPTIONS
========================================================= */

const CLIENT_TIERS = Object.freeze([
  {
    label: "Enterprise",
    value: "Enterprise",
  },
  {
    label: "Mid-Market",
    value: "Mid-Market",
  },
  {
    label: "SMB",
    value: "SMB",
  },
  {
    label: "Startup",
    value: "Startup",
  },
]);

/* =========================================================
   CREATE DEFAULT FILTERS
========================================================= */

const createDefaultFilters = () => ({
  ...DEFAULT_FILTERS,
  status: [],
});

/* =========================================================
   CHECKBOX GROUP
========================================================= */

const FilterCheckboxGroup = memo(function FilterCheckboxGroup({
  title,
  options,
  selected = [],
  onToggle,
}) {
  const selectedValues = Array.isArray(selected)
    ? selected
    : [];

  return (
    <fieldset>
      <legend
        className="
          mb-2
          block
          text-[11.5px]
          font-semibold
          uppercase
          tracking-wider
          text-text-secondary
        "
      >
        {title}
      </legend>

      <div className="flex flex-wrap gap-2">
        {options.map(({ label, value }) => {
          const id = `filter-${title
            .toLowerCase()
            .replace(/\s+/g, "-")}-${String(value)
            .toLowerCase()
            .replace(/\s+/g, "-")}`;

          const checked =
            selectedValues.includes(value);

          return (
            <label
              key={value}
              htmlFor={id}
              className={`
                flex
                cursor-pointer
                items-center
                gap-2
                rounded-lg
                border
                px-3
                py-1.5
                text-[12.5px]
                font-medium
                transition-colors
                duration-fast
                focus-within:ring-2
                focus-within:ring-primary/25
                ${
                  checked
                    ? "border-primary-light bg-primary-soft text-primary-dark"
                    : "border-transparent bg-surface-secondary text-text-secondary hover:bg-surface-hover"
                }
              `}
            >
              <input
                id={id}
                type="checkbox"
                checked={checked}
                onChange={() =>
                  onToggle(value)
                }
                className="
                  h-4
                  w-4
                  rounded
                  border-border
                  accent-primary
                  focus:ring-primary
                "
              />

              <span>{label}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
});

FilterCheckboxGroup.displayName =
  "FilterCheckboxGroup";

/* =========================================================
   FILTER DRAWER
========================================================= */

export default function FilterDrawer({
  isOpen = false,
  onClose,
  filters = DEFAULT_FILTERS,
  setFilters,
}) {
  /* =======================================================
     NORMALIZED FILTER STATE
  ======================================================= */

  const currentFilters = useMemo(
    () => ({
      ...DEFAULT_FILTERS,
      ...filters,
      status: Array.isArray(filters?.status)
        ? filters.status
        : [],
    }),
    [filters]
  );

  /* =======================================================
     UPDATE FILTER
  ======================================================= */

  const updateFilter = useCallback(
    (key, value) => {
      if (typeof setFilters !== "function") {
        return;
      }

      setFilters((previous) => ({
        ...DEFAULT_FILTERS,
        ...previous,
        [key]: value,
      }));
    },
    [setFilters]
  );

  /* =======================================================
     TOGGLE ARRAY FILTER
  ======================================================= */

  const toggleArrayFilter = useCallback(
    (key, value) => {
      if (typeof setFilters !== "function") {
        return;
      }

      setFilters((previous) => {
        const current = Array.isArray(
          previous?.[key]
        )
          ? previous[key]
          : [];

        const exists =
          current.includes(value);

        return {
          ...DEFAULT_FILTERS,
          ...previous,
          [key]: exists
            ? current.filter(
                (item) => item !== value
              )
            : [...current, value],
        };
      });
    },
    [setFilters]
  );

  /* =======================================================
     RESET
  ======================================================= */

  const handleReset = useCallback(() => {
    if (typeof setFilters !== "function") {
      return;
    }

    setFilters(createDefaultFilters());
  }, [setFilters]);

  /* =======================================================
     DATE VALIDATION
  ======================================================= */

  const dateValidationMessage = useMemo(() => {
    if (
      currentFilters.fromDate &&
      currentFilters.toDate &&
      currentFilters.fromDate >
        currentFilters.toDate
    ) {
      return "The start date cannot be later than the end date.";
    }

    return "";
  }, [
    currentFilters.fromDate,
    currentFilters.toDate,
  ]);

  /* =======================================================
     APPLY
  ======================================================= */

  const handleApply = useCallback(() => {
    if (dateValidationMessage) {
      return;
    }

    onClose?.();
  }, [
    dateValidationMessage,
    onClose,
  ]);

  /* =======================================================
     FOOTER
  ======================================================= */

  const footer = useMemo(
    () => (
      <div className="flex w-full items-center justify-end gap-2">
        <Button
          variant="secondary"
          onClick={handleReset}
        >
          Reset
        </Button>

        <Button
          onClick={handleApply}
          disabled={Boolean(
            dateValidationMessage
          )}
        >
          Apply Filters
        </Button>
      </div>
    ),
    [
      handleReset,
      handleApply,
      dateValidationMessage,
    ]
  );

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <RightDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Filter Clients"
      icon="filter_list"
      width="max-w-lg"
      footer={footer}
    >
      <div
        className="space-y-6"
        aria-label="Client filter options"
      >
        {/* =================================================
            STATUS
        ================================================= */}

        <FilterCheckboxGroup
          title="Status"
          options={STATUSES}
          selected={
            currentFilters.status
          }
          onToggle={(value) =>
            toggleArrayFilter(
              "status",
              value
            )
          }
        />

        {/* =================================================
            CREATED DATE
        ================================================= */}

        <div>
          <div
            className="
              mb-2
              text-[11.5px]
              font-semibold
              uppercase
              tracking-wider
              text-text-secondary
            "
          >
            Created Date
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormInput
              label="From"
              type="date"
              value={
                currentFilters.fromDate
              }
              max={
                currentFilters.toDate ||
                undefined
              }
              onChange={(e) =>
                updateFilter(
                  "fromDate",
                  e.target.value
                )
              }
              aria-label="Filter clients from created date"
            />

            <FormInput
              label="To"
              type="date"
              value={
                currentFilters.toDate
              }
              min={
                currentFilters.fromDate ||
                undefined
              }
              onChange={(e) =>
                updateFilter(
                  "toDate",
                  e.target.value
                )
              }
              aria-label="Filter clients to created date"
            />
          </div>

          {dateValidationMessage && (
            <p
              className="
                mt-2
                text-xs
                font-medium
                text-danger
              "
              role="alert"
            >
              {dateValidationMessage}
            </p>
          )}
        </div>

        {/* =================================================
            LOCATION
        ================================================= */}

        <div>
          <div
            className="
              mb-3
              text-[11.5px]
              font-semibold
              uppercase
              tracking-wider
              text-text-secondary
            "
          >
            Location
          </div>

          <div className="space-y-3">
            {/* COUNTRY */}

            <FormInput
              label="Country"
              type="text"
              value={
                currentFilters.country
              }
              placeholder="e.g. India"
              onChange={(e) =>
                updateFilter(
                  "country",
                  e.target.value
                )
              }
              aria-label="Filter by country"
            />

            {/* STATE + CITY */}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <FormInput
                label="State"
                type="text"
                value={
                  currentFilters.stateRegion
                }
                placeholder="e.g. Odisha"
                onChange={(e) =>
                  updateFilter(
                    "stateRegion",
                    e.target.value
                  )
                }
                aria-label="Filter by state"
              />

              <FormInput
                label="City"
                type="text"
                value={
                  currentFilters.city
                }
                placeholder="e.g. Bhubaneswar"
                onChange={(e) =>
                  updateFilter(
                    "city",
                    e.target.value
                  )
                }
                aria-label="Filter by city"
              />
            </div>

            {/* PINCODE */}

            <FormInput
              label="Pincode"
              type="text"
              value={
                currentFilters.postalCode
              }
              placeholder="e.g. 751001"
              onChange={(e) =>
                updateFilter(
                  "postalCode",
                  e.target.value
                )
              }
              aria-label="Filter by pincode"
            />
          </div>
        </div>

        {/* =================================================
            INDUSTRY
        ================================================= */}

        <FilterCheckboxGroup
          title="Industry"
          options={INDUSTRIES}
          selected={
            currentFilters.industry
              ? [
                  currentFilters.industry,
                ]
              : []
          }
          onToggle={(value) =>
            updateFilter(
              "industry",
              currentFilters.industry ===
                value
                ? ""
                : value
            )
          }
        />

        {/* =================================================
            CLIENT TIER
        ================================================= */}

        <FilterCheckboxGroup
          title="Client Tier"
          options={CLIENT_TIERS}
          selected={
            currentFilters.tier
              ? [currentFilters.tier]
              : []
          }
          onToggle={(value) =>
            updateFilter(
              "tier",
              currentFilters.tier ===
                value
                ? ""
                : value
            )
          }
        />
      </div>
    </RightDrawer>
  );
}