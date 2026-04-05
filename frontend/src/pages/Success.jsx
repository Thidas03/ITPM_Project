import React from 'react';
import { CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Success = () => {
    const navigate = useNavigate();

    return (
        <div className="status-page">
            <div className="status-icon">
                <CheckCircle size={100} color="#22c55e" />
            </div>
            <h1>Welcome to Premium!</h1>
            <p>Your subscription was successful. You now have access to all premium features including the AI Summarizer.</p>
            <button className="btn btn-primary" style={{ marginTop: '2rem', maxWidth: '300px' }} onClick={() => navigate('/')}>
                Back to Dashboard
            </button>
        </div>
    );
};

export default Success;
