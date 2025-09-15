import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute() {
  const token = localStorage.getItem("token"); // check if logged in

  if (!token) {
    return <Navigate to="/" replace />; // redirect to landing page
  }

  return <Outlet />; // render the child routes (Dashboard, Members, etc.)
}
