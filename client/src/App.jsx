import { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import axios from './api/axios';

import './App.css';

import Navbar from './components/common/Navbar.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Members from './pages/Members.jsx';
import CreateMember from './pages/CreateMember.jsx';

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
      <main className="pt-20 px-6 bg-gray-200">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/members" element={<Members />} />
          <Route path="/create-member" element={<CreateMember />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
