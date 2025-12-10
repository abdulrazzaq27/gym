import { useEffect, useState, Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import axios from './api/axios';

import './App.css';

import ScrollToTop from "./components/common/ScrollToTop";
import ProtectedRoute from './components/utils/ProtectedRoute.jsx';
import GuestRoute from './components/utils/GuestRoute.jsx';
import ProtectedLayout from './components/ProtectedLayout.jsx';
import { ThemeProvider } from "./components/utils/ThemeContext.jsx";
import { Toaster } from 'react-hot-toast';

// Lazy loading pages
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));
const Members = lazy(() => import('./pages/Members.jsx'));
const CreateMember = lazy(() => import('./pages/CreateMember.jsx'));
const MemberDetails = lazy(() => import('./pages/MemberDetails'));
const RenewMember = lazy(() => import('./pages/RenewMember.jsx'));
const Revenue = lazy(() => import('./pages/Revenue.jsx'));
const Attendance = lazy(() => import('./pages/Attendance.jsx'));
const AttendanceTrend = lazy(() => import('./pages/AttendanceTrend.jsx'));
const PaymentsPage = lazy(() => import('./pages/Payments.jsx'));
const SettingsPage = lazy(() => import('./pages/Settings.jsx'));
const Reports = lazy(() => import('./pages/Reports.jsx'));
const Members2 = lazy(() => import('./pages/Members2.jsx'));
const CreateMemberLight = lazy(() => import('./pages/CreateMemberLight.jsx'));
const Register = lazy(() => import('./pages/Register.jsx'));
const Login = lazy(() => import('./pages/Login.jsx'));
const LandingPage = lazy(() => import('./pages/LandingPage.jsx'));
const Profile = lazy(() => import('./pages/Profile.jsx'));

// Loading Fallback Component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

function App() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    axios.get('/')
      .then(res => {
        setMessage(res.data.message);
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="min-h-screen ">
      <ThemeProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
        <ScrollToTop />
        <main >
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route element={<GuestRoute />}>
                <Route path="/" element={<LandingPage />} />
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
              </Route>

              <Route element={<ProtectedRoute />}>
                <Route element={<ProtectedLayout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/members" element={<Members />} />
                  <Route path="/member/new" element={<CreateMember />} />
                  <Route path="/members/:id" element={<MemberDetails />} />
                  <Route path="/members/:id/RenewMember" element={<RenewMember />} />
                  <Route path="/revenue" element={<Revenue />} />
                  <Route path="/attendance" element={<Attendance />} />
                  <Route path="/attendance/trend" element={<AttendanceTrend />} />
                  <Route path="/payments" element={<PaymentsPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path='/members2' element={< Members2 />} />
                  <Route path='/member/new/light' element={<CreateMemberLight />} />
                </Route>
              </Route>
            </Routes>
          </Suspense>
        </main>
      </ThemeProvider>
    </div>
  );
}

export default App;