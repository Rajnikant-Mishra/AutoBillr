

// import { Navigate } from "react-router-dom";

// const getAuthToken = () => {
//   const plainToken = localStorage.getItem("token");
//   if (plainToken && plainToken.startsWith("ey")) return plainToken;

//   const authStorage = localStorage.getItem("autobiller-auth");
//   if (authStorage) {
//     if (authStorage.startsWith("ey")) return authStorage;
//     try {
//       const parsed = JSON.parse(authStorage);
//       const token = parsed?.state?.token || parsed?.token;
//       if (token) return token;
//     } catch (error) {
//       // Ignore invalid stored auth payloads.
//       console.debug("Invalid auth payload", error);
//     }
//   }
//   return plainToken || authStorage || "";
// };

// export default function ProtectedRoute({ children }) {
//   const token = getAuthToken();

//   if (!token) {
//     return <Navigate to="/login" replace />;
//   }

//   return children;
// }

import { Navigate, useLocation } from "react-router-dom";

const getAuthToken = () => {
  const plainToken = localStorage.getItem("token");
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
    } catch (error) {
      console.debug("Invalid auth payload", error);
    }
  }
  return null;
};

export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const token = getAuthToken();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}