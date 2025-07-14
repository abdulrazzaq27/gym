import { useEffect, useState } from 'react';
import axios from '../api/axios';
import { Link } from 'react-router-dom';

function Members() {
  const [members, setMembers] = useState([]);

  useEffect(() => {
    axios.get('/api/members')
      .then((res) => setMembers(res.data))
      .catch((err) => console.error("Error fetching members:", err));
  }, []);

  function formatDate(isoDate) {
    const date = new Date(isoDate);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  return (
    <div className="w-full max-w-none flex flex-col items-start">
      {/* Add Member Button */}
      <div className="self-end mb-4">
        <Link
          to="/create-member"
          style={{ backgroundColor: '#ed5728' }}
          className="text-white px-4 py-2 rounded hover:bg-orange-700 transition-colors"
        >
          Add New Member
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-6 text-white text-left">Members</h1>

      {members.length === 0 ? (
        <p className="text-gray-400 text-lg text-left">No members found.</p>
      ) : (
        <div className="w-full self-start">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-sm text-left border border-gray-600 rounded-lg overflow-hidden table-auto">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-gray-200 font-semibold">#</th>
                  <th className="px-6 py-3 text-gray-200 font-semibold">Name</th>
                  <th className="px-6 py-3 text-gray-200 font-semibold">Email</th>
                  <th className="px-6 py-3 text-gray-200 font-semibold">Phone</th>
                  <th className="px-6 py-3 text-gray-200 font-semibold">Plan</th>
                  <th className="px-6 py-3 text-gray-200 font-semibold">Gender</th>
                  <th className="px-6 py-3 text-gray-200 font-semibold">Renewal Date</th>
                  <th className="px-6 py-3 text-gray-200 font-semibold">Expiry Date</th>
                  <th className="px-6 py-3 text-gray-200 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="bg-gray-800">
                {members.map((member, index) => (
                  <tr key={member._id} className="border-b border-gray-600 hover:bg-gray-750 transition-colors">
                    <td className="px-6 py-4 text-gray-300">{index + 1}</td>
                    <td className="px-6 py-4 text-white font-medium">{member.name}</td>
                    <td className="px-6 py-4 text-gray-300">{member.email}</td>
                    <td className="px-6 py-4 text-gray-300">{member.phone}</td>
                    <td className="px-6 py-4 text-blue-400 font-medium">{member.plan}</td>
                    <td className="px-6 py-4 text-gray-300">{member.gender}</td>
                    <td className="px-6 py-4 text-gray-300">{formatDate(member.renewalDate)}</td>
                    <td className="px-6 py-4 text-gray-300">{formatDate(member.expiryDate)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        member.status === 'Active' 
                          ? 'bg-green-900 text-green-300' 
                          : member.status === 'Expired'
                          ? 'bg-red-900 text-red-300'
                          : 'bg-yellow-900 text-yellow-300'
                      }`}>
                        {member.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default Members;
