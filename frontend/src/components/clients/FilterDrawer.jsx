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

const createDefaultFilters = () => ({
  ...DEFAULT_FILTERS,
  status: [],
  billing: [],
});

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
      <legend className="mb-2 block text-[11.5px] font-semibold uppercase tracking-wider text-text-secondary">
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
              className={`
                flex cursor-pointer items-center gap-2
                rounded-lg px-3 py-1.5
                text-[12.5px] font-medium
                transition-colors duration-fast
                focus-within:ring-2 focus-within:ring-primary/25
                ${
                  checked
                    ? "bg-primary-soft text-primary-dark"
                    : "bg-surface-secondary text-text-secondary hover:bg-surface-hover"
                }
              `}
            >
              <input
                id={id}
                type="checkbox"
                checked={checked}
                onChange={() => onToggle(value)}
                className="
                  h-4 w-4 rounded
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

FilterCheckboxGroup.displayName = "FilterCheckboxGroup";

export default function FilterDrawer({
  isOpen = false,
  onClose,
  filters = DEFAULT_FILTERS,
  setFilters,
}) {
  const { format } = useCurrency();

  const currentFilters = useMemo(
    () => ({
      ...DEFAULT_FILTERS,
      ...filters,
      status: Array.isArray(filters?.status) ? filters.status : [],
      billing: Array.isArray(filters?.billing) ? filters.billing : [],
    }),
    [filters]
  );

  const currencySymbol = useMemo(() => {
    try {
      const formatted = format(0);
      return formatted?.replace(/[\d.,\s\u00A0]/g, "").trim() || "";
    } catch {
      return "";
    }
  }, [format]);

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

  const handleReset = useCallback(() => {
    if (typeof setFilters !== "function") return;
    setFilters(createDefaultFilters());
  }, [setFilters]);

  const handleApply = useCallback(() => {
    const fromDate = currentFilters.fromDate;
    const toDate = currentFilters.toDate;
    const minAmount = parseAmount(currentFilters.minAmount);
    const maxAmount = parseAmount(currentFilters.maxAmount);

    if (fromDate && toDate && fromDate > toDate) return;
    if (minAmount !== null && maxAmount !== null && minAmount > maxAmount)
      return;

    onClose?.();
  }, [currentFilters, onClose]);

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
      <div className="space-y-5" aria-label="Filter options">
        {/* Status */}
        <FilterCheckboxGroup
          title="Status"
          options={STATUSES}
          selected={currentFilters.status}
          onToggle={(value) => toggleArrayFilter("status", value)}
        />

        {/* Billing Frequency */}
        <FilterCheckboxGroup
          title="Billing Frequency"
          options={BILLING_OPTIONS}
          selected={currentFilters.billing}
          onToggle={(value) => toggleArrayFilter("billing", value)}
        />

        {/* Date Range */}
        <div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormInput
              label="From"
              type="date"
              value={currentFilters.fromDate}
              max={currentFilters.toDate || undefined}
              onChange={(e) => updateFilter("fromDate", e.target.value)}
              aria-label="Filter from date"
            />
            <FormInput
              label="To"
              type="date"
              value={currentFilters.toDate}
              min={currentFilters.fromDate || undefined}
              onChange={(e) => updateFilter("toDate", e.target.value)}
              aria-label="Filter to date"
            />
          </div>

          {dateValidationMessage && (
            <p className="mt-2 text-xs font-medium text-danger" role="alert">
              {dateValidationMessage}
            </p>
          )}
        </div>

        {/* Amount Range */}
        <div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormInput
              label="Min Amount"
              type="number"
              min="0"
              step="0.01"
              value={currentFilters.minAmount}
              placeholder={`${currencySymbol} 0`}
              onChange={(e) => updateFilter("minAmount", e.target.value)}
              aria-label="Minimum amount"
            />
            <FormInput
              label="Max Amount"
              type="number"
              min="0"
              step="0.01"
              value={currentFilters.maxAmount}
              placeholder={`${currencySymbol} 100000`}
              onChange={(e) => updateFilter("maxAmount", e.target.value)}
              aria-label="Maximum amount"
            />
          </div>

          {amountValidationMessage && (
            <p className="mt-2 text-xs font-medium text-danger" role="alert">
              {amountValidationMessage}
            </p>
          )}
        </div>
      </div>
    </RightDrawer>
  );
}