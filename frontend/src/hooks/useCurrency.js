import { useCurrencyStore } from "../store/currencyStore";

export default function useCurrency() {
  const selectedCurrency = useCurrencyStore(
    (state) => state.selectedCurrency
  );

  const format = (amount = 0) => {
    const converted =
      Number(amount) * (selectedCurrency?.rate || 1);

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: selectedCurrency?.code || "USD",
    }).format(converted);
  };

  return {
    selectedCurrency,
    format,
  };
}