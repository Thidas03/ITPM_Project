import React from 'react';
import axios from 'axios';
import { Check, X } from 'lucide-react';

const Pricing = () => {
    const sessions = [
        {
            id: 'session_math_101',
            name: 'Mathematics 101',
            instructor: 'Dr. Smith',
            price: '10',
            priceId: 'price_math_placeholder',
            features: [
                'Basic Video Access',
                'Live Q&A Participation',
                'Session Recording (24h)',
            ],
            type: 'Foundation'
        },
        {
            id: 'session_ai_intro',
            name: 'Intro to AI',
            instructor: 'Prof. J. Doe',
            price: '25',
            priceId: 'price_ai_placeholder',
            features: [
                'HD Video Access',
                'Advanced AI Summarizer',
                'Live Project Collaboration',
                'Session Recording (Lifetime)',
            ],
            isPremium: true,
            type: 'Advanced'
        }
    ];

    const bundles = [
        {
            id: 'bundle_stem_pack',
            name: 'STEM Mastery Bundle',
            instructor: 'Multiple Tutors',
            price: '40',
            priceId: 'price_bundle_placeholder',
            features: [
                'All Math 101 Sessions',
                'All Science 101 Sessions',
                'Bonus: Downloadable Notes',
                'Priority Support',
            ],
            isBundle: true
        }
    ];

    const handleSessionPayment = async (priceId, sessionId) => {
        try {
            const userId = 'placeholder_user_id';

            const response = await axios.post('http://localhost:5000/api/stripe/create-checkout-session', {
                userId,
                priceId,
                sessionId
            });

            if (response.data.url) {
                window.location.href = response.data.url;
            }
        } catch (error) {
            console.error('Payment error:', error);
            alert('Failed to initiate checkout. Please try again.');
        }
    };

    return (
        <div className="container">
            <header className="pricing-header">
                <h1>Book Your Next Session</h1>
                <p>Pay only for the classes you want to attend.</p>
                <div style={{ marginTop: '1rem' }}>
                    <button className="btn btn-secondary" style={{ width: 'auto', padding: '0.5rem 1.5rem' }} onClick={() => window.location.href = '/dashboard'}>
                        Go to My Dashboard
                    </button>
                </div>
            </header>

            <h2 style={{ marginBottom: '2rem', textAlign: 'center' }}>Single Sessions</h2>
            <div className="pricing-grid" style={{ marginBottom: '4rem' }}>
                {sessions.map((session, index) => (
                    <div key={index} className={`pricing-card ${session.isPremium ? 'premium' : ''}`}>
                        {session.isPremium && <div className="badge">Featured</div>}
                        <h2 className="tier-name">{session.name}</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>{session.instructor}</p>
                        <div className="price">${session.price}<span>/session</span></div>

                        <ul className="features-list">
                            {session.features.map((feature, fIndex) => (
                                <li key={fIndex} className="feature-item">
                                    <Check size={20} className="text-success" color="#22c55e" />
                                    {feature}
                                </li>
                            ))}
                        </ul>

                        <button
                            className={`btn ${session.isPremium ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => handleSessionPayment(session.priceId, session.id)}
                        >
                            Pay & Register
                        </button>
                    </div>
                ))}
            </div>

            <h2 style={{ marginBottom: '2rem', textAlign: 'center' }}>Value Bundles</h2>
            <div className="pricing-grid">
                {bundles.map((bundle, index) => (
                    <div key={index} className="pricing-card premium" style={{ border: '2px dashed var(--primary)' }}>
                        <div className="badge">Save 30%</div>
                        <h2 className="tier-name">{bundle.name}</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>{bundle.instructor}</p>
                        <div className="price">${bundle.price}<span>/bundle</span></div>

                        <ul className="features-list">
                            {bundle.features.map((feature, fIndex) => (
                                <li key={fIndex} className="feature-item">
                                    <Check size={20} className="text-success" color="#22c55e" />
                                    {feature}
                                </li>
                            ))}
                        </ul>

                        <button
                            className="btn btn-primary"
                            onClick={() => handleSessionPayment(bundle.priceId, bundle.id)}
                        >
                            Buy Bundle
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Pricing;
