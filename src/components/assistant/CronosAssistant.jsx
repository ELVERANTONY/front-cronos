import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Minimize2, Maximize2, Sparkles } from 'lucide-react';
import { useAssistantWebSocket } from '../../hooks/useAssistantWebSocket';
import AssistantMessage from './AssistantMessage';
import QuickReplies from './QuickReplies';
import FeedbackWidget from './FeedbackWidget';

const CronosAssistant = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef(null);

    const {
        messages,
        isConnected,
        isTyping,
        streamingText,
        quickReplies,
        showFeedback,
        sendMessage,
        sendFeedback,
        setShowFeedback,
        error
    } = useAssistantWebSocket();

    // Auto-scroll to bottom
    useEffect(() => {
        if (isOpen && !isMinimized) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, streamingText, isOpen, isMinimized, isTyping]);

    const handleSend = () => {
        if (!input.trim()) return;
        sendMessage(input);
        setInput('');
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') handleSend();
    };

    // Floating Button (Launcher)
    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center justify-center z-50 group"
                aria-label="Abrir Asistente Cronos"
            >
                <Sparkles className="absolute animate-ping opacity-75" size={20} />
                <MessageCircle size={28} className="relative z-10" />

                {/* Tooltip */}
                <span className="absolute right-full mr-3 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    Asistente IA
                </span>
            </button>
        );
    }

    // Minimized State
    if (isMinimized) {
        return (
            <div className="fixed bottom-6 right-6 w-72 bg-white dark:bg-slate-800 rounded-t-xl shadow-2xl z-50 border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div
                    className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 flex justify-between items-center cursor-pointer"
                    onClick={() => setIsMinimized(false)}
                >
                    <div className="flex items-center gap-2 text-white">
                        <Sparkles size={16} />
                        <span className="font-medium text-sm">Cronos Assistant</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={(e) => { e.stopPropagation(); setIsMinimized(false); }} className="text-white/80 hover:text-white">
                            <Maximize2 size={14} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); setIsOpen(false); }} className="text-white/80 hover:text-white">
                            <X size={14} />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Full Chat Window
    return (
        <div className="fixed bottom-6 right-6 w-[380px] h-[600px] max-h-[80vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl z-50 flex flex-col border border-slate-200 dark:border-slate-700 overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-purple-600 to-blue-600 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white">
                        <Sparkles size={18} />
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-sm">Cronos Assistant</h3>
                        <div className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400 animate-pulse'}`}></span>
                            <span className="text-xs text-white/80 font-medium">
                                {isConnected ? 'En línea' : 'Conectando...'}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setIsMinimized(true)}
                        className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <Minimize2 size={18} />
                    </button>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 bg-slate-50 dark:bg-slate-900/50 scroll-smooth">
                {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                        <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-4 text-purple-500">
                            <Sparkles size={32} />
                        </div>
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
                            ¡Hola! Soy tu asistente personal
                        </p>
                        <p className="text-xs">
                            Puedo ayudarte a encontrar personajes, explicarte temas históricos o guiarte en la plataforma.
                        </p>
                    </div>
                )}

                {messages.map((msg) => (
                    <AssistantMessage key={msg.id} message={msg} />
                ))}

                {/* Streaming Message */}
                {streamingText && (
                    <AssistantMessage
                        message={{
                            role: 'assistant',
                            content: streamingText,
                            timestamp: new Date()
                        }}
                    />
                )}

                {/* Typing Indicator */}
                {isTyping && !streamingText && (
                    <div className="flex w-full mb-4 justify-start">
                        <div className="flex flex-row gap-3">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
                                <Bot size={16} className="text-white" />
                            </div>
                            <div className="px-4 py-3 bg-white dark:bg-slate-800 rounded-2xl rounded-tl-none border border-slate-200 dark:border-slate-700 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-100"></span>
                                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-200"></span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="flex justify-center my-2">
                        <span className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-1 rounded-full border border-red-100 dark:border-red-800">
                            {error}
                        </span>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Feedback */}
            {showFeedback && (
                <FeedbackWidget
                    onSubmit={sendFeedback}
                    onDismiss={() => setShowFeedback(false)}
                />
            )}

            {/* Quick Replies */}
            <QuickReplies replies={quickReplies} onSelect={(reply) => sendMessage(reply)} />

            {/* Input Area */}
            <div className="p-3 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 shrink-0">
                <div className="flex gap-2 items-center bg-slate-100 dark:bg-slate-900 rounded-full px-4 py-2 border border-transparent focus-within:border-purple-500 transition-colors">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Escribe tu mensaje..."
                        className="flex-1 bg-transparent border-none outline-none text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
                        disabled={!isConnected}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || !isConnected}
                        className={`p-2 rounded-full transition-all ${input.trim() && isConnected
                                ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-sm'
                                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                            }`}
                    >
                        <Send size={16} />
                    </button>
                </div>
                <div className="text-center mt-2">
                    <span className="text-[10px] text-slate-400">
                        Cronos AI puede cometer errores. Verifica la información importante.
                    </span>
                </div>
            </div>
        </div>
    );
};

// Helper component for Bot icon since it was missing in import
const Bot = ({ size, className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M12 8V4H8" />
        <rect width="16" height="12" x="4" y="8" rx="2" />
        <path d="M2 14h2" />
        <path d="M20 14h2" />
        <path d="M15 13v2" />
        <path d="M9 13v2" />
    </svg>
);

export default CronosAssistant;
