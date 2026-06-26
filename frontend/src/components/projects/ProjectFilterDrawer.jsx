import React from "react";
import RightDrawer from "../layout/RightDrawer";
import Button from "../ui/Button";
import FormInput from "../ui/FormInput";
import useCurrency from "../../hooks/useCurrency";

const PROJECT_STATUSES = [
  { label: "Active", value: "active" },
  { label: "Pending", value: "pending" },
  { label: "Paid", value: "paid" },
  { label: "Risk", value: "risk" },
];

export const DEFAULT_PROJECT_FILTERS = {
  projectStatus: [],
  milestoneStatus: [],
  budgetRange: [0,0],
  minBilled: "",
  maxBilled: "",
  sortBy: "newest",
};

function BadgeSelector({
  title,
  options,
  selected = [],
  onToggle,
   counts = {},
}) {
  return (
    <div>
      <label className="block mb-2 text-[11px] font-semibold uppercase text-slate-600">
        {title}
      </label>

      <div className="flex flex-wrap gap-2">
        {options.map(({ label, value }) => {
          const isActive = selected.includes(value);

          return (
            <button
              key={value}
              type="button"
              onClick={() => onToggle(value)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                isActive
                  ? "bg-teal-600 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {label} <span
    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
      isActive
        ? "bg-white/20 text-white"
        : "bg-white text-slate-700"
    }`}
  >
    {counts[value] || 0}
  </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function ProjectFilterDrawer({
  isOpen,
  onClose,
  filters = DEFAULT_PROJECT_FILTERS,
  setFilters,
  minBudgetAvailable = 0,
  maxBudgetAvailable,
  statusCounts = {},
}) {
const {
  format,
  selectedCurrency,
} = useCurrency();
  const budgetRange = filters.budgetRange ?? [
    minBudgetAvailable,
    maxBudgetAvailable,
  ];

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

  const resetFilters = () => {
  setFilters({
    projectStatus: [],
    milestoneStatus: [],
    budgetRange: [
      minBudgetAvailable,
      maxBudgetAvailable,
    ],
    minBilled: "",
    maxBilled: "",
    sortBy: "newest",
  });
};

  const footer = (
    <div className="flex justify-end gap-2">
      <Button
        variant="secondary"
        onClick={resetFilters}
      >
        Reset
      </Button>

      <Button onClick={onClose}>
        Apply Filters
      </Button>
    </div>
  );

  return (
    <RightDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Project Filters"
      icon="filter_list"
      width="max-w-lg"
      footer={footer}
    >
      <div className="space-y-6">

        <BadgeSelector
          title="Project Status"
          options={PROJECT_STATUSES}
          counts={statusCounts}
          selected={filters.projectStatus}
          onToggle={(value) =>
            toggleArrayFilter("projectStatus", value)
          }
        />

        {/* Budget Range */}
        <div>
          <label className="block mb-2 text-[11px] font-semibold uppercase text-slate-600">
            Budget Range
          </label>

          <input
            type="range"
            min={minBudgetAvailable}
            max={maxBudgetAvailable}
            value={budgetRange[1]}
            onChange={(e) =>
              updateFilter("budgetRange", [
                budgetRange[0],
                Number(e.target.value),
              ])
            }
            className="w-full accent-[var(--primary)]"
          />

         <div className="mt-2 text-sm font-semibold text-teal-600">
  {format(budgetRange[0])} - {format(budgetRange[1])}
</div>
        </div>

        {/* Billed Range */}
        <div className="grid grid-cols-2 gap-3">
         <FormInput
  label={`Min Billed (${selectedCurrency?.code})`}
  type="number"
  value={filters.minBilled}
  onChange={(e) =>
    updateFilter("minBilled", e.target.value)
  }
/>

<FormInput
  label={`Max Billed (${selectedCurrency?.code})`}
  type="number"
  value={filters.maxBilled}
  onChange={(e) =>
    updateFilter("maxBilled", e.target.value)
  }
/>
        </div>

        {/* Sort */}
        <div>
          <label className="block mb-2 text-[11px] font-semibold uppercase text-slate-600">
            Sort By
          </label>

          <select
            value={filters.sortBy}
            onChange={(e) =>
              updateFilter("sortBy", e.target.value)
            }
            className="w-full rounded-lg border border-slate-200 px-3 py-2"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="budgetHigh">
              Budget High → Low
            </option>
            <option value="budgetLow">
              Budget Low → High
            </option>
            <option value="progressHigh">
              Progress High → Low
            </option>
            <option value="progressLow">
              Progress Low → High
            </option>
          </select>
        </div>

      </div>
    </RightDrawer>
  );
}