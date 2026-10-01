import { create } from "zustand";

const CACHE_KEY = "autobillr_live_rates";
const CACHE_DURATION = 12 * 60 * 60 * 1000; 

// Fallback Rates (Agar user offline ho ya API down ho)
const DEFAULT_RATES = {
  INR: 1,
  USD: 0.011, 
  EUR: 0.0099,
  GBP: 0.0085,
  CAD: 0.015,
  AUD: 0.017,
  JPY: 1.65,
  SGD: 0.014,
};

const DEFAULT_CURRENCIES = [
  { code: "INR", name: "Indian Rupee", symbol: "₹", flag: "🇮🇳", rate: 1 },
  { code: "USD", name: "US Dollar", symbol: "$", flag: "🇺🇸", rate: 0.011 },
  { code: "EUR", name: "Euro", symbol: "€", flag: "🇪🇺", rate: 0.0099 },
  { code: "GBP", name: "British Pound", symbol: "£", flag: "🇬🇧", rate: 0.0085 },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$", flag: "🇨🇦", rate: 0.015 },
  { code: "AUD", name: "Australian Dollar", symbol: "A$", flag: "🇦🇺", rate: 0.017 },
  { code: "JPY", name: "Japanese Yen", symbol: "¥", flag: "🇯🇵", rate: 1.65 },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$", flag: "🇸🇬", rate: 0.014 },
];

const getInitialCurrency = () => {
  try {
    const saved = localStorage.getItem("selectedCurrency");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.code) return parsed;
    }
  } catch (err) {
    console.error("Failed to load saved currency:", err);
  }
  return DEFAULT_CURRENCIES[0]; // DEFAULT: INR (₹)
};

export const useCurrencyStore = create((set, get) => ({
  currencies: DEFAULT_CURRENCIES,
  rates: DEFAULT_RATES,
  selectedCurrency: getInitialCurrency(),
  loading: false,
  lastUpdated: null,

  setCurrency: (currencyOrCode) => {
    let target = currencyOrCode;
    const { currencies, rates } = get();

    if (typeof currencyOrCode === "string") {
      target = currencies.find((c) => c.code === currencyOrCode) || {
        code: currencyOrCode,
        symbol: currencyOrCode === "USD" ? "$" : "₹",
        rate: rates[currencyOrCode] || 1,
      };
    }

    localStorage.setItem("selectedCurrency", JSON.stringify(target));
    localStorage.setItem("app_currency", target.code);
    localStorage.setItem("app_currency_symbol", target.symbol || "₹");

    set({ selectedCurrency: target });
  },

  changeCurrency: (currency) => get().setCurrency(currency),
  setSelectedCurrency: (currency) => get().setCurrency(currency),

  fetchCurrencies: async () => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { rates, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_DURATION) {
          set((state) => ({
            rates: { ...state.rates, ...rates },
            currencies: state.currencies.map((c) => ({
              ...c,
              rate: rates[c.code] || c.rate,
            })),
            lastUpdated: timestamp,
          }));
          return;
        }
      }

      set({ loading: true });

      const res = await fetch("https://open.er-api.com/v6/latest/INR");
      const data = await res.json();

      if (data && data.rates) {
        const newRates = { ...DEFAULT_RATES, ...data.rates };

        set((state) => ({
          rates: newRates,
          currencies: state.currencies.map((c) => ({
            ...c,
            rate: newRates[c.code] || c.rate,
          })),
          loading: false,
          lastUpdated: Date.now(),
        }));

        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({ rates: data.rates, timestamp: Date.now() })
        );
      }
    } catch (err) {
      console.warn("Using offline rates (Base INR):", err);
      set({ loading: false });
    }
  },

  convertAmount: (amount, fromCurrency = "INR") => {
    const numericAmount = Number(amount) || 0;
    const { selectedCurrency, rates } = get();
    const targetCode = selectedCurrency?.code || "INR";

    if (fromCurrency === targetCode) return numericAmount;

    const fromRate = rates[fromCurrency] || 1;
    const toRate = rates[targetCode] || 1;

    // Pehle base (INR) me badlo, fir target me
    const inBaseINR = numericAmount / fromRate;
    return inBaseINR * toRate;
  },

  // Formatter: Live currency symbol ke sath display karega
  formatAmount: (amount, fromCurrency = "INR") => {
    const { selectedCurrency, convertAmount } = get();
    const converted = convertAmount(amount, fromCurrency);
    const sym = selectedCurrency?.symbol || "₹";

    return `${sym}${Number(converted.toFixed(2)).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  },
}));