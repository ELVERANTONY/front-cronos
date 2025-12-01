import React from 'react';

const Checkbox = ({ label, checked, onChange, ...props }) => {
    return (
        <div className="flex items-center">
            <input
                id="checkbox"
                type="checkbox"
                checked={checked}
                onChange={onChange}
                className="h-4 w-4 text-blue-500 bg-slate-800 border-slate-600 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
                {...props}
            />
            <label
                htmlFor="checkbox"
                className="ml-2 block text-sm text-slate-400 cursor-pointer select-none"
            >
                {label}
            </label>
        </div>
    );
};

export default Checkbox;
