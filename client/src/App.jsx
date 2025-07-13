import { useEffect, useState } from 'react';
import {Routes, Route} from 'react-router-dom'
import axios from './api/axios';

import './App.css'

import Navbar from './components/common/Navbar.jsx';
import Dashboard from './pages/Dashboard.jsx'
import Members from './pages/Members.jsx';

function App() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    axios.get('/')
      .then(res => {
        setMessage(res.data.message)
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-50 bg-white border-b border-gray-200 dark:bg-gray-900 shadow">
        <Navbar />
      </nav>

      <main className="pt-20 px-6">

        <Routes>
          <Route path='/' element={ <Dashboard/> }/>
          <Route path='/members' element={ <Members/> }/>
        </Routes>

      </main>


    </>
  );
}

export default App;
