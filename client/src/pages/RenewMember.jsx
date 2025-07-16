import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../api/axios'; // ✅ Adjust path if needed
import { User, Mail, Phone, Calendar, CreditCard, Shield, FileText, ArrowLeft, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RenewMember = () => {

    const {id} = useParams();

    const [member, setMember] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        axios.get(`/api/members/${id}`)
        .then(res => setMember(res.data))
        .catch(err => console.error("Error fetching member:", err));
    }, [id]);

    function handleSubmit() {
        navigate('./RenewMember');
    }

    function formatDate(isoDate) {
        if (!isoDate) return 'N/A';
        const date = new Date(isoDate);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    function getStatusColor(status) {
        switch (status?.toLowerCase()) {
            case 'active': return 'text-green-400 bg-green-900/20';
            case 'inactive': return 'text-red-400 bg-red-900/20';
            case 'suspended': return 'text-yellow-400 bg-yellow-900/20';
            default: return 'text-gray-400 bg-gray-900/20';
        }
    }

    function getStatusIcon(status) {
        switch (status?.toLowerCase()) {
            case 'active': return <CheckCircle className="w-4 h-4" />;
            case 'expired': return <XCircle className="w-4 h-4" />;
            case 'suspended': return <Clock className="w-4 h-4" />;
            default: return <Shield className="w-4 h-4" />;
        }
    }

    if (!member) {
    return <div className="text-white text-center">Loading member info...</div>;
}


    return (
        <>
            <div className="w-full flex justify-center mb-6">
                <h1 className="text-3xl font-bold text-white">Renew Member</h1>
            </div>

            <div className="mb-8">
                                <button
                                    onClick={() => window.history.back()}
                                    className="inline-flex items-center gap-2 hover:cursor-pointer text-gray-300 hover:text-blue-300 transition-colors duration-200 mb-6 group"
                                >
                                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
                                    Back to Members
                                </button>
            
                                <div className="flex justify-center gap-4 mb-2">
                                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                        <User className="w-8 h-8 text-white" />
                                    </div>
                                    <div>
                                        <h1 className="text-4xl font-bold text-white mb-1">{member.name}</h1>
                                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(member.status)}`}>
                                            {getStatusIcon(member.status)}
                                            {member.status || 'Unknown'}
                                        </div>
                                    </div>
                                    
                                </div>
                            </div>
        </>
    )
}

export default RenewMember