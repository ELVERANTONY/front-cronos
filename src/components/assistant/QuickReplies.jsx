import React from 'react';

const QuickReplies = ({ replies, onSelect }) => {
    if (!replies || replies.length === 0) return null;

    return (
        <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <p className="text-xs font-medium text-slate-500 mb-2 uppercase tracking-wider">Sugerencias</p>
            <div className="flex flex-wrap gap-2">
                {replies.map((reply, idx) => (
                    <button
                        key={idx}
                        onClick={() => onSelect(reply)}
                        className="px-3 py-1.5 text-xs bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-full hover:border-purple-400 dark:hover:border-purple-500 hover:text-purple-600 dark:hover:text-purple-400 transition-all shadow-sm"
                    >
                        {reply}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default QuickReplies;
