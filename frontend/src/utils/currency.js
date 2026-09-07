export const convertAmount = (
  amount,
  selectedCurrency
) => {
  if (!selectedCurrency) return amount;

  return amount * selectedCurrency.rate;
};

export const formatAmount = (
  amount,
  selectedCurrency
) => {
  return new Intl.NumberFormat(
    "en-US",
    {
      style: "currency",
      currency:
        selectedCurrency?.code || "USD",
    }
  ).format(amount);
};