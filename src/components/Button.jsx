import React from 'react';

const Button = ({ children, onClick, type = 'button', className = '', ...props }) => {
    return (
        <button
            type={type}
            onClick={onClick}
            className={`
        w-full py-3.5 px-6 
        text-white font-bold text-sm uppercase tracking-wide
        bg-gradient-to-r from-blue-500 to-cyan-400 
        hover:from-blue-600 hover:to-cyan-500 
        rounded-2xl 
        shadow-lg shadow-blue-500/30 
        focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-slate-900
        transition-all duration-200 transform hover:-translate-y-0.5
        ${className}
      `}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;
