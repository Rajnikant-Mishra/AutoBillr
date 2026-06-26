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
      <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-3">
        Billing Frequency
      </label>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {options(currencySymbol).map((option) => {
          const active = option.label === value;

          return (
            <button
              key={option.label}
              onClick={() => onChange?.(option.label)}
              className={`p-4 rounded-xl border-2 transition ${
                active
                  ? "border-teal-500 bg-teal-50"
                  : "border-slate-200 hover:border-teal-300"
              }`}
            >
              <div
                className={`text-xs font-bold ${
                  active
                    ? "text-teal-700"
                    : "text-slate-700"
                }`}
              >
                {option.label}
              </div>

              <div className="text-[10px] mt-1">
                {option.sub}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}