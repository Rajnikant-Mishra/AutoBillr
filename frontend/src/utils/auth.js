const AUTH_KEY = "token";
const USER_KEY = "user";
const COMPANY_KEY = "company";
const SUBSCRIPTION_KEY = "subscription";

// ============================================================
// TOKEN HELPERS
// ============================================================

export const getAuthToken = () => {
  const plainToken = localStorage.getItem(AUTH_KEY);
  if (
    plainToken &&
    plainToken !== "null" &&
    plainToken !== "undefined" &&
    plainToken.trim() !== "" &&
    plainToken.startsWith("ey")
  ) {
    return plainToken;
  }

  const authStorage = localStorage.getItem("autobiller-auth");
  if (authStorage) {
    if (authStorage.startsWith("ey")) return authStorage;
    try {
      const parsed = JSON.parse(authStorage);
      const token = parsed?.state?.token || parsed?.token;
      if (
        token &&
        typeof token === "string" &&
        token !== "null" &&
        token !== "undefined" &&
        token.trim() !== ""
      ) {
        return token;
      }
    } catch {
      // ignore json error
    }
  }

  return plainToken || null;
};

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem(AUTH_KEY, token);
  }
};

export const removeAuthToken = () => {
  localStorage.removeItem(AUTH_KEY);
};

// ============================================================
// USER HELPERS
// ============================================================

export const getCurrentUser = () => {
  try {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

export const setCurrentUser = (user) => {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
};

export const removeCurrentUser = () => {
  localStorage.removeItem(USER_KEY);
};

// ============================================================
// COMPANY & SUBSCRIPTION HELPERS
// ============================================================

export const getCompany = () => {
  try {
    const company = localStorage.getItem(COMPANY_KEY);
    return company ? JSON.parse(company) : null;
  } catch {
    return null;
  }
};

export const setCompany = (company) => {
  if (company) {
    localStorage.setItem(COMPANY_KEY, JSON.stringify(company));
  }
};

export const getSubscription = () => {
  try {
    const sub = localStorage.getItem(SUBSCRIPTION_KEY);
    return sub ? JSON.parse(sub) : null;
  } catch {
    return null;
  }
};

export const setSubscription = (subscription) => {
  if (subscription) {
    localStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(subscription));
  }
};

// ============================================================
// BATCH AUTH DATA (REQUIRED BY LOGIN.JSX)
// ============================================================

export const setAuthData = (data = {}) => {
  if (!data) return;
  const { token, user, company, subscription } = data;
  if (token) setAuthToken(token);
  if (user) setCurrentUser(user);
  if (company) setCompany(company);
  if (subscription) setSubscription(subscription);
};

export const getAuthData = () => {
  return {
    token: getAuthToken(),
    user: getCurrentUser(),
    company: getCompany(),
    subscription: getSubscription(),
  };
};

// ============================================================
// AUTH STATUS & LOGOUT CLEANUP
// ============================================================

export const isAuthenticated = () => {
  return Boolean(getAuthToken());
};

export const clearAuth = () => {
  localStorage.removeItem(AUTH_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(COMPANY_KEY);
  localStorage.removeItem(SUBSCRIPTION_KEY);
  localStorage.removeItem("autobiller-auth");
  sessionStorage.clear();
};