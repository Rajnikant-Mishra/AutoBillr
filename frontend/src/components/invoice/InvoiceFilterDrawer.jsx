import React from "react";
import RightDrawer from "../layout/RightDrawer";
import Button from "../ui/Button";
import FormInput from "../ui/FormInput";
import useCurrency from "../../hooks/useCurrency";

const DEFAULT_FILTERS = {
  status: [],
  fromDate: "",
  toDate: "",
  minAmount: "",
  maxAmount: "",
  currency: "All",
};

const STATUSES = [
  { label: "Paid", value: "paid" },
  { label: "Pending", value: "pending" },
  { label: "Overdue", value: "overdue" },
  { label: "Draft", value: "draft" },
  { label: "Scheduled", value: "scheduled" },
];

function FilterCheckboxGroup({ title, options, selected = [], onToggle }) {
  return (
    <div>
      <label className="block text-[11.5px] font-semibold text-text-secondary uppercase tracking-wider mb-2">
        {title}
      </label>

      <div className="flex flex-wrap gap-2">
        {options.map((item) => {
          const isActive = selected.includes(item.value);

          return (
            <label
              key={item.value}
              className={`
                flex items-center gap-2 px-3 py-1.5 rounded-lg
                cursor-pointer text-[12.5px] font-medium
                border transition-colors duration-fast
                ${
                  isActive
                    ? "bg-primary-soft text-primary-dark border-primary/20"
                    : "bg-surface-secondary text-text-secondary border-transparent hover:bg-surface-hover"
                }
              `}
            >
              <input
                type="checkbox"
                checked={isActive}
                onChange={() => onToggle(item.value)}
                className="rounded accent-primary"
              />
              {item.label}
            </label>
          );
        })}
      </div>
    </div>
  );
}

export default function InvoiceFilterDrawer({
  isOpen,
  onClose,
  filters,
  setFilters,
  onApply,
  onReset,
}) {
  const { selectedCurrency } = useCurrency();

  const updateFilter = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const toggleArrayFilter = (key, value) => {
    setFilters((prev) => {
      const current = prev[key] || [];
      return {
        ...prev,
        [key]: current.includes(value)
          ? current.filter((item) => item !== value)
          : [...current, value],
      };
    });
  };

  const handleReset = () => {
    if (onReset) {
      onReset();
    } else {
      setFilters(DEFAULT_FILTERS);
    }
  };

  const handleApply = () => {
    onApply?.(filters);
    onClose?.();
  };

  const footer = (
    <div className="flex justify-end gap-2 w-full">
      <Button variant="secondary" onClick={handleReset}>
        Reset
      </Button>
      <Button onClick={handleApply}>Apply Filters</Button>
    </div>
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
      <div className="space-y-5">
        {/* Status */}
        <FilterCheckboxGroup
          title="Status"
          options={STATUSES}
          selected={filters.status || []}
          onToggle={(value) => toggleArrayFilter("status", value)}
        />

        {/* Date Range */}
        <div className="grid grid-cols-2 gap-3">
          <FormInput
            label="From Date"
            type="date"
            value={filters.fromDate || ""}
            onChange={(e) => updateFilter("fromDate", e.target.value)}
          />
          <FormInput
            label="To Date"
            type="date"
            value={filters.toDate || ""}
            onChange={(e) => updateFilter("toDate", e.target.value)}
          />
        </div>

        {/* Amount Range */}
        <div className="grid grid-cols-2 gap-3">
          <FormInput
            label={`Min Amount (${selectedCurrency?.code || "USD"})`}
            type="number"
            placeholder="0"
            value={filters.minAmount}
            onChange={(e) =>
              updateFilter(
                "minAmount",
                e.target.value.replace(/[^\d.]/g, "")
              )
            }
          />
          <FormInput
            label={`Max Amount (${selectedCurrency?.code || "USD"})`}
            type="number"
            placeholder="1000000"
            value={filters.maxAmount}
            onChange={(e) =>
              updateFilter(
                "maxAmount",
                e.target.value.replace(/[^\d.]/g, "")
              )
            }
          />
        </div>

        {/* Currency */}
        <div>
          <label className="block text-[11.5px] font-semibold text-text-secondary mb-1.5">
            Currency
          </label>
          <select
            value={filters.currency || "All"}
            onChange={(e) => updateFilter("currency", e.target.value)}
            className="
              w-full h-11 px-3
              border border-border rounded-lg text-sm
              bg-[var(--input-background)] text-text
              focus:outline-none
              focus:ring-2 focus:ring-primary/20
              focus:border-primary
              transition-colors duration-fast
            "
          >
            <option value="All">All</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
            <option value="INR">INR</option>
          </select>
        </div>
      </div>
    </RightDrawer>
  );
}