import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const AdminSidebar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();

    const isActive = (path) => {
        return location.pathname === path
            ? 'bg-gradient-to-r from-[#4facfe]/10 to-[#00f2fe]/10 text-[#4facfe] border-r-4 border-[#4facfe]'
            : 'text-slate-400 hover:text-white hover:bg-white/5 border-r-4 border-transparent';
    };

    return (
        <aside className="w-72 bg-[#0B0E1E] border-r border-slate-800/50 flex flex-col h-full shrink-0 relative">
            {/* Logo Overlay - Absolute Position */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
                <img
                    src="/images/logos/Cronos-digital-transparente GRANDE.png"
                    alt="CRONOS Logo"
                    className="w-24 h-auto object-contain opacity-90"
                />
            </div>

            {/* Header Spacer */}
            <div className="h-20 border-b border-slate-800/50"></div>

            {/* Navigation */}
            <nav className="flex-1 py-8 space-y-2 overflow-y-auto custom-scrollbar">
                <p className="px-8 text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 text-center">
                    Cronos Digital Admin
                </p>

                <Link to="/admin" className={`flex items-center gap-4 px-8 py-4 text-sm font-bold transition-all ${isActive('/admin')}`}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    Dashboard
                </Link>

                <Link to="/admin/students" className={`flex items-center gap-4 px-8 py-4 text-sm font-bold transition-all ${isActive('/admin/students')}`}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    Estudiantes
                </Link>

                <Link to="/admin/characters" className={`flex items-center gap-4 px-8 py-4 text-sm font-bold transition-all ${isActive('/admin/characters')}`}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Figuras Históricas
                </Link>

                <Link to="/admin/categories" className={`flex items-center gap-4 px-8 py-4 text-sm font-bold transition-all ${isActive('/admin/categories')}`}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    Categorías
                </Link>
            </nav>

            {/* Footer Actions */}
            <div className="p-8 border-t border-slate-800/50 space-y-4 bg-[#0B0E1E]">
                <div className="flex items-center gap-3 px-4 py-3 bg-[#151A30] rounded-xl border border-slate-800/50">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold text-xs">
                        {user?.email?.[0]?.toUpperCase() || 'A'}
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-white text-sm font-bold truncate">{user?.email || 'admin@cronos.com'}</p>
                        <p className="text-xs text-slate-500">Administrador</p>
                    </div>
                </div>

                <button
                    onClick={logout}
                    className="flex items-center justify-center gap-2 text-sm font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all w-full py-3 rounded-xl border border-transparent hover:border-red-500/20"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Cerrar Sesión
                </button>
            </div>
        </aside>
    );
};

export default AdminSidebar;
