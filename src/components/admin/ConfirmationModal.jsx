import React from 'react';

const ConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirmar",
    cancelText = "Cancelar",
    variant = "danger", // danger, warning, success, info
    icon = null
}) => {
    if (!isOpen) return null;

    const getVariantStyles = () => {
        switch (variant) {
            case 'danger':
                return {
                    button: 'bg-red-500 hover:bg-red-600 shadow-red-500/20',
                    iconBg: 'bg-red-500/10 text-red-500',
                    border: 'border-red-500/20'
                };
            case 'warning':
                return {
                    button: 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20',
                    iconBg: 'bg-amber-500/10 text-amber-500',
                    border: 'border-amber-500/20'
                };
            case 'success':
                return {
                    button: 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20',
                    iconBg: 'bg-emerald-500/10 text-emerald-500',
                    border: 'border-emerald-500/20'
                };
            default:
                return {
                    button: 'bg-blue-500 hover:bg-blue-600 shadow-blue-500/20',
                    iconBg: 'bg-blue-500/10 text-blue-500',
                    border: 'border-blue-500/20'
                };
        }
    };

    const styles = getVariantStyles();

    return (
        <div className="fixed inset-0 bg-slate-950/70 flex items-center justify-center z-[80] p-4 transition-all duration-200">
            <div className={`bg-[#151A30] border ${styles.border} rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200`}>
                <div className="p-6 text-center">
                    {/* Icon */}
                    <div className={`w-16 h-16 rounded-full ${styles.iconBg} flex items-center justify-center mx-auto mb-4`}>
                        {icon || (
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        )}
                    </div>

                    <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed mb-6">
                        {message}
                    </p>

                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition-colors"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={onConfirm}
                            className={`flex-1 px-4 py-3 text-white rounded-xl font-bold shadow-lg transition-all active:scale-95 ${styles.button}`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
