import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './CheckoutModal.css';

const CheckoutModal = ({ isOpen, onClose, selectedItem }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        cardNumber: '',
        expiry: '',
        cvc: ''
    });
    const [errors, setErrors] = useState({});
    const [isProcessing, setIsProcessing] = useState(false);

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
        e.preventDefault();

        if (validateForm()) {
            setIsProcessing(true);

            // Mock backend processing to conform to the presentation guidelines
            // without needing actual Stripe API keys.
            setTimeout(() => {
                setIsProcessing(false);
                onClose();
                navigate('/success');
            }, 1000);
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
                    <p className="price-tag">Total: ${selectedItem?.price}</p>

                    <form onSubmit={handleSubmit} className="checkout-form">
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
                                onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
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
                                    onChange={(e) => setFormData({ ...formData, expiry: e.target.value })}
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
                                    onChange={(e) => setFormData({ ...formData, cvc: e.target.value })}
                                    placeholder="123"
                                    maxLength="4"
                                />
                                {errors.cvc && <span className="error-text">{errors.cvc}</span>}
                            </div>
                        </div>

                        <div className="modal-actions">
                            <button type="button" className="btn btn-secondary dummy-btn" onClick={handlePopulateDummy}>
                                Populate Dummy Data
                            </button>
                            <button type="submit" className="btn btn-primary" disabled={isProcessing}>
                                {isProcessing ? 'Processing Processing...' : 'Confirm Payment'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CheckoutModal;