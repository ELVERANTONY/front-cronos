import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

const CustomSelect = ({ options, value, onChange, placeholder = "Seleccionar...", className = "" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    const selectedOption = options.find(opt => opt.value == value);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (optionValue) => {
        onChange(optionValue);
        setIsOpen(false);
    };

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    w-full px-4 py-3.5 text-left flex items-center justify-between
                    bg-[#0B0E1E] border rounded-xl transition-all duration-200
                    ${isOpen
                        ? 'border-purple-500 ring-1 ring-purple-500'
                        : 'border-slate-700 hover:border-slate-600'
                    }
                `}
            >
                <span className={`block truncate ${selectedOption ? 'text-white' : 'text-slate-500'}`}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDown
                    size={20}
                    className={`text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-[#151A30] border border-slate-700 rounded-xl shadow-xl max-h-60 overflow-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent animate-in fade-in zoom-in-95 duration-100">
                    <ul className="py-1">
                        {options.map((option) => (
                            <li key={option.value}>
                                <button
                                    type="button"
                                    onClick={() => handleSelect(option.value)}
                                    className={`
                                        w-full px-4 py-3 text-left flex items-center justify-between
                                        transition-colors duration-150
                                        ${option.value == value
                                            ? 'bg-purple-500/10 text-purple-400'
                                            : 'text-slate-300 hover:bg-white/5 hover:text-white'
                                        }
                                    `}
                                >
                                    <span className="block truncate">{option.label}</span>
                                    {option.value == value && (
                                        <Check size={16} className="text-purple-400" />
                                    )}
                                </button>
                            </li>
                        ))}
                        {options.length === 0 && (
                            <li className="px-4 py-3 text-sm text-slate-500 text-center">
                                No hay opciones disponibles
                            </li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default CustomSelect;
