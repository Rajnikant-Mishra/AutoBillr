import { create } from "zustand";

export const useCurrencyStore = create((set) => ({
  // Available currencies from API
  currencies: [],

  // Exchange rates
  rates: {},

  // Default Currency (USD)
  selectedCurrency: {
    code: "USD",
    symbol: "$",
    flag: "🇺🇸",
    name: "US Dollar",
    rate: 1,
  },

  // Loading State
  loading: false,

  // Actions
  setLoading: (loading) =>
    set({ loading }),

  setCurrencies: (currencies) =>
    set({ currencies }),

  setRates: (rates) =>
    set({ rates }),

  setSelectedCurrency: (currency) =>
    set({ selectedCurrency: currency }),

  // Load currency from localStorage
  initializeCurrency: () => {
    try {
      const storedCurrency =
        localStorage.getItem("selectedCurrency");

      if (storedCurrency) {
        set({
          selectedCurrency: JSON.parse(
            storedCurrency
          ),
        });
      }
    } catch (error) {
      console.error(
        "Currency initialization failed:",
        error
      );
    }
  },

  // Save currency globally
  changeCurrency: (currency) => {
    localStorage.setItem(
      "selectedCurrency",
      JSON.stringify(currency)
    );

    set({
      selectedCurrency: currency,
    });
  },

  // Reset to USD
  resetCurrency: () => {
    const usdCurrency = {
      code: "USD",
      symbol: "$",
      flag: "🇺🇸",
      name: "US Dollar",
      rate: 1,
    };

    localStorage.setItem(
      "selectedCurrency",
      JSON.stringify(usdCurrency)
    );

    set({
      selectedCurrency: usdCurrency,
    });
  },
}));