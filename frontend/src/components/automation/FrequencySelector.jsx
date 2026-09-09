import useCurrency from "../../hooks/useCurrency";

const options = (currencySymbol) => [
  {
    label: "Monthly",
    sub: `${currencySymbol} billed every month`,
  },
  {
    label: "Quarterly",
    sub: `${currencySymbol} billed every 3 months`,
  },
  {
    label: "Annual",
    sub: `${currencySymbol} billed yearly`,
  },
  {
    label: "Custom",
    sub: "Flexible logic",
  },
];

export default function FrequencySelector({
  value = "Quarterly",
  onChange,
}) {
  const { currencySymbol } = useCurrency();

  return (
    <div>
      <label className="block text-[11px] font-semibold text-text-secondary uppercase tracking-wider mb-3">
        Billing Frequency
      </label>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3" role="radiogroup" aria-label="Billing frequency">
        {options(currencySymbol).map((option) => {
          const active = option.label === value;

          return (
            <button
              key={option.label}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange?.(option.label)}
              className={`
                p-4 rounded-xl border-2
                transition-colors duration-fast
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25
                ${
                  active
                    ? "border-primary bg-primary-soft"
                    : "border-border hover:border-primary/40"
                }
              `}
            >
              <div
                className={`text-xs font-bold ${
                  active ? "text-primary-dark" : "text-text-secondary"
                }`}
              >
                {option.label}
              </div>

              <div
                className={`text-[10px] mt-1 ${
                  active ? "text-primary" : "text-text-muted"
                }`}
              >
                {option.sub}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}