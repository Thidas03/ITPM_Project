import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, CheckCircle } from 'lucide-react';
import api from '../../../services/api';
import { toast } from 'react-toastify';

const QuizCreatorModal = ({ isOpen, onClose, sessionId, tutorId }) => {
    const [questions, setQuestions] = useState(
        Array(10)
            .fill(0)
            .map(() => ({
                questionText: '',
                options: ['', '', '', ''],
                correctOptionIndex: 0,
            }))
    );
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (isOpen && sessionId) {
            fetchExistingQuiz();
        }
    }, [isOpen, sessionId]);

    const fetchExistingQuiz = async () => {
        setLoading(true);
        try {
            const { data } = await api.get(`/quizzes/session/${sessionId}`);
            if (data.success && data.data) {
                setQuestions(data.data.questions);
            }
        } catch (error) {
            // No quiz yet, keep defaults
        } finally {
            setLoading(false);
        }
    };

    const handleQuestionChange = (index, value) => {
        const newQuestions = [...questions];
        newQuestions[index].questionText = value;
        setQuestions(newQuestions);
    };

    const handleOptionChange = (qIndex, oIndex, value) => {
        const newQuestions = [...questions];
        newQuestions[qIndex].options[oIndex] = value;
        setQuestions(newQuestions);
    };

    const handleCorrectOptionChange = (qIndex, oIndex) => {
        const newQuestions = [...questions];
        newQuestions[qIndex].correctOptionIndex = oIndex;
        setQuestions(newQuestions);
    };

    const handleSubmit = async () => {
        // Simple validation
        const isValid = questions.every(q => q.questionText && q.options.every(o => o));
        if (!isValid) {
            return toast.error('Please fill all questions and options');
        }

        setSaving(true);
        try {
            await api.post('/quizzes/create', {
                sessionId,
                tutorId,
                questions,
            });
            toast.success('Quiz saved successfully!');
            onClose();
        } catch (error) {
            toast.error('Failed to save quiz');
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
                <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900/50">
                    <div>
                        <h2 className="text-lg font-black text-white tracking-tight uppercase">Quiz Creator</h2>
                        <p className="text-gray-400 text-[10px] mt-0.5">Design 10 questions for student discounts.</p>
                    </div>
                    <button onClick={onClose} className="p-3 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-2xl transition">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                    {loading ? (
                        <div className="text-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mx-auto"></div>
                            <p className="text-gray-400 mt-4 font-bold">Loading your quiz template...</p>
                        </div>
                    ) : (
                        questions.map((q, qIndex) => (
                            <div key={qIndex} className="bg-gray-800/30 p-4 rounded-xl border border-gray-800 hover:border-teal-500/30 transition-all group">
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center font-black">
                                        {qIndex + 1}
                                    </span>
                                    <input
                                        type="text"
                                        placeholder={`Question ${qIndex + 1} Text`}
                                        className="flex-1 bg-transparent text-lg font-bold text-white border-b-2 border-gray-800 focus:border-teal-500 outline-none pb-1"
                                        value={q.questionText}
                                        onChange={(e) => handleQuestionChange(qIndex, e.target.value)}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {q.options.map((opt, oIndex) => (
                                        <div 
                                            key={oIndex} 
                                            className={`relative flex items-center p-1 rounded-xl border-2 transition-all ${q.correctOptionIndex === oIndex ? 'border-green-500/50 bg-green-500/5' : 'border-gray-800 hover:border-gray-700'}`}
                                        >
                                            <button
                                                onClick={() => handleCorrectOptionChange(qIndex, oIndex)}
                                                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${q.correctOptionIndex === oIndex ? 'bg-green-500 text-white' : 'bg-gray-800 text-gray-500 hover:text-white'}`}
                                            >
                                                {oIndex === 0 ? 'A' : oIndex === 1 ? 'B' : oIndex === 2 ? 'C' : 'D'}
                                            </button>
                                            <input
                                                type="text"
                                                placeholder={`Option ${oIndex + 1}`}
                                                className="flex-1 bg-transparent px-4 py-3 text-sm text-white outline-none"
                                                value={opt}
                                                onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                                            />
                                            {q.correctOptionIndex === oIndex && (
                                                <CheckCircle size={16} className="text-green-500 absolute right-4" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-4 border-t border-gray-800 bg-gray-900/80 flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-800 text-gray-400 rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-gray-700 transition"
                    >
                        Discard
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={saving}
                        className="px-4 py-2 bg-gradient-to-r from-teal-500 to-indigo-600 text-white rounded-lg font-black text-[10px] uppercase tracking-widest shadow-xl shadow-teal-500/20 hover:scale-105 active:scale-95 transition disabled:opacity-50"
                    >
                        {saving ? 'Publishing...' : 'Save & Publish Quiz'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QuizCreatorModal;
