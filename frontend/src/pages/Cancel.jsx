import React from 'react';
import { XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Cancel = () => {
    const navigate = useNavigate();

    return (
        <div className="status-page">
            <div className="status-icon">
                <XCircle size={100} color="#ef4444" />
            </div>
            <h1>Payment Canceled</h1>
            <p>The payment process was canceled. If you encountered an issue, feel free to try again or contact support.</p>
            <button className="btn btn-secondary" style={{ marginTop: '2rem', maxWidth: '300px' }} onClick={() => navigate('/')}>
                Return to Pricing
            </button>
        </div>
    );
};

export default Cancel;
