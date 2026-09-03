const AUTH_KEY = "autobiller-auth";
const USER_KEY = "user";

export const getAuthToken = () => {
  return localStorage.getItem(AUTH_KEY);
};

export const setAuthToken = (token) => {
  localStorage.setItem(AUTH_KEY, token);
};

export const clearAuth = () => {
  localStorage.removeItem(AUTH_KEY);
  localStorage.removeItem(USER_KEY);
};

export const getCurrentUser = () => {
  const user = localStorage.getItem(USER_KEY);

  if (!user) {
    return null;
  }

  try {
    return JSON.parse(user);
  } catch {
    return null;
  }
};