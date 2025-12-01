import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Compass, MessageSquare, LogOut, User } from 'lucide-react';

const StudentDock = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const menuItems = [
        { path: '/student/dashboard', icon: Home, label: 'Inicio' },
        { path: '/student/chats', icon: MessageSquare, label: 'Chats' },
        { path: '/student/explore', icon: Compass, label: 'Explorar' },
    ];

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
            <div className="flex items-center gap-2 px-4 py-3 bg-[#1e2330]/80 backdrop-blur-2xl border border-white/10 rounded-full shadow-2xl shadow-black/50">
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className="group relative flex flex-col items-center justify-center w-12 h-12 transition-all duration-300 hover:-translate-y-2"
                        >
                            <div className={`
                                absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300
                                ${isActive ? 'bg-blue-600/20' : 'bg-white/5'}
                            `}></div>

                            <Icon
                                size={24}
                                strokeWidth={isActive ? 2.5 : 2}
                                className={`
                                    transition-all duration-300 group-hover:scale-110
                                    ${isActive ? 'text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]' : 'text-slate-400 group-hover:text-white'}
                                `}
                            />

                            {/* Tooltip */}
                            <span className="absolute -top-10 px-2 py-1 bg-black/80 backdrop-blur-md text-white text-[10px] rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap border border-white/10">
                                {item.label}
                            </span>

                            {/* Active Indicator */}
                            {isActive && (
                                <div className="absolute -bottom-1 w-1 h-1 bg-blue-400 rounded-full shadow-[0_0_5px_#60a5fa]"></div>
                            )}
                        </Link>
                    );
                })}

                <div className="w-px h-8 bg-white/10 mx-2"></div>

                <button
                    onClick={handleLogout}
                    className="group relative flex flex-col items-center justify-center w-12 h-12 transition-all duration-300 hover:-translate-y-2"
                >
                    <LogOut size={20} className="text-slate-500 group-hover:text-red-400 transition-colors" />
                    <span className="absolute -top-10 px-2 py-1 bg-black/80 backdrop-blur-md text-white text-[10px] rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap border border-white/10">
                        Salir
                    </span>
                </button>
            </div>
        </div>
    );
};

export default StudentDock;
