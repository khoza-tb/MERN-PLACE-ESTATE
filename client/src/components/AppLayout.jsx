import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";

export default function AppLayout() {
  const location = useLocation();

  const isAdminRoute =
    location.pathname === "/admin" ||
    location.pathname.startsWith("/admin/");

  return (
    <>
      {!isAdminRoute && <Header />}
      <Outlet />
    </>
  );
}