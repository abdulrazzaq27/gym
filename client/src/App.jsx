import { useEffect, useState } from 'react';
import axios from './api/axios';

function App() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    axios.get('/')
      .then(res => setMessage(res.data.message))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-gray-900">
      <h1 className="text-3xl font-bold mb-4">FitZone Admin Dashboard</h1>
      <p className="text-xl">{message}</p>
    </div>
  );
}

export default App;
