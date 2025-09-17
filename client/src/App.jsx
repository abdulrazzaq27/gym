import { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import axios from './api/axios';
import MemberDetails from './pages/MemberDetails';



import './App.css';

import Navbar from './components/common/Navbar.jsx';
import ScrollToTop from "./components/common/ScrollToTop";
import Dashboard from './pages/Dashboard.jsx';
import Members from './pages/Members.jsx';
import CreateMember from './pages/CreateMember.jsx';
import Revenue from './pages/Revenue.jsx';
import RenewMember from './pages/RenewMember.jsx';
import Attendance from './pages/Attendance.jsx';
import AttendanceTrend from './pages/AttendanceTrend.jsx';
import Register from './pages/Register.jsx';
import Login from './pages/Login.jsx';
import SidebarLayout from './components/common/Sidebar.jsx';
import ProtectedRoute from './components/utils/ProtectedRoute.jsx';
import LandingPage from './pages/LandingPage.jsx';
import Drawer from './components/common/Sidebarr.jsx';
import ProtectedLayout from './components/ProtectedLayout.jsx';
import Dashboardd from './pages/Dashboard2.jsx';

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
      {/* Fixed Navbar */}
      <div className="fixed top-0 left-0 right-0 z-50">
        {/* <Navbar /> */}
        {/* <Drawer /> */}
      </div>

      <ScrollToTop />
      {/* Main Content with proper spacing */}
      <main >
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          {/* <Route path="/side" element={<SidebarLayout />} /> */}
          {/* <Route path="/sidee" element={<Drawer />} /> */}

          <Route element={<ProtectedRoute />}>
            <Route element={<ProtectedLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/dashboardd" element={<Dashboardd />} />
              <Route path="/members" element={<Members />} />
              <Route path="/member/new" element={<CreateMember />} />
              <Route path="/members/:id" element={<MemberDetails />} />
              <Route path="/members/:id/RenewMember" element={<RenewMember />} />
              <Route path="/revenue" element={<Revenue />} />
              <Route path="/attendance" element={<Attendance />} />
              <Route path="/attendance/trend" element={<AttendanceTrend />}
              />
            </Route>
          </Route>
        </Routes>
      </main>
    </div>
  );
}

export default App;
