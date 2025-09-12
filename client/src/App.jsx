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
import ProtectedRoute from './components/utils/ProtectedRoute.jsx';

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
    <div className="min-h-screen bg-black dark:bg-gray-900">
      {/* Fixed Navbar */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar />
      </div>

      <ScrollToTop/>
      {/* Main Content with proper spacing */}
      <main className="pt-20 ml-4 mr-4 mb-4">
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/members" element={<Members />} />
            <Route path="/member/new" element={<CreateMember />} />
            <Route path="/members/:id" element={<MemberDetails />} />
            <Route path="/members/:id/RenewMember" element={<RenewMember />} />
            <Route path="/revenue" element={<Revenue />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/attendance/trend" element={<AttendanceTrend />} />
          </Route>
        </Routes>
      </main>
    </div>
  );
}

export default App;
