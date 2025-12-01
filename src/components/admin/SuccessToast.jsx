import React, { useEffect } from 'react';

const SuccessToast = ({ isVisible, message, subMessage, onClose }) => {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                onClose();
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [isVisible, onClose]);

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-6 right-6 z-[70] animate-in slide-in-from-bottom-8 duration-500">
            <div className="bg-[#151A30] border border-emerald-500/30 shadow-[0_0_40px_rgba(16,185,129,0.3)] rounded-2xl p-6 w-96 transition-all duration-300">
                <div className="flex items-center gap-4">
                    <div className="relative w-12 h-12 flex-shrink-0">
                        <div className="bg-gradient-to-br from-emerald-500 to-teal-500 w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-lg">
                            ✅
                        </div>
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-white text-base mb-1">{message}</h3>
                        <p className="text-xs text-emerald-300 leading-relaxed">{subMessage}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-500 hover:text-white transition-colors p-1"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SuccessToast;
