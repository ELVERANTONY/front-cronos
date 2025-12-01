import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, User } from 'lucide-react';

const AssistantMessage = ({ message }) => {
    const isUser = message.role === 'user';
    const navigate = useNavigate();

    const handleActionClick = (action) => {
        if (action.type === 'character_chat') {
            navigate(action.action);
        } else if (action.type === 'navigation') {
            navigate(action.action);
        } else if (action.action.startsWith('http')) {
            window.open(action.action, '_blank');
        } else {
            navigate(action.action);
        }
    };

    return (
        <div className={`flex w-full mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'} gap-3`}>
                {/* Avatar */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isUser ? 'bg-blue-600' : 'bg-purple-600'
                    }`}>
                    {isUser ? <User size={16} className="text-white" /> : <Bot size={16} className="text-white" />}
                </div>

                {/* Content */}
                <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                    <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap shadow-sm ${isUser
                            ? 'bg-blue-600 text-white rounded-tr-none'
                            : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200 dark:border-slate-700'
                        }`}>
                        {message.content}
                    </div>

                    {/* Suggested Actions */}
                    {!isUser && message.suggestedActions && message.suggestedActions.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                            {message.suggestedActions.map((action, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleActionClick(action)}
                                    className="px-3 py-1.5 text-xs font-medium bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800 rounded-full hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-colors shadow-sm"
                                >
                                    {action.label}
                                </button>
                            ))}
                        </div>
                    )}

                    <span className="text-[10px] text-slate-400 mt-1 px-1">
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default AssistantMessage;
