import { Navigate } from "react-router-dom";

function isAuthenticated() {
  try {
    return !!localStorage.getItem("token");
  } catch (e) {
    return false;
  }
}

export default function ProtectedRoute({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/auth/login" replace />;
  }
  return children;
}
