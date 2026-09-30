// src/utils/auth.js

const AUTH_KEY = "autobiller-auth";
const USER_KEY = "user";
const COMPANY_KEY = "company";
const SUBSCRIPTION_KEY = "subscription";

/* =========================
   TOKEN
========================= */

export const getAuthToken = () => {
  const token = localStorage.getItem(AUTH_KEY);

  if (!token) {
    return null;
  }

  return token.trim();
};

export const setAuthToken = (token) => {
  if (!token) return;

  localStorage.setItem(AUTH_KEY, String(token).trim());
};

/* =========================
   USER
========================= */

export const getCurrentUser = () => {
  try {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error("Failed to parse stored user:", error);
    return null;
  }
};

export const setCurrentUser = (user) => {
  if (!user) return;

  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

/* =========================
   COMPANY
========================= */

export const getCompany = () => {
  try {
    const company = localStorage.getItem(COMPANY_KEY);
    return company ? JSON.parse(company) : null;
  } catch (error) {
    console.error("Failed to parse stored company:", error);
    return null;
  }
};

export const setCompany = (company) => {
  if (!company) return;

  localStorage.setItem(COMPANY_KEY, JSON.stringify(company));
};

/* =========================
   SUBSCRIPTION
========================= */

export const getSubscription = () => {
  try {
    const subscription = localStorage.getItem(SUBSCRIPTION_KEY);
    return subscription ? JSON.parse(subscription) : null;
  } catch (error) {
    console.error("Failed to parse stored subscription:", error);
    return null;
  }
};

export const setSubscription = (subscription) => {
  if (!subscription) return;

  localStorage.setItem(
    SUBSCRIPTION_KEY,
    JSON.stringify(subscription)
  );
};

/* =========================
   AUTH CHECK
========================= */

export const isAuthenticated = () => {
  return Boolean(getAuthToken());
};

/* =========================
   SAVE AUTH DATA
========================= */

export const setAuthData = ({
  token,
  user,
  company,
  subscription,
}) => {
  if (token) {
    setAuthToken(token);
  }

  if (user) {
    setCurrentUser(user);
  }

  if (company) {
    setCompany(company);
  }

  if (subscription) {
    setSubscription(subscription);
  }
};

/* =========================
   LOGOUT
========================= */

export const clearAuth = () => {
  // Main authentication data
  localStorage.removeItem(AUTH_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(COMPANY_KEY);
  localStorage.removeItem(SUBSCRIPTION_KEY);

  // Old/legacy authentication key
  localStorage.removeItem("token");

  // Registration temporary data
  sessionStorage.removeItem("autobillr-registration-draft");
  sessionStorage.removeItem("autobillr-registration-email");
  sessionStorage.removeItem("autobillr-registration-verified");

  localStorage.removeItem("autobillr-registration-draft");
  localStorage.removeItem("autobillr-registration-email");
  localStorage.removeItem("autobillr-registration-verified");
};