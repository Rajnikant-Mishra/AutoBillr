// import { Navigate, useLocation } from "react-router-dom";

// export default function ProtectedRoute({ children }) {
//   const location = useLocation();

//   const token = localStorage.getItem("autobiller-auth");   // ← match the login key

//   if (!token) {
//     return (
//       <Navigate
//         to="/login"
//         replace
//         state={{ from: location }}
//       />
//     );
//   }

//   return children;
// }

import { Navigate } from "react-router-dom";

const getAuthToken = () => {
  const plainToken = localStorage.getItem("token");
  if (plainToken && plainToken.startsWith("ey")) return plainToken;

  const authStorage = localStorage.getItem("autobiller-auth");
  if (authStorage) {
    if (authStorage.startsWith("ey")) return authStorage;
    try {
      const parsed = JSON.parse(authStorage);
      const token = parsed?.state?.token || parsed?.token;
      if (token) return token;
    } catch {
    }
  }
  return plainToken || authStorage || "";
};

export default function ProtectedRoute({ children }) {
  const token = getAuthToken();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}