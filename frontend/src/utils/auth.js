// // src/utils/auth.js

// const AUTH_KEY = "autobiller-auth";
// const USER_KEY = "user";
// const COMPANY_KEY = "company";
// const SUBSCRIPTION_KEY = "subscription";

// /* =========================
//    TOKEN
// ========================= */

// export const getAuthToken = () => {
//   return localStorage.getItem(AUTH_KEY);
// };

// export const setAuthToken = (token) => {
//   if (token) {
//     localStorage.setItem(AUTH_KEY, token);
//   }
// };

// /* =========================
//    USER
// ========================= */

// export const getCurrentUser = () => {
//   try {
//     const user = localStorage.getItem(USER_KEY);
//     return user ? JSON.parse(user) : null;
//   } catch {
//     return null;
//   }
// };

// export const setCurrentUser = (user) => {
//   if (user) {
//     localStorage.setItem(USER_KEY, JSON.stringify(user));
//   }
// };

// /* =========================
//    COMPANY
// ========================= */

// export const getCompany = () => {
//   try {
//     const company = localStorage.getItem(COMPANY_KEY);
//     return company ? JSON.parse(company) : null;
//   } catch {
//     return null;
//   }
// };

// export const setCompany = (company) => {
//   if (company) {
//     localStorage.setItem(COMPANY_KEY, JSON.stringify(company));
//   }
// };

// /* =========================
//    SUBSCRIPTION
// ========================= */

// export const getSubscription = () => {
//   try {
//     const sub = localStorage.getItem(SUBSCRIPTION_KEY);
//     return sub ? JSON.parse(sub) : null;
//   } catch {
//     return null;
//   }
// };

// export const setSubscription = (subscription) => {
//   if (subscription) {
//     localStorage.setItem(
//       SUBSCRIPTION_KEY,
//       JSON.stringify(subscription)
//     );
//   }
// };

// /* =========================
//    AUTH
// ========================= */

// export const isAuthenticated = () => {
//   return !!getAuthToken();
// };

// /* =========================
//    SAVE AUTH DATA
// ========================= */

// export const setAuthData = ({
//   token,
//   user,
//   company,
//   subscription,
// }) => {
//   if (token) setAuthToken(token);
//   if (user) setCurrentUser(user);
//   if (company) setCompany(company);
//   if (subscription) setSubscription(subscription);
// };

// /* =========================
//    LOGOUT
// ========================= */

// export const clearAuth = () => {
//   // Main auth data
//   localStorage.removeItem(AUTH_KEY);
//   localStorage.removeItem(USER_KEY);
//   localStorage.removeItem(COMPANY_KEY);
//   localStorage.removeItem(SUBSCRIPTION_KEY);

//   // Remove old/legacy token if it exists
//   localStorage.removeItem("token");

//   // Registration temporary data
//   sessionStorage.removeItem("autobillr-registration-draft");
//   sessionStorage.removeItem("autobillr-registration-email");
//   sessionStorage.removeItem("autobillr-registration-verified");

//   // Optional: clear old localStorage registration data too
//   localStorage.removeItem("autobillr-registration-draft");
//   localStorage.removeItem("autobillr-registration-email");
//   localStorage.removeItem("autobillr-registration-verified");
// };














// src/utils/auth.js

const AUTH_KEY = "autobiller-auth";
const USER_KEY = "user";
const COMPANY_KEY = "company";
const SUBSCRIPTION_KEY = "subscription";
const LEGACY_TOKEN_KEY = "token";

/* =========================
   TOKEN
========================= */

/**
 * Returns a raw JWT string, or null.
 * Supports:
 *  - plain JWT stored in "autobiller-auth"
 *  - JSON: { token: "eyJ..." } or { state: { token: "eyJ..." } }
 *  - legacy "token" key
 */
export const getAuthToken = () => {
  // 1) Primary key
  const raw = localStorage.getItem(AUTH_KEY);

  if (raw) {
    const value = String(raw).trim();

    // Plain JWT
    if (value.startsWith("ey")) {
      return value;
    }

    // JSON wrapper
    if (value.startsWith("{")) {
      try {
        const parsed = JSON.parse(value);
        const token =
          parsed?.state?.token ||
          parsed?.token ||
          parsed?.accessToken ||
          null;

        if (token && String(token).startsWith("ey")) {
          return String(token);
        }
      } catch {
        // ignore parse error
      }
    }
  }

  // 2) Legacy key
  const legacy = localStorage.getItem(LEGACY_TOKEN_KEY);
  if (legacy && String(legacy).trim().startsWith("ey")) {
    return String(legacy).trim();
  }

  return null;
};

export const setAuthToken = (token) => {
  if (!token) return;

  // Always store plain JWT string
  const value = String(token).trim();
  localStorage.setItem(AUTH_KEY, value);

  // Keep legacy key in sync (optional, helps older code)
  localStorage.setItem(LEGACY_TOKEN_KEY, value);
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
   AUTH
========================= */

export const isAuthenticated = () => {
  return !!getAuthToken();
};

/* =========================
   SAVE AUTH DATA (after login)
========================= */

export const setAuthData = ({ token, user, company, subscription }) => {
  if (token) setAuthToken(token);
  if (user) setCurrentUser(user);
  if (company) setCompany(company);
  if (subscription) setSubscription(subscription);
};

/* =========================
   LOGOUT
========================= */

export const clearAuth = () => {
  localStorage.removeItem(AUTH_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(COMPANY_KEY);
  localStorage.removeItem(SUBSCRIPTION_KEY);
  localStorage.removeItem(LEGACY_TOKEN_KEY);

  sessionStorage.removeItem("autobillr-registration-draft");
  sessionStorage.removeItem("autobillr-registration-email");
  sessionStorage.removeItem("autobillr-registration-verified");

  localStorage.removeItem("autobillr-registration-draft");
  localStorage.removeItem("autobillr-registration-email");
  localStorage.removeItem("autobillr-registration-verified");
};