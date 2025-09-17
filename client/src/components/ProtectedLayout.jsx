import { Outlet } from "react-router-dom";
import Drawer from "./common/Sidebarr"; // or Navbar if you prefer

export default function ProtectedLayout() {
  return (
    <div>
      <div className="fixed top-0 left-0 right-0 z-50">
        <Drawer />  {/* or <Navbar /> */}
      </div>
      <main className="pt-16">
        <Outlet />
      </main>
    </div>
  );
}
