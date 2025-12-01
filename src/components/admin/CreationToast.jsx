import React from 'react';

const CreationToast = ({ isVisible, isSuccess, progress, statusMessage, characterName }) => {
    if (!isVisible && !isSuccess) return null;

    return (
        <div className="fixed bottom-6 right-6 z-[70] animate-in slide-in-from-bottom-8 duration-500">
            <div className={`bg-[#151A30] border ${isSuccess ? 'border-emerald-500/30 shadow-[0_0_40px_rgba(16,185,129,0.3)]' : 'border-purple-500/30 shadow-[0_0_40px_rgba(168,85,247,0.3)]'} rounded-2xl p-6 w-96 transition-all duration-300`}>
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                    <div className="relative w-12 h-12">
                        {!isSuccess && <div className="absolute inset-0 bg-purple-500/20 rounded-full animate-ping"></div>}
                        <div className={`relative ${isSuccess ? 'bg-gradient-to-br from-emerald-500 to-teal-500' : 'bg-gradient-to-br from-purple-600 to-indigo-600'} w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-lg ${!isSuccess && 'animate-pulse'}`}>
                            {isSuccess ? '✅' : '🤖'}
                        </div>
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-white text-sm">{isSuccess ? '¡Creación Exitosa!' : 'Creando Personaje'}</h3>
                        <p className={`text-xs ${isSuccess ? 'text-emerald-300' : 'text-purple-300'}`}>{characterName}</p>
                    </div>
                </div>

                {/* Progress */}
                <div className="mb-3">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-slate-400">{statusMessage}</span>
                        <span className={`text-xs font-mono font-bold ${isSuccess ? 'text-emerald-400' : 'text-purple-400'}`}>{progress}%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div
                            className={`h-full ${isSuccess ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gradient-to-r from-purple-500 to-indigo-500'} transition-all duration-500 ease-out relative`}
                            style={{ width: `${progress}%` }}
                        >
                            {!isSuccess && <div className="absolute inset-0 bg-white/30 animate-[shimmer_2s_infinite]"></div>}
                        </div>
                    </div>
                </div>

                {!isSuccess && (
                    <p className="text-xs text-slate-500 flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Puedes seguir navegando mientras se crea
                    </p>
                )}
            </div>
        </div>
    );
};

export default CreationToast;
