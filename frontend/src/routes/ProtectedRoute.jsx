// src/routes/ProtectedRoute.jsx

import { Navigate, useLocation } from "react-router-dom";
import { getAuthToken } from "../utils/auth";

export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const token = getAuthToken();

  if (!token) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  return children;
}