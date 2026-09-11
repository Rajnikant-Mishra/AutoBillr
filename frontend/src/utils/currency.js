
/**
 * Currency utility functions
 *
 * Responsibilities:
 * - Safely convert values to numbers
 * - Format amounts using Intl.NumberFormat
 * - Convert amounts using exchange rates
 * - Read currency metadata safely
 * - Parse user-entered amounts
 */

/**
 * Safely convert a value to a number.
 *
 * @param {unknown} value
 * @returns {number}
 */
const toNumber = (value) => {
  if (value === null || value === undefined || value === "") {
    return 0;
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : 0;
};

/**
 * Format an amount using the selected currency.
 *
 * Example:
 *
 * formatAmount(125000, {
 *   code: "INR",
 *   locale: "en-IN"
 * })
 *
 * => ₹1,25,000.00
 *
 * @param {number|string} amount
 * @param {object|null} currency
 * @param {object} options
 * @returns {string}
 */
export const formatAmount = (
  amount,
  currency,
  options = {}
) => {
  const numericAmount = toNumber(amount);

  const currencyCode =
    currency?.code?.toUpperCase() || "USD";

  const locale =
    currency?.locale || "en-US";

  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currencyCode,
      ...options,
    }).format(numericAmount);
  } catch (error) {
    console.error(
      `Currency formatting failed for ${currencyCode}:`,
      error
    );

    // Safe fallback
    const decimalDigits =
      Number.isInteger(currency?.decimalDigits) &&
      currency.decimalDigits >= 0
        ? currency.decimalDigits
        : 2;

    const symbol =
      currency?.symbol || currencyCode;

    return `${symbol}${numericAmount.toFixed(
      decimalDigits
    )}`;
  }
};

/**
 * Convert an amount using an exchange rate.
 *
 * Example:
 *
 * INR 1000 × 0.012 = USD 12
 *
 * IMPORTANT:
 * This should be used for display/conversion.
 * Do not use JavaScript floating-point calculations
 * as the source of truth for financial database values.
 *
 * @param {number|string} amount
 * @param {number|string} rate
 * @returns {number}
 */
export const convertAmount = (
  amount,
  rate
) => {
  const numericAmount = toNumber(amount);
  const numericRate = Number(rate);

  if (
    !Number.isFinite(numericRate) ||
    numericRate < 0
  ) {
    return numericAmount;
  }

  return numericAmount * numericRate;
};

/**
 * Convert and format an amount.
 *
 * @param {number|string} amount
 * @param {object|null} currency
 * @param {number|string} rate
 * @param {object} options
 * @returns {string}
 */
export const convertAndFormatAmount = (
  amount,
  currency,
  rate,
  options = {}
) => {
  const convertedAmount = convertAmount(
    amount,
    rate
  );

  return formatAmount(
    convertedAmount,
    currency,
    options
  );
};

/**
 * Get currency symbol safely.
 *
 * @param {object|null} currency
 * @returns {string}
 */
export const getCurrencySymbol = (
  currency
) => {
  return (
    currency?.symbol ||
    currency?.code?.toUpperCase() ||
    "USD"
  );
};

/**
 * Get currency code safely.
 *
 * @param {object|null} currency
 * @returns {string}
 */
export const getCurrencyCode = (
  currency
) => {
  return (
    currency?.code?.toUpperCase() ||
    "USD"
  );
};

/**
 * Get currency locale safely.
 *
 * @param {object|null} currency
 * @returns {string}
 */
export const getCurrencyLocale = (
  currency
) => {
  return (
    currency?.locale ||
    "en-US"
  );
};

/**
 * Get decimal digits for a currency.
 *
 * @param {object|null} currency
 * @returns {number}
 */
export const getCurrencyDecimals = (
  currency
) => {
  if (
    Number.isInteger(currency?.decimalDigits) &&
    currency.decimalDigits >= 0
  ) {
    return currency.decimalDigits;
  }

  return 2;
};

/**
 * Parse a currency amount safely.
 *
 * Handles:
 *
 * "1,25,000"   -> 125000
 * "₹1,25,000"  -> 125000
 * "$1,250.50"  -> 1250.50
 * "1250.50"    -> 1250.50
 *
 * @param {string|number} value
 * @returns {number}
 */
export const parseAmount = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return 0;
  }

  if (typeof value === "number") {
    return Number.isFinite(value)
      ? value
      : 0;
  }

  let cleanedValue = String(value)
    .trim()
    // Remove currency symbols and letters
    .replace(/[^\d.,-]/g, "");

  if (!cleanedValue) {
    return 0;
  }

  /**
   * Handle numbers containing both comma and dot.
   *
   * Example:
   * 1,250.50 -> 1250.50
   */
  if (
    cleanedValue.includes(",") &&
    cleanedValue.includes(".")
  ) {
    cleanedValue = cleanedValue.replace(/,/g, "");
  } else if (
    cleanedValue.includes(",")
  ) {
    /**
     * If comma exists without a dot,
     * treat commas as thousands separators.
     *
     * 1,25,000 -> 125000
     */
    cleanedValue = cleanedValue.replace(/,/g, "");
  }

  const parsed = Number(cleanedValue);

  return Number.isFinite(parsed)
    ? parsed
    : 0;
};

/**
 * Check whether a currency object is valid.
 *
 * @param {object|null} currency
 * @returns {boolean}
 */
export const isValidCurrency = (
  currency
) => {
  if (!currency) {
    return false;
  }

  const code =
    currency?.code?.toUpperCase();

  if (!code) {
    return false;
  }

  try {
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: code,
    });

    return true;
  } catch {
    return false;
  }
};

/**
 * Get a safe currency object.
 *
 * @param {object|null} currency
 * @returns {object}
 */
export const normalizeCurrency = (
  currency
) => {
  const code =
    currency?.code?.toUpperCase() || "USD";

  return {
    code,
    name:
      currency?.name || code,
    symbol:
      currency?.symbol || code,
    decimalDigits:
      getCurrencyDecimals(currency),
    locale:
      getCurrencyLocale(currency),
  };
};

