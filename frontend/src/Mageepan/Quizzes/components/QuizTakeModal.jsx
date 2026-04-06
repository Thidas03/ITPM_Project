import React, { useState, useEffect } from 'react';
import { X, Award, CheckCircle, ArrowRight } from 'lucide-react';
import api from '../../../services/api';
import { toast } from 'react-toastify';

const QuizTakeModal = ({ isOpen, onClose, sessionId, studentId, tutorName, onSuccess }) => {
    const [quiz, setQuiz] = useState(null);
    const [answers, setAnswers] = useState(Array(10).fill(-1));
    const [currentStep, setCurrentStep] = useState(0); // 0 to 9
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState(null); // { score, discountEarned }

    useEffect(() => {
        if (isOpen && sessionId) {
            fetchQuiz();
            setAnswers(Array(10).fill(-1));
            setCurrentStep(0);
            setResult(null);
        }
    }, [isOpen, sessionId]);

    const fetchQuiz = async () => {
        setLoading(true);
        try {
            const { data } = await api.get(`/quizzes/session/${sessionId}`);
            if (data.success) {
                setQuiz(data.data);
            }
        } catch (error) {
            toast.error('Could not load quiz at this time');
            onClose();
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerSelect = (optionIndex) => {
        const newAnswers = [...answers];
        newAnswers[currentStep] = optionIndex;
        setAnswers(newAnswers);
    };

    const handleSubmit = async () => {
        if (answers.includes(-1)) {
            return toast.warning('Please answer all questions before submitting');
        }

        setSubmitting(true);
        try {
            const { data } = await api.post('/quizzes/submit', {
                sessionId,
                studentId,
                answers,
            });
            if (data.success) {
                setResult({ score: data.score, discountEarned: data.discountEarned });
                if (onSuccess) onSuccess();
            }
        } catch (error) {
            toast.error('Failed to submit quiz');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <div className={`bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl overflow-y-auto overflow-x-hidden transition-all duration-500 ${result ? 'scale-105' : 'scale-100'}`}>
                
                {result ? (
                    // RESULT VIEW
                    <div className="p-6 text-center flex flex-col items-center">
                        <div className="w-12 h-12 bg-teal-500/20 rounded-full flex items-center justify-center mb-4 animate-bounce">
                            <Award className="text-teal-400" size={24} />
                        </div>
                        <h2 className="text-xl font-black text-white mb-1 uppercase tracking-tight">Quiz Complete!</h2>
                        <p className="text-gray-400 text-[10px] mb-4 font-medium">Results for your session with <span className="text-teal-400">{tutorName}</span></p>
                        
                        <div className="grid grid-cols-2 gap-3 w-full mb-4">
                            <div className="bg-gray-800/50 p-3 rounded-xl border border-gray-800">
                                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1 text-left">Your Score</p>
                                <p className="text-2xl font-black text-white text-left">{result.score}/10</p>
                            </div>
                            <div className="bg-gradient-to-br from-teal-500 to-indigo-600 p-3 rounded-xl shadow-xl shadow-teal-500/20">
                                <p className="text-[8px] font-black text-white/70 uppercase tracking-widest mb-1 text-left">Discount Earned</p>
                                <p className="text-2xl font-black text-white text-left">{result.discountEarned}%</p>
                            </div>
                        </div>

                        <p className="text-gray-400 text-sm mb-10 max-w-md mx-auto italic">
                            &quot;This discount has been applied to your profile and will be automatically deducted from your next session with {tutorName}.&quot;
                        </p>

                        <button
                            onClick={onClose}
                            className="w-full py-4 bg-teal-500 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-teal-500/20 hover:scale-105 transition active:scale-95"
                        >
                            Back to Dashboard
                        </button>
                    </div>
                ) : (
                    // QUIZ VIEW
                    <>
                        <div className="px-5 pt-5 flex justify-between items-center bg-gray-900">
                            <div>
                                <h2 className="text-lg font-black text-white tracking-tight uppercase">Knowledge Check</h2>
                                <p className="text-gray-400 text-[8px]">Test your learning from {tutorName}.</p>
                            </div>
                            <button onClick={onClose} className="p-1.5 bg-gray-800 hover:bg-gray-700 text-gray-400 rounded-lg transition">
                                <X size={16} />
                            </button>
                        </div>

                        {loading ? (
                             <div className="p-20 text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mx-auto"></div>
                            </div>
                        ) : (
                            <div className="p-5">
                                {/* Progress Bar */}
                                <div className="flex gap-1 mb-10">
                                    {answers.map((ans, i) => (
                                        <div 
                                            key={i} 
                                            className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${i === currentStep ? 'bg-teal-500' : ans !== -1 ? 'bg-indigo-400/50' : 'bg-gray-800'}`}
                                        ></div>
                                    ))}
                                </div>

                                {/* Question */}
                                {quiz && (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                        <div className="space-y-1">
                                            <span className="text-[8px] font-black text-teal-400 uppercase tracking-widest">Question {currentStep + 1} of 10</span>
                                            <h3 className="text-lg font-black text-white leading-tight">{quiz.questions[currentStep].questionText}</h3>
                                        </div>

                                        <div className="grid grid-cols-1 gap-2">
                                            {quiz.questions[currentStep].options.map((option, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => handleAnswerSelect(idx)}
                                                    className={`group p-3 rounded-lg border-2 transition-all flex items-center justify-between text-left ${answers[currentStep] === idx ? 'border-teal-500 bg-teal-500/10' : 'border-gray-800 hover:border-gray-700 hover:bg-gray-800/10'}`}
                                                >
                                                    <span className={`text-base font-bold ${answers[currentStep] === idx ? 'text-teal-400' : 'text-gray-400 group-hover:text-white'}`}>
                                                        {option}
                                                    </span>
                                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${answers[currentStep] === idx ? 'border-teal-500 bg-teal-500' : 'border-gray-700'}`}>
                                                        {answers[currentStep] === idx && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="mt-8 flex gap-4">
                                    <button
                                        disabled={currentStep === 0}
                                        onClick={() => setCurrentStep(currentStep - 1)}
                                        className="flex-1 py-3 bg-gray-800 text-gray-400 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-gray-700 transition disabled:opacity-30"
                                    >
                                        Prev
                                    </button>
                                    {currentStep === 9 ? (
                                        <button
                                            onClick={handleSubmit}
                                            disabled={submitting}
                                            className="flex-[2] py-3 bg-gradient-to-r from-teal-500 to-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-teal-500/20 hover:scale-[1.02] active:scale-95 transition"
                                        >
                                            {submitting ? 'Calculating...' : 'Finish Quiz'}
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => setCurrentStep(currentStep + 1)}
                                            className="flex-[2] py-3 bg-teal-500 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-teal-500/20 hover:bg-teal-400 transition flex items-center justify-center gap-2"
                                        >
                                            Next <ArrowRight size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default QuizTakeModal;
