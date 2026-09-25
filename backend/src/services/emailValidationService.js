const dns = require("dns").promises;

const resolver = new dns.Resolver({
  timeout: 1500,
  tries: 1,
});

resolver.setServers([
  "1.1.1.1",
  "8.8.8.8",
]);

/**
 * Validate basic email format
 */
const isValidEmailFormat = (email) => {
  if (typeof email !== "string") {
    return false;
  }

  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail || normalizedEmail.length > 254) {
    return false;
  }

  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/;

  return emailRegex.test(normalizedEmail);
};

/**
 * Extract domain
 */
const getDomain = (email) => {
  return email.trim().toLowerCase().split("@")[1];
};

/**
 * Check MX records
 */
const checkMxRecords = async (domain) => {
  try {
    const records = await resolver.resolveMx(domain);

    if (!records || records.length === 0) {
      return {
        valid: false,
        reason: "no_mx",
      };
    }

    return {
      valid: true,
      reason: "mx_found",
      records,
    };
  } catch (error) {
    console.error(
      `MX LOOKUP ERROR: ${domain}`,
      error.code || error.message
    );

    return {
      valid: false,
      reason: "dns_error",
    };
  }
};

/**
 * Complete email domain validation
 */
const validateEmailDomain = async (email) => {
  if (typeof email !== "string") {
    return {
      valid: false,
      reason: "invalid_format",
    };
  }

  const normalizedEmail = email.trim().toLowerCase();

  // 1. Format validation
  if (!isValidEmailFormat(normalizedEmail)) {
    return {
      valid: false,
      reason: "invalid_format",
      email: normalizedEmail,
    };
  }

  // 2. Extract domain
  const domain = getDomain(normalizedEmail);

  // 3. MX validation
  const mxResult = await checkMxRecords(domain);

  if (!mxResult.valid) {
    return {
      valid: false,
      reason: mxResult.reason,
      email: normalizedEmail,
      domain,
    };
  }

  // 4. Domain can receive email
  return {
    valid: true,
    reason: "mx_found",
    email: normalizedEmail,
    domain,
    records: mxResult.records,
  };
};

module.exports = {
  validateEmailDomain,
  isValidEmailFormat,
};