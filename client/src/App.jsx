import { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import axios from './api/axios';
import MemberDetails from './pages/MemberDetails';

import './App.css';

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
import ProtectedRoute from './components/utils/ProtectedRoute.jsx';
import LandingPage from './pages/LandingPage.jsx';
import ProtectedLayout from './components/ProtectedLayout.jsx';
import Dashboardd from './pages/Dashboard2.jsx';
import Members2 from './pages/Members2.jsx';
import CreateMemberLight from './pages/CreateMemberLight.jsx';

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
      <ScrollToTop />
      <main >
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

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
              <Route path='/members2' element={< Members2/>} />
              <Route path='/member/new/light' element={<CreateMemberLight />} />
            </Route>
          </Route>
        </Routes>
      </main>
    </div>
  );
}

export default App;