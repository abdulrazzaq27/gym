import React from "react";
import { logout } from "../utils/auth";
import { useNavigate } from "react-router-dom";

export default function SidebarLayout() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  return (
    <>
      <button
        data-drawer-target="logo-sidebar"
        data-drawer-toggle="logo-sidebar"
        aria-controls="logo-sidebar"
        type="button"
        className="inline-flex items-center p-2 mt-2 ms-3 text-sm text-gray-500 rounded-lg sm:hidden 
                   hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 
                   dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
      >
        <span className="sr-only">Open sidebar</span>
        <svg
          className="w-6 h-6"
          // aria-hidden="true"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            clipRule="evenodd"
            fillRule="evenodd"
            d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 
               10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 
               1.5h-7.5a.75.75 0 01-.75-.75zM2 
               10a.75.75 0 01.75-.75h14.5a.75.75 0 010 
               1.5H2.75A.75.75 0 012 10z"
          />
        </svg>
      </button>

      <aside
        id="logo-sidebar"
        className="fixed top-0 left-0 z-40 w-64 h-screen transition-transform 
                   -translate-x-full sm:translate-x-0"
        aria-label="Sidebar"
      >
        <div className="h-full px-3 py-4 overflow-y-auto bg-[#21212a]">
          <a href="/" className="flex items-center ps-2.5 mb-5">
            <img src="/gym.png" className="h-8 w-8 rounded-lg" alt="FitZone Logo" />
            <span className="self-center text-xl font-semibold whitespace-nowrap dark:text-white">
              FitZone Admin
            </span>
          </a>
          <ul className="space-y-2 font-medium">
            <li>
              <a
                href="/"
                className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white 
                           hover:bg-gray-100 dark:hover:bg-gray-700 group"
              >
                <div>
                  <img src="/dashboard.png" className="w-6 h-6" alt="" />
                </div>
                <span className="ms-3">Dashboard</span>
              </a>
            </li>

            <li>
              <a
                href="/members"
                className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white 
                           hover:bg-gray-100 dark:hover:bg-gray-700 group"
              >
                <div>
                  <img src="/members.png" className="w-6 h-6" alt="" />
                </div>
                <span className="ms-3">Members</span>
              </a>
            </li>

            <li>
              <a
                href="/attendance"
                className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white 
                           hover:bg-gray-100 dark:hover:bg-gray-700 group"
              >
                <div>
                  <img src="/attendance.png" className="w-6 h-6" alt="" />
                </div>
                <span className="ms-3">Attendance</span>
              </a>
            </li>

            <li>
              <a
                href="/revenue"
                className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white 
                           hover:bg-gray-100 dark:hover:bg-gray-700 group"
              >
                <div>
                  <img src="/revenue.png" className="w-6 h-6" alt="" />
                </div>
                <span className="ms-3">Revenue</span>
              </a>
            </li>

            <li>
              <a
                href="/reports"
                className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white 
                           hover:bg-gray-100 dark:hover:bg-gray-700 group"
              >
                <div>
                   <img src="/report.png" 
                        className="w-6 h-6 grayscale" 
                        alt="" 
                        onError={(e) => {
                            e.target.onerror = null; 
                            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWZpbGUtdGV4dCI+PHBhdGggZD0iTTE1IDJIM1YyMkgxNlYxNEwxNSAyWiI+PC9wYXRoPjxwYXRoIGQ9Ik0xNCAyVjEzSDE0SDEwaDQtNEgxNGg1VjJ6Ii8+PHBhdGggZD0iTTE2IDEzSDE1bS02IDZIMTQgbS02LWYgOEgzOCIvPjwvc3ZnPg=='; // Fallback to SVG if png missing
                        }}
                    />
                </div>
                <span className="ms-3">Reports</span>
              </a>
            </li>

            <li>
              <a
                href="/settings"
                className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white 
                           hover:bg-gray-100 dark:hover:bg-gray-700 group"
              >
                <div>
                  <img src="/settings.png" className="w-6 h-6" alt="" />
                </div>
                <span className="ms-3">Settings</span>
              </a>
            </li>

          </ul>
          <li>

            {token ? (
              <button
                onClick={() => logout(navigate)}
                className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white 
               hover:bg-gray-100 dark:hover:bg-gray-700 group cursor-pointer"
              >
                <div>
                  <img src="/logout.png" className="w-5 h-5" alt="" />
                </div>
                <span className="ms-3">Logout</span>
              </button>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white 
               hover:bg-gray-100 dark:hover:bg-gray-700 group cursor-pointer"
              >
                <div>
                  <img src="/login.png" className="w-5 h-5" alt="" />
                </div>
                <span className="ms-3">Login</span>
              </button>
            )}


          </li>
        </div>
      </aside>

    </>
  );
}
