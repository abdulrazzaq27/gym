import { useEffect, useState } from 'react';
import axios from '../api/axios';

function Members() {
  const [members, setMembers] = useState([]);

  useEffect(() => {
    axios.get('/api/members')
      .then((res) => setMembers(res.data))
      .catch((err) => console.error("Error fetching members:", err));
  }, []);

  function formatDate(isoDate) {
  const date = new Date(isoDate);
  const day = String(date.getDate()).padStart(2, '0');     // dd
  const month = String(date.getMonth() + 1).padStart(2, '0'); // mm
  const year = date.getFullYear();                          // yyyy
  return `${day}/${month}/${year}`;
}


  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Members</h1>

      {members.length === 0 ? (
        <p className="text-gray-600">No members found.</p>
      ) : (
        <div className="overflow-x- mb-4">
          <table className="min-w-full text-sm text-left text-gray-700 border">
            <thead className="bg-gray-300">
              <tr>
                <th className="px-4 py-2">#</th>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Phone</th>
                <th className="px-4 py-2">Plan</th>
                <th className="px-4 py-2">Gender</th>
                <th className="px-4 py-2">Renewal Date</th>
                <th className="px-4 py-2">Expiry Date</th>
                <th className="px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member, index) => (
                <tr key={member._id} className="border-b">
                  <td className="px-4 py-2">{index + 1}</td>
                  <td className="px-4 py-2">{member.name}</td>
                  <td className="px-4 py-2">{member.email}</td>
                  <td className="px-4 py-2">{member.phone}</td>
                  <td className="px-4 py-2">{member.plan}</td>
                  <td className="px-4 py-2">{member.gender}</td>
                  <td className="px-4 py-2">{formatDate(member.renewalDate)}</td>
                  <td className="px-4 py-2">{formatDate(member.expiryDate)}</td>
                  <td className="px-4 py-2">{member.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Members;
