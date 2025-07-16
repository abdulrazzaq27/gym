import { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import axios from './api/axios';
import MemberDetails from './pages/MemberDetails'; // adjust path as needed



import './App.css';

import Navbar from './components/common/Navbar.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Members from './pages/Members.jsx';
import CreateMember from './pages/CreateMember.jsx';
import Revenue from './pages/Revenue.jsx';
import RenewMember from './pages/RenewMember.jsx';

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Fixed Navbar */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar />
      </div>

      {/* Main Content with proper spacing */}
      <main className="pt-20 ml-4 mr-4 mb-4">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/members" element={<Members />} />
          <Route path="/create-member" element={<CreateMember />} />
          <Route path="/members/:id" element={<MemberDetails />} />
          <Route path="/members/:id/RenewMember" element={<RenewMember />} />
          <Route path="/revenue" element={<Revenue />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
