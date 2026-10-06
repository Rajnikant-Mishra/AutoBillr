const validateWithZeroBounce = async (email) => {
  const apiKey = process.env.ZEROBOUNCE_API_KEY;
  const apiUrl =
    process.env.ZEROBOUNCE_API_URL ||
    "https://api.zerobounce.net/v2/validate";

  if (!apiKey || apiKey === "your-zero-bounce-api-key") {
    throw new Error("ZeroBounce API key is not configured");
  }

  const url =
    `${apiUrl}?api_key=${encodeURIComponent(apiKey)}` +
    `&email=${encodeURIComponent(email)}` +
    `&ip_address=`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `ZeroBounce request failed: ${response.status}`
    );
  }

  const data = await response.json();

  return data;
};

module.exports = validateWithZeroBounce;