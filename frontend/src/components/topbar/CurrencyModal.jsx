import { useEffect, useRef } from "react";
const CONVERSION_RATES = {
  INR: 1.0,
  USD: 0.012,
  EUR: 0.011,
  GBP: 0.0094,
  AED: 0.044,
  CAD: 0.016,
  AUD: 0.018,
  JPY: 1.82,
  SGD: 0.016,
};

const DEFAULT_CURRENCIES = [
  { code: "INR", name: "Indian Rupee", symbol: "₹", flag: "🇮🇳" },
  { code: "USD", name: "US Dollar", symbol: "$", flag: "🇺🇸" },
  { code: "EUR", name: "Euro", symbol: "€", flag: "🇪🇺" },
  { code: "GBP", name: "British Pound", symbol: "£", flag: "🇬🇧" },
  { code: "AED", name: "UAE Dirham", symbol: "د.إ", flag: "🇦🇪" },
  { code: "CAD", name: "Canadian Dollar", symbol: "CA$", flag: "🇨🇦" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$", flag: "🇦🇺" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥", flag: "🇯🇵" },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$", flag: "🇸🇬" },
];

export default function CurrencyModal({
  isOpen,
  currencies = DEFAULT_CURRENCIES,
  selectedCurrencyCode = "INR",
  onSelect,
  onClose,
}) {
  const modalRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose?.();
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currencyList =
    Array.isArray(currencies) && currencies.length > 0
      ? currencies
      : DEFAULT_CURRENCIES;

  const currentSelected = String(selectedCurrencyCode || "INR").toUpperCase();

  const getDisplayRate = (item) => {
    const code = String(item?.code || "").toUpperCase();
    if (code === "INR") return "1.00 INR";
    const rate = CONVERSION_RATES[code] || item?.rate || 0.012;
    const num = Number(rate);
    if (num < 0.1) {
      return `${num.toFixed(3)} ${code}`;
    }
    return `${num.toFixed(2)} ${code}`;
  };

  return (
    <div
      ref={modalRef}
      className="fixed top-16 right-10 md:right-56 w-72 bg-white border border-slate-200 rounded-xl shadow-2xl z-[9999] overflow-hidden"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
        <div>
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
            Currency
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Rates updated 2 min ago
          </div>
        </div>
        <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-1 rounded">
          LIVE
        </span>
      </div>

      {/* List */}
      <div className="max-h-80 overflow-auto py-1">
        {currencyList.map((item) => {
          const code = String(item?.code || "").toUpperCase();
          const isSelected = code === currentSelected;

          return (
            <button
              key={code}
              type="button"
              onClick={() => {
                onSelect?.(item);
                onClose?.();
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition text-left ${
                isSelected ? "bg-teal-50" : ""
              }`}
            >
              <span className="text-xl leading-none shrink-0">
                {item.flag || "🌐"}
              </span>

              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-bold text-slate-900 flex items-center gap-2">
                  {code}
                  {item.symbol && (
                    <span className="text-slate-400 font-normal">
                      {item.symbol}
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-500">
                  {item.name || code}
                </div>
              </div>

              {/* Right side converted rate */}
              <div className="text-right shrink-0">
                <div className="text-[11px] tabular-nums font-mono text-slate-600 font-semibold">
                  {getDisplayRate(item)}
                </div>
                {isSelected && (
                  <span
                    className="material-symbols-outlined text-teal-600 ml-auto mt-0.5"
                    style={{ fontSize: "14px" }}
                  >
                    check_circle
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center gap-2 text-[10.5px] text-slate-500">
        <span
          className="material-symbols-outlined"
          style={{ fontSize: "12px" }}
        >
          info
        </span>
        <span>
          Base: <span className="font-semibold">INR</span> · Auto-refreshed daily
        </span>
      </div>
    </div>
  );
}