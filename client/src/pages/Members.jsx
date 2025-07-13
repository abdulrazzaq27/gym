import { useEffect, useState } from 'react';
import axios from '../api/axios';

function Members() {
  const [members, setMembers] = useState([]);

  useEffect(() => {
    axios.get('/api/members')
      .then((res) => setMembers(res.data))
      .catch((err) => console.error("Error fetching members:", err));
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Members</h1>

      {members.length === 0 ? (
        <p className="text-gray-600">No members found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left text-gray-700 border">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-4 py-2">#</th>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Phone</th>
                <th className="px-4 py-2">Plan</th>
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
