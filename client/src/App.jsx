import { useEffect, useState } from 'react';
import axios from './api/axios';
import './App.css'
import  Navbar  from './components/common/Navbar.jsx';

function App() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    axios.get('/')
      .then(res => {setMessage(res.data.message)
      })
      .catch(err => console.error(err));
  }, []);

  return (
      <>
      <nav className="fixed top-0 left-0 w-full z-50 bg-white border-b border-gray-200 dark:bg-gray-900 shadow">
        <Navbar/>
      </nav>

    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-gray-900">
    </div>
      </>
  );
}

export default App;
