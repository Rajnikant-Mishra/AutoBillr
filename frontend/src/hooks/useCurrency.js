import { useCurrencyStore } from "../store/currencyStore";

export default function useCurrency() {
  const {
    selectedCurrency,
    formatAmount,
    convertAmount,
    setCurrency,
    currencies,
    rates,
  } = useCurrencyStore();

  const format = (amount = 0, fromCurrency = "INR") => {
    if (formatAmount) {
      return formatAmount(amount, fromCurrency);
    }
    const sym = selectedCurrency?.symbol || "₹";
    return `${sym}${Number(amount).toLocaleString()}`;
  };

  return {
    currencySymbol: selectedCurrency?.symbol || "₹",
    currencyCode: selectedCurrency?.code || "INR",
    formatCurrency: format,

    format,
    formatAmount: format,
    selectedCurrency,
    convertAmount,
    setCurrency,
    currencies,
    rates,
  };
}