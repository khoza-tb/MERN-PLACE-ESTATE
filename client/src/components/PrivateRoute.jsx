import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function PrivateRoute({ children }) {
  const { currentUser } = useSelector(
    (state) => state.user
  );

  if (!currentUser) {
    return <Navigate to="/signin" replace />;
  }

  return children;
}