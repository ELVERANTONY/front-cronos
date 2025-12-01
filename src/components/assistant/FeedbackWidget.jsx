import React, { useState } from 'react';
import { X, Star } from 'lucide-react';

const FeedbackWidget = ({ onSubmit, onDismiss }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [hoveredStar, setHoveredStar] = useState(0);

    const handleSubmit = () => {
        if (rating === 0) return;
        onSubmit(rating, comment);
    };

    return (
        <div className="mx-4 mb-4 p-4 bg-white dark:bg-slate-800 rounded-xl border border-purple-100 dark:border-purple-900 shadow-lg relative animate-in fade-in slide-in-from-bottom-4">
            <button
                onClick={onDismiss}
                className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
                <X size={16} />
            </button>

            <h4 className="text-sm font-semibold text-slate-800 dark:text-white mb-3">
                ¿Te fue útil esta conversación?
            </h4>

            <div className="flex gap-2 mb-3 justify-center">
                {[1, 2, 3, 4, 5].map(star => (
                    <button
                        key={star}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoveredStar(star)}
                        onMouseLeave={() => setHoveredStar(0)}
                        className="transition-transform hover:scale-110 focus:outline-none"
                    >
                        <Star
                            size={24}
                            className={`${star <= (hoveredStar || rating)
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-slate-300 dark:text-slate-600'
                                }`}
                        />
                    </button>
                ))}
            </div>

            {rating > 0 && (
                <div className="space-y-3 animate-in fade-in">
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Cuéntanos más (opcional)..."
                        rows={2}
                        className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    />

                    <button
                        onClick={handleSubmit}
                        className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                        Enviar Feedback
                    </button>
                </div>
            )}
        </div>
    );
};

export default FeedbackWidget;
