import React, { memo, useCallback, useMemo } from "react";
import RightDrawer from "../layout/RightDrawer";
import Button from "../ui/Button";
import FormInput from "../ui/FormInput";
import useCurrency from "../../hooks/useCurrency";

const DEFAULT_FILTERS = Object.freeze({
  status: [],
  billing: [],
  fromDate: "",
  toDate: "",
  minAmount: "",
  maxAmount: "",
  currency: "All",
});

const STATUSES = Object.freeze([
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Paid", value: "paid" },
  { label: "Pending", value: "pending" },
  { label: "Overdue", value: "overdue" },
  { label: "Draft", value: "draft" },
  { label: "Scheduled", value: "scheduled" },
]);

const BILLING_OPTIONS = Object.freeze([
  { label: "Monthly", value: "Monthly" },
  { label: "Quarterly", value: "Quarterly" },
  { label: "Annual", value: "Annual" },
]);

/**
 * Creates a clean copy of the default filters.
 * Prevents accidental mutation of DEFAULT_FILTERS.
 */
const createDefaultFilters = () => ({
  ...DEFAULT_FILTERS,
  status: [],
  billing: [],
});

/**
 * Removes everything except digits and a single decimal point.
 * Useful when validating numeric filter values.
 */
const parseAmount = (value) => {
  if (value === "" || value === null || value === undefined) {
    return null;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
};

const FilterCheckboxGroup = memo(function FilterCheckboxGroup({
  title,
  options,
  selected = [],
  onToggle,
}) {
  const selectedValues = Array.isArray(selected) ? selected : [];

  return (
    <fieldset>
      <legend className="mb-2 block text-[11.5px] font-semibold uppercase tracking-wider text-slate-600">
        {title}
      </legend>

      <div className="flex flex-wrap gap-2">
        {options.map(({ label, value }) => {
          const id = `filter-${title
            .toLowerCase()
            .replace(/\s+/g, "-")}-${value.toLowerCase()}`;

          const checked = selectedValues.includes(value);

          return (
            <label
              key={value}
              htmlFor={id}
              className={[
                "flex cursor-pointer items-center gap-2 rounded-lg px-3 py-1.5",
                "bg-slate-100 text-[12.5px] font-medium text-slate-700",
                "transition-colors hover:bg-teal-50",
                "focus-within:ring-2 focus-within:ring-teal-500/30",
              ].join(" ")}
            >
              <input
                id={id}
                type="checkbox"
                checked={checked}
                onChange={() => onToggle(value)}
                className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
              />

              <span>{label}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
});

FilterCheckboxGroup.displayName = "FilterCheckboxGroup";

export default function FilterDrawer({
  isOpen = false,
  onClose,
  filters = DEFAULT_FILTERS,
  setFilters,
}) {
  const { format } = useCurrency();

  /**
   * Safely normalize incoming filters.
   * This prevents crashes if the parent passes an incomplete object.
   */
  const currentFilters = useMemo(
    () => ({
      ...DEFAULT_FILTERS,
      ...filters,
      status: Array.isArray(filters?.status) ? filters.status : [],
      billing: Array.isArray(filters?.billing) ? filters.billing : [],
    }),
    [filters]
  );

  /**
   * Extract currency symbol from the current formatter.
   *
   * Example:
   * "$0" -> "$"
   * "₹0" -> "₹"
   * "€0" -> "€"
   */
  const currencySymbol = useMemo(() => {
    try {
      const formatted = format(0);

      return (
        formatted
          ?.replace(/[\d.,\s\u00A0]/g, "")
          .trim() || ""
      );
    } catch {
      return "";
    }
  }, [format]);

  /**
   * Generic filter updater.
   */
  const updateFilter = useCallback(
    (key, value) => {
      if (typeof setFilters !== "function") return;

      setFilters((previous) => ({
        ...DEFAULT_FILTERS,
        ...previous,
        [key]: value,
      }));
    },
    [setFilters]
  );

  /**
   * Handles checkbox filters.
   */
  const toggleArrayFilter = useCallback(
    (key, value) => {
      if (typeof setFilters !== "function") return;

      setFilters((previous) => {
        const current = Array.isArray(previous?.[key])
          ? previous[key]
          : [];

        const exists = current.includes(value);

        return {
          ...DEFAULT_FILTERS,
          ...previous,
          [key]: exists
            ? current.filter((item) => item !== value)
            : [...current, value],
        };
      });
    },
    [setFilters]
  );

  /**
   * Reset all filters.
   */
  const handleReset = useCallback(() => {
    if (typeof setFilters !== "function") return;

    setFilters(createDefaultFilters());
  }, [setFilters]);

  /**
   * Apply filters.
   *
   * Validation is performed before closing the drawer.
   */
  const handleApply = useCallback(() => {
    const fromDate = currentFilters.fromDate;
    const toDate = currentFilters.toDate;

    const minAmount = parseAmount(currentFilters.minAmount);
    const maxAmount = parseAmount(currentFilters.maxAmount);

    // Prevent invalid date range.
    if (fromDate && toDate && fromDate > toDate) {
      return;
    }

    // Prevent invalid amount range.
    if (
      minAmount !== null &&
      maxAmount !== null &&
      minAmount > maxAmount
    ) {
      return;
    }

    onClose?.();
  }, [currentFilters, onClose]);

  /**
   * Prevent selecting an invalid date range from the UI.
   */
  const dateValidationMessage = useMemo(() => {
    if (
      currentFilters.fromDate &&
      currentFilters.toDate &&
      currentFilters.fromDate > currentFilters.toDate
    ) {
      return "The start date cannot be later than the end date.";
    }

    return "";
  }, [currentFilters.fromDate, currentFilters.toDate]);

  /**
   * Amount validation.
   */
  const amountValidationMessage = useMemo(() => {
    const min = parseAmount(currentFilters.minAmount);
    const max = parseAmount(currentFilters.maxAmount);

    if (min !== null && max !== null && min > max) {
      return "Minimum amount cannot be greater than maximum amount.";
    }

    return "";
  }, [currentFilters.minAmount, currentFilters.maxAmount]);

  const footer = useMemo(
    () => (
      <div className="flex w-full items-center justify-end gap-2">
        <Button variant="secondary" onClick={handleReset}>
          Reset
        </Button>

        <Button
          onClick={handleApply}
          disabled={
            Boolean(dateValidationMessage) ||
            Boolean(amountValidationMessage)
          }
        >
          Apply Filters
        </Button>
      </div>
    ),
    [
      handleReset,
      handleApply,
      dateValidationMessage,
      amountValidationMessage,
    ]
  );

  return (
    <RightDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Filter"
      icon="filter_list"
      width="max-w-lg"
      footer={footer}
    >
      <div
        className="space-y-5"
        aria-label="Filter options"
      >
        {/* STATUS */}
        <FilterCheckboxGroup
          title="Status"
          options={STATUSES}
          selected={currentFilters.status}
          onToggle={(value) =>
            toggleArrayFilter("status", value)
          }
        />

        {/* BILLING FREQUENCY */}
        <FilterCheckboxGroup
          title="Billing Frequency"
          options={BILLING_OPTIONS}
          selected={currentFilters.billing}
          onToggle={(value) =>
            toggleArrayFilter("billing", value)
          }
        />

        {/* DATE RANGE */}
        <div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormInput
              label="From"
              type="date"
              value={currentFilters.fromDate}
              max={currentFilters.toDate || undefined}
              onChange={(event) =>
                updateFilter("fromDate", event.target.value)
              }
              aria-label="Filter from date"
            />

            <FormInput
              label="To"
              type="date"
              value={currentFilters.toDate}
              min={currentFilters.fromDate || undefined}
              onChange={(event) =>
                updateFilter("toDate", event.target.value)
              }
              aria-label="Filter to date"
            />
          </div>

          {dateValidationMessage && (
            <p
              className="mt-2 text-xs font-medium text-red-600"
              role="alert"
            >
              {dateValidationMessage}
            </p>
          )}
        </div>

        {/* AMOUNT RANGE */}
        <div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormInput
              label="Min Amount"
              type="number"
              min="0"
              step="0.01"
              value={currentFilters.minAmount}
              placeholder={`${currencySymbol} 0`}
              onChange={(event) =>
                updateFilter("minAmount", event.target.value)
              }
              aria-label="Minimum amount"
            />

            <FormInput
              label="Max Amount"
              type="number"
              min="0"
              step="0.01"
              value={currentFilters.maxAmount}
              placeholder={`${currencySymbol} 100000`}
              onChange={(event) =>
                updateFilter("maxAmount", event.target.value)
              }
              aria-label="Maximum amount"
            />
          </div>

          {amountValidationMessage && (
            <p
              className="mt-2 text-xs font-medium text-red-600"
              role="alert"
            >
              {amountValidationMessage}
            </p>
          )}
        </div>
      </div>
    </RightDrawer>
  );
}