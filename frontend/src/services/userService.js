// import { getAuthToken } from "../utils/auth";

// const API_URL =
//   import.meta.env.VITE_API_URL ||
//   "http://localhost:5000/api/v1";

// export const getProfile = async () => {
//   const token = getAuthToken();

//   if (!token) {
//     throw new Error("Authentication required");
//   }

//   const response = await fetch(
//     `${API_URL}/users/me`,
//     {
//       method: "GET",
//       headers: {
//         Authorization: `Bearer ${token}`,
//         Accept: "application/json",
//       },
//       cache: "no-store",
//     }
//   );

//   const data = await response.json();

//   if (!response.ok) {
//     throw new Error(
//       data?.message ||
//         "Failed to fetch profile"
//     );
//   }

//   return data;
// };















import { getAuthToken } from "../utils/auth";

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api/v1"
).replace(/\/$/, "");

export const getProfile = async () => {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Authentication required. Please log in again.");
  }

  const response = await fetch(`${API_URL}/users/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  const responseText = await response.text();

  let data = {};

  try {
    data = responseText ? JSON.parse(responseText) : {};
  } catch {
    throw new Error("The server returned an invalid response.");
  }

  if (!response.ok) {
    console.error("GET PROFILE FAILED:", {
      status: response.status,
      code: data.code,
      message: data.message,
    });

    throw new Error(
      data.message || `Profile request failed (${response.status})`
    );
  }

  if (!data.user) {
    throw new Error("The server response does not contain user details.");
  }

  return data;
};



