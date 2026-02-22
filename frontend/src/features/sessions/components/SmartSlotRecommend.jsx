import React, { useState, useEffect } from 'react';
import { getRecommendedSlot } from '../services/sessionService';
import SessionCard from './SessionCard';

const SmartSlotRecommend = ({ tutorId, onBook }) => {
    const [recommendedSlot, setRecommendedSlot] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecommendation = async () => {
            try {
                setLoading(true);
                const data = await getRecommendedSlot(tutorId);
                // data.data is our custom backend format, or raw slot.
                const slot = data.data || data;
                if (slot && Object.keys(slot).length > 0) {
                    setRecommendedSlot(slot);
                }
            } catch (error) {
                console.error('Failed to get recommendation', error);
            } finally {
                setLoading(false);
            }
        };

        if (tutorId) {
            fetchRecommendation();
        }
    }, [tutorId]);

    if (loading) {
        return (
            <div className="bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 p-6 rounded-2xl animate-pulse">
                <div className="h-6 bg-indigo-800/50 rounded w-1/3 mb-4"></div>
                <div className="h-32 bg-indigo-900/30 rounded-xl"></div>
            </div>
        );
    }

    if (!recommendedSlot) {
        return null; // Don't show anything if no recommendation can be made
    }

    return (
        <div className="bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border border-indigo-500/50 p-6 rounded-2xl shadow-xl relative overflow-hidden">
            {/* Decorative Glow */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-teal-500/20 rounded-full blur-3xl"></div>

            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                    <span className="text-xl">✨</span>
                    <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-400">
                        Smart Recommendation
                    </h2>
                    <span className="ml-auto text-xs font-semibold px-2 py-1 bg-indigo-500/20 text-indigo-300 rounded-md border border-indigo-500/30">
                        Earliest Optimized Slot
                    </span>
                </div>

                <div className="max-w-md mx-auto sm:max-w-none">
                    <SessionCard session={recommendedSlot} onBook={onBook} />
                </div>
            </div>
        </div>
    );
};

export default SmartSlotRecommend;
