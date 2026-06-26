import React from "react";
import RightDrawer from "../layout/RightDrawer";
import Button from "../ui/Button";
import FormInput from "../ui/FormInput";
import useCurrency from "../../hooks/useCurrency";
const DEFAULT_FILTERS = {
  status: [],
  billing: [],
  fromDate: "",
  toDate: "",
  minAmount: "",
  maxAmount: "",
  currency: "All",
};

const STATUSES = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Paid", value: "paid" },
  { label: "Pending", value: "pending" },
  { label: "Overdue", value: "overdue" },
  { label: "Draft", value: "draft" },
  { label: "Scheduled", value: "scheduled" },
];

const BILLING_OPTIONS = [
  { label: "Monthly", value: "Monthly" },
  { label: "Quarterly", value: "Quarterly" },
  { label: "Annual", value: "Annual" },
];

function FilterCheckboxGroup({
  title,
  options,
  selected = [],
  onToggle,
}) {
  return (
    <div>
      <label className="block text-[11.5px] font-semibold text-slate-600 uppercase tracking-wider mb-2">
        {title}
      </label>

      <div className="flex flex-wrap gap-2">
        {options.map((item) => (
          <label
            key={item.value}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-teal-50 rounded-lg cursor-pointer text-[12.5px] font-medium"
          >
            <input
              type="checkbox"
              checked={selected.includes(item.value)}
              onChange={() => onToggle(item.value)}
              className="rounded"
            />
            {item.label}
          </label>
        ))}
      </div>
    </div>
  );
}

export default function FilterDrawer({
  isOpen,
  onClose,
  filters,
  setFilters,
}) {

 const { format } = useCurrency();
  const currencySymbol = format(0).replace(/[0-9.,\s]/g, "");
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

  const footer = (
  <div className="flex items-center justify-between w-full">
    

    <div className="flex gap-2">
      <Button
        variant="secondary"
        onClick={() => setFilters(DEFAULT_FILTERS)}
      >
        Reset
      </Button>

      <Button onClick={onClose}>
        Apply Filters
      </Button>
    </div>
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
        <FilterCheckboxGroup
          title="Status"
          options={STATUSES}
          selected={filters.status}
          onToggle={(value) =>
            toggleArrayFilter("status", value)
          }
        />

        <FilterCheckboxGroup
          title="Billing Frequency"
          options={BILLING_OPTIONS}
          selected={filters.billing}
          onToggle={(value) =>
            toggleArrayFilter("billing", value)
          }
        />

        {/* DATE RANGE */}
        <div className="grid grid-cols-2 gap-3">
         
            <FormInput
    label="From"
    type="date"
    value={filters.fromDate}
    onChange={(e) =>
      updateFilter("fromDate", e.target.value)
    }
  />
          
             <FormInput
    label="To"
    type="date"
    value={filters.toDate}
    onChange={(e) =>
      updateFilter("toDate", e.target.value)
    }
  />
        </div>

        {/* AMOUNT RANGE */}
        <div className="grid grid-cols-2 gap-3">
          <div>
           <FormInput
  label="Min Amount"
  type="number"
  value={filters.minAmount}
 placeholder={`${currencySymbol} 0`}
  onChange={(e) =>
    updateFilter("minAmount", e.target.value)
  }
/>
          </div>

          <div>
           <FormInput
  label="Max Amount"
  type="number"
  value={filters.maxAmount}
  placeholder={`${currencySymbol} 100000`}
  onChange={(e) =>
    updateFilter("maxAmount", e.target.value)
  }
/>
          </div>
        </div>

        {/* CURRENCY */}
        {/* <div>
          <label className="block text-[11.5px] font-semibold text-slate-600 mb-1.5">
            Currency
          </label>

          <select
            value={filters.currency || "All"}
            onChange={(e) =>
              updateFilter("currency", e.target.value)
            }
            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm"
          >
            <option>All</option>
            <option>USD</option>
            <option>EUR</option>
            <option>GBP</option>
            <option>INR</option>
          </select>
        </div> */}
      </div>
    </RightDrawer>
  );
}
