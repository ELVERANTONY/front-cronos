import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info', duration = 3000) => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message, type }]);

        if (duration) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ addToast, removeToast }}>
            {children}
            <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
                {toasts.map((toast) => (
                    <ToastItem key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
                ))}
            </div>
        </ToastContext.Provider>
    );
};

const ToastItem = ({ toast, onRemove }) => {
    const icons = {
        success: <CheckCircle size={20} className="text-green-400" />,
        error: <AlertCircle size={20} className="text-red-400" />,
        info: <Info size={20} className="text-blue-400" />,
        warning: <AlertCircle size={20} className="text-yellow-400" />
    };

    const borders = {
        success: 'border-green-500/30 bg-green-500/10',
        error: 'border-red-500/30 bg-red-500/10',
        info: 'border-blue-500/30 bg-blue-500/10',
        warning: 'border-yellow-500/30 bg-yellow-500/10'
    };

    return (
        <div className={`
            pointer-events-auto
            flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-md shadow-lg
            transform transition-all duration-300 animate-in slide-in-from-right-full
            min-w-[300px] max-w-md
            bg-[#1e2330]/90
            ${borders[toast.type] || borders.info}
        `}>
            <div className="flex-shrink-0">
                {icons[toast.type] || icons.info}
            </div>
            <p className="text-white text-sm font-medium flex-1">{toast.message}</p>
            <button
                onClick={onRemove}
                className="p-1 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors"
            >
                <X size={16} />
            </button>
        </div>
    );
};
