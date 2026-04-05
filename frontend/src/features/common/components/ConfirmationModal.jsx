import React from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';

const ConfirmationModal = ({ isOpen, title, message, onConfirm, onClose, loading }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden transform transition-all">
                <div className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                            <FaExclamationTriangle className="text-red-500 text-xl" />
                        </div>
                        <h2 className="text-xl font-bold text-white leading-tight">{title || 'Confirm Action'}</h2>
                    </div>
                    <p className="text-gray-400 mb-8 ml-16 leading-relaxed">
                        {message || 'Are you sure you want to proceed with this action? This cannot be undone.'}
                    </p>

                    <div className="flex gap-4">
                        <button
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 px-5 py-2.5 rounded-xl border border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors font-semibold disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={loading}
                            className="flex-1 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold shadow-lg transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none flex justify-center items-center"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                'Confirm'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
