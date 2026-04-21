import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { toast } from 'react-toastify';
import './CheckoutModal.css';

const CheckoutModal = ({ isOpen, onClose, selectedItem, onSuccess }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        name: user?.firstName + ' ' + user?.lastName || '',
        email: user?.email || '',
        cardNumber: '',
        expiry: '',
        cvc: ''
    });
    const [errors, setErrors] = useState({});
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('card'); // 'card' or 'wallet'
    const [walletBalance, setWalletBalance] = useState(0);
    const [loadingBalance, setLoadingBalance] = useState(false);
    const [discount, setDiscount] = useState(null);

    useEffect(() => {
        if (isOpen && user) {
            fetchWalletBalance();
            
            const tutorId = selectedItem?.instructorId || selectedItem?.originalSession?.tutor?._id || selectedItem?.originalSession?.tutor;
            if (tutorId) {
                fetchTutorDiscount(tutorId);
            }
        }
    }, [isOpen, user, selectedItem]);

    const fetchTutorDiscount = async (resolvedTutorId) => {
        if (!resolvedTutorId) return;
        try {
            const { data } = await api.get(`/quizzes/discount?studentId=${user._id}&tutorId=${resolvedTutorId}`);
            if (data.success && data.data) {
                setDiscount(data.data);
            } else {
                setDiscount(null);
            }
        } catch (error) {
            console.error('Error fetching tutor discount:', error);
        }
    };

    const fetchWalletBalance = async () => {
        setLoadingBalance(true);
        try {
            const { data } = await api.get(`/payments/balance/${user._id}`);
            setWalletBalance(data.balance);
        } catch (error) {
            console.error('Error fetching wallet balance:', error);
        } finally {
            setLoadingBalance(false);
        }
    };

    if (!isOpen) return null;

    const validateForm = () => {
        let tempErrors = {};
        let isValid = true;

        if (!formData.name.trim()) {
            tempErrors.name = 'Name is required';
            isValid = false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email) {
            tempErrors.email = 'Email is required';
            isValid = false;
        } else if (!emailRegex.test(formData.email)) {
            tempErrors.email = 'Email is not valid';
            isValid = false;
        }

        if (!formData.cardNumber || formData.cardNumber.replace(/\s/g, '').length < 16) {
            tempErrors.cardNumber = 'Valid 16-digit card number is required';
            isValid = false;
        }

        if (!formData.expiry || !/^\d{2}\/\d{2}$/.test(formData.expiry)) {
            tempErrors.expiry = 'Expiry must be in MM/YY format';
            isValid = false;
        }

        if (!formData.cvc || formData.cvc.length < 3) {
            tempErrors.cvc = 'Valid CVC is required';
            isValid = false;
        }

        setErrors(tempErrors);
        return isValid;
    };

    const handlePopulateDummy = () => {
        setFormData({
            name: 'John Doe',
            email: 'john.doe@university.edu',
            cardNumber: '4242 4242 4242 4242',
            expiry: '12/26',
            cvc: '123'
        });
        setErrors({});
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();

        if (paymentMethod === 'card') {
            if (validateForm()) {
                setIsProcessing(true);
                try {
                    const { data } = await api.post('/payments/mock-card-pay', {
                        userId: user._id,
                        sessionId: selectedItem.id,
                        availabilityId: selectedItem.availabilityId,
                        amount: selectedItem.price,
                        tutorId: selectedItem.instructorId,
                        expiryDate: formData.expiry
                    });
                    
                    if (data.success) {
                        toast.success('Simulated Card Payment Successful!');
                        if (onSuccess) onSuccess();
                        setTimeout(() => {
                            onClose();
                            navigate('/dashboard/student');
                        }, 1500);
                    }
                } catch (error) {
                    setErrors({ submit: error.response?.data?.message || 'Mock payment failed' });
                    setIsProcessing(false);
                }
            }
        } else {
            // Wallet Payment
            const finalPrice = discount ? selectedItem.price * (1 - discount.percentage) : selectedItem.price;
            if (walletBalance < finalPrice) {
                setErrors({ wallet: 'Insufficient balance' });
                return;
            }

            setIsProcessing(true);
            try {
                const { data } = await api.post('/payments/pay-with-wallet', {
                    userId: user._id,
                    sessionId: selectedItem.id,
                    availabilityId: selectedItem.availabilityId,
                    amount: selectedItem.price,
                    tutorId: selectedItem.instructorId
                });
                
                if (data.success) {
                    toast.success(data.message || 'Session booked successfully!');
                    if (onSuccess) onSuccess();
                    setTimeout(() => {
                        onClose();
                        navigate('/dashboard/student');
                    }, 1500);
                }
            } catch (error) {
                setErrors({ wallet: error.response?.data?.message || 'Wallet payment failed' });
                setIsProcessing(false);
            }
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Checkout: {selectedItem?.name}</h2>
                    <button onClick={onClose} className="close-btn"><X size={24} /></button>
                </div>

                <div className="modal-body">
                    {discount && (
                        <div className="p-4 mb-6 bg-teal-500/10 border border-teal-500/30 rounded-2xl flex items-center justify-between">
                            <div>
                                <p className="text-teal-400 font-black text-xs uppercase tracking-widest">Tutor Gift Applied! 🎉</p>
                                <p className="text-white text-sm">You earned a {discount.percentage * 100}% discount from your last quiz with this tutor.</p>
                            </div>
                            <div className="text-right">
                                <span className="text-gray-500 line-through text-xs block">Rs {selectedItem.price.toFixed(2)}</span>
                                <span className="text-teal-400 font-black text-lg block">Rs {(selectedItem.price * (1 - discount.percentage)).toFixed(2)}</span>
                            </div>
                        </div>
                    )}
                    
                    {!discount && (
                         <div className="price-tag">
                            Total: Rs {selectedItem?.price?.toFixed(2)}
                        </div>
                    )}
                    <div className="payment-method-toggle">
                        <button 
                            type="button"
                            className={`method-btn ${paymentMethod === 'card' ? 'active' : ''}`}
                            onClick={() => setPaymentMethod('card')}
                        >
                            Credit/Debit Card
                        </button>
                        <button 
                            type="button"
                            className={`method-btn ${paymentMethod === 'wallet' ? 'active' : ''}`}
                            onClick={() => setPaymentMethod('wallet')}
                        >
                            StuEdu Wallet
                        </button>
                    </div>

                    {paymentMethod === 'wallet' ? (
                        <div className="wallet-info">
                            <p>Available Balance: <strong>Rs {walletBalance.toFixed(2)}</strong></p>
                            {walletBalance < (discount ? selectedItem?.price * (1 - discount.percentage) : selectedItem?.price) && (
                                <p className="error-text">Insufficient balance. Please recharge your wallet.</p>
                            )}
                            <button 
                                type="button" 
                                className="btn btn-secondary" 
                                onClick={() => navigate('/dashboard/student')}
                                style={{ marginTop: '0.5rem', fontSize: '0.75rem' }}
                            >
                                Recharge Wallet
                            </button>
                            {errors.wallet && <p className="error-text mt-2">{errors.wallet}</p>}
                        </div>
                    ) : (
                        <div className="checkout-form">
                            <div className="form-group">
                                <label>Full Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Enter your full name"
                                />
                                {errors.name && <span className="error-text">{errors.name}</span>}
                            </div>

                            <div className="form-group">
                                <label>Email Address</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="student@university.edu"
                                />
                                {errors.email && <span className="error-text">{errors.email}</span>}
                            </div>

                            <div className="form-group">
                                <label>Card Number</label>
                                <input
                                    type="text"
                                    value={formData.cardNumber}
                                    onChange={(e) => {
                                        let value = e.target.value.replace(/\D/g, '');
                                        let formattedValue = '';
                                        for (let i = 0; i < value.length; i++) {
                                            if (i > 0 && i % 4 === 0) formattedValue += ' ';
                                            formattedValue += value[i];
                                        }
                                        setFormData({ ...formData, cardNumber: formattedValue });
                                    }}
                                    placeholder="XXXX XXXX XXXX XXXX"
                                    maxLength="19"
                                />
                                {errors.cardNumber && <span className="error-text">{errors.cardNumber}</span>}
                            </div>

                            <div className="form-row">
                                <div className="form-group half">
                                    <label>Expiry (MM/YY)</label>
                                    <input
                                        type="text"
                                        value={formData.expiry}
                                        onChange={(e) => {
                                            let value = e.target.value.replace(/\D/g, '');
                                            if (value.length > 2) {
                                                value = value.slice(0, 2) + '/' + value.slice(2, 4);
                                            }
                                            setFormData({ ...formData, expiry: value });
                                        }}
                                        placeholder="MM/YY"
                                        maxLength="5"
                                    />
                                    {errors.expiry && <span className="error-text">{errors.expiry}</span>}
                                </div>
                                <div className="form-group half">
                                    <label>CVC</label>
                                    <input
                                        type="text"
                                        value={formData.cvc}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/\D/g, '');
                                            setFormData({ ...formData, cvc: value });
                                        }}
                                        placeholder="123"
                                        maxLength="4"
                                    />
                                    {errors.cvc && <span className="error-text">{errors.cvc}</span>}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="modal-actions">
                        {paymentMethod === 'card' && (
                            <button type="button" className="btn btn-secondary dummy-btn" onClick={handlePopulateDummy}>
                                Populate Dummy Data
                            </button>
                        )}
                        <button 
                            type="button" 
                            className="btn btn-primary" 
                            disabled={isProcessing}
                            onClick={handleSubmit}
                        >
                            {isProcessing ? 'Processing...' : 'Confirm Booking'}
                        </button>
                        {errors.submit && <p className="error-text mt-2">{errors.submit}</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutModal;