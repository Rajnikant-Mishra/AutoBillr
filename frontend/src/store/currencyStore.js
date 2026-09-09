// import { create } from "zustand";

// export const useCurrencyStore = create((set) => ({
//   // Available currencies from API
//   currencies: [],

//   // Exchange rates
//   rates: {},

//   // Default Currency (USD)
//   selectedCurrency: {
//     code: "USD",
//     symbol: "$",
//     flag: "🇺🇸",
//     name: "US Dollar",
//     rate: 1,
//   },

//   // Loading State
//   loading: false,

//   // Actions
//   setLoading: (loading) =>
//     set({ loading }),

//   setCurrencies: (currencies) =>
//     set({ currencies }),

//   setRates: (rates) =>
//     set({ rates }),

//   setSelectedCurrency: (currency) =>
//     set({ selectedCurrency: currency }),

//   // Load currency from localStorage
//   initializeCurrency: () => {
//     try {
//       const storedCurrency =
//         localStorage.getItem("selectedCurrency");

//       if (storedCurrency) {
//         set({
//           selectedCurrency: JSON.parse(
//             storedCurrency
//           ),
//         });
//       }
//     } catch (error) {
//       console.error(
//         "Currency initialization failed:",
//         error
//       );
//     }
//   },

//   // Save currency globally
//   changeCurrency: (currency) => {
//     localStorage.setItem(
//       "selectedCurrency",
//       JSON.stringify(currency)
//     );

//     set({
//       selectedCurrency: currency,
//     });
//   },

//   // Reset to USD
//   resetCurrency: () => {
//     const usdCurrency = {
//       code: "USD",
//       symbol: "$",
//       flag: "🇺🇸",
//       name: "US Dollar",
//       rate: 1,
//     };

//     localStorage.setItem(
//       "selectedCurrency",
//       JSON.stringify(usdCurrency)
//     );

//     set({
//       selectedCurrency: usdCurrency,
//     });
//   },
// }));

import { create } from "zustand";

// Exchange Rates (Base: 1 USD)
// 1 USD = 94 INR  -->  1 INR = 0.01064 USD (~0.011 USD)
const DEFAULT_RATES = {
  USD: 1,
  INR: 94,
  EUR: 0.92,
  GBP: 0.79,
  CAD: 1.36,
  AUD: 1.52,
  JPY: 155,
  SGD: 1.35,
};

const DEFAULT_CURRENCIES = [
  { code: "INR", name: "Indian Rupee", symbol: "₹", flag: "🇮🇳", rate: 94 },
  { code: "USD", name: "US Dollar", symbol: "$", flag: "🇺🇸", rate: 1 },
  { code: "EUR", name: "Euro", symbol: "€", flag: "🇪🇺", rate: 0.92 },
  { code: "GBP", name: "British Pound", symbol: "£", flag: "🇬🇧", rate: 0.79 },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$", flag: "🇨🇦", rate: 1.36 },
  { code: "AUD", name: "Australian Dollar", symbol: "A$", flag: "🇦🇺", rate: 1.52 },
  { code: "JPY", name: "Japanese Yen", symbol: "¥", flag: "🇯🇵", rate: 155 },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$", flag: "🇸🇬", rate: 1.35 },
];

// LocalStorage se turant load karega (Reload bug fix)
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
  return DEFAULT_CURRENCIES[1]; // Default USD
};

export const useCurrencyStore = create((set, get) => ({
  currencies: DEFAULT_CURRENCIES,
  rates: DEFAULT_RATES,
  selectedCurrency: getInitialCurrency(),
  loading: false,

  // 1. Currency change & LocalStorage lock
  setCurrency: (currencyOrCode) => {
    let target = currencyOrCode;
    const { currencies } = get();

    if (typeof currencyOrCode === "string") {
      target = currencies.find((c) => c.code === currencyOrCode) || {
        code: currencyOrCode,
        symbol: currencyOrCode === "INR" ? "₹" : "$",
        rate: DEFAULT_RATES[currencyOrCode] || 1,
      };
    }

    // Save to localStorage immediately
    localStorage.setItem("selectedCurrency", JSON.stringify(target));
    localStorage.setItem("app_currency", target.code);
    localStorage.setItem("app_currency_symbol", target.symbol || "$");

    set({ selectedCurrency: target });
  },

  changeCurrency: (currency) => get().setCurrency(currency),
  setSelectedCurrency: (currency) => get().setCurrency(currency),

  // 2. Fetch live rates (Optional fallback to default)
  fetchCurrencies: async () => {
    try {
      const res = await fetch("https://open.er-api.com/v6/latest/USD");
      const data = await res.json();
      if (data && data.rates) {
        set((state) => ({
          rates: { ...state.rates, ...data.rates },
        }));
      }
    } catch (error) {
      console.warn("Using offline conversion rates (1 USD = 94 INR)", error);
    }
  },

  convertAmount: (amount, fromCurrency = "USD") => {
    const numericAmount = Number(amount) || 0;
    const { selectedCurrency, rates } = get();
    const targetCode = selectedCurrency?.code || "USD";

    if (fromCurrency === targetCode) {
      return numericAmount;
    }

    const fromRate = rates[fromCurrency] || 1;
    const amountInUSD = fromCurrency === "USD" ? numericAmount : numericAmount / fromRate;

    const targetRate = rates[targetCode] || 1;
    return amountInUSD * targetRate;
  },

  // 4. Formatted Display Helper: e.g. ₹9,400 ya $100
  formatAmount: (amount, fromCurrency = "USD") => {
    const { selectedCurrency, convertAmount } = get();
    const converted = convertAmount(amount, fromCurrency);
    const sym = selectedCurrency?.symbol || "$";

    return `${sym}${Number(converted.toFixed(2)).toLocaleString()}`;
  },
}));