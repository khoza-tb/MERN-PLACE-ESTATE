import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function AdminRoute({ children }) {
  const { currentUser } = useSelector(
    (state) => state.user
  );

  // No logged-in user
  if (!currentUser) {
    return (
      <Navigate
        to="/admin/signin"
        replace
      />
    );
  }

  // Logged-in user is not an admin
  if (currentUser.role !== "admin") {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  return children;
}