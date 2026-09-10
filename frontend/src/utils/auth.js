// src/utils/auth.js

const AUTH_KEY = "autobiller-auth";
const USER_KEY = "user";
const COMPANY_KEY = "company";
const SUBSCRIPTION_KEY = "subscription";

/* =========================
   TOKEN
========================= */

export const getAuthToken = () => {
  return localStorage.getItem(AUTH_KEY);
};

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem(AUTH_KEY, token);
  }
};

/* =========================
   USER
========================= */

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

/* =========================
   COMPANY
========================= */

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

/* =========================
   SUBSCRIPTION
========================= */

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

/* =========================
   HELPERS
========================= */

export const isAuthenticated = () => {
  return !!getAuthToken();
};

/**
 * Save everything after successful login / register
 */
export const setAuthData = ({ token, user, company, subscription }) => {
  if (token) setAuthToken(token);
  if (user) setCurrentUser(user);
  if (company) setCompany(company);
  if (subscription) setSubscription(subscription);
};

/**
 * Production logout – clears everything
 */
export const clearAuth = () => {
  localStorage.removeItem(AUTH_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(COMPANY_KEY);
  localStorage.removeItem(SUBSCRIPTION_KEY);

  // Optional: clear any temporary registration data
  sessionStorage.removeItem("autobillr-registration-draft");
  sessionStorage.removeItem("autobillr-registration-email");
};