import { getAuthToken } from "../utils/auth";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api/v1";

export const getProfile = async () => {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Authentication required");
  }

  const response = await fetch(
    `${API_URL}/users/me`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      cache: "no-store",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message ||
        "Failed to fetch profile"
    );
  }

  return data;
};