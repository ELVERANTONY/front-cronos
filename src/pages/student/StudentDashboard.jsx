import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentService } from '../../services/studentService';
import { useSessionHeartbeat } from '../../hooks/useSessionHeartbeat';
import { Play, Clock, TrendingUp, ChevronRight, MessageSquare } from 'lucide-react';

const StudentDashboard = () => {
    useSessionHeartbeat(); // Mantener sesión activa
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [recentSessions, setRecentSessions] = useState([]);
    const [topCharacters, setTopCharacters] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }

        const fetchData = async () => {
            try {
                const [sessions, characters] = await Promise.all([
                    studentService.getRecentSessions(3),
                    studentService.getTopCharacters(5)
                ]);
                setRecentSessions(sessions);
                setTopCharacters(characters);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Buenos días';
        if (hour < 18) return 'Buenas tardes';
        return 'Buenas noches';
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="w-[92%] max-w-[2000px] mx-auto py-8 space-y-8 pb-20">
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-[#1e2330] p-8 shadow-2xl border border-white/5 group">
                {/* Background Elements */}
                <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-blue-600/20 to-transparent skew-x-12 translate-x-10"></div>
                <div className="absolute bottom-0 right-10 w-32 h-32 bg-cyan-500/20 rounded-full blur-3xl"></div>

                <div className="relative z-10 max-w-lg">
                    <span className="inline-block px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold tracking-wider mb-4 border border-blue-500/20">
                        ESTUDIANTE
                    </span>
                    <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2 tracking-tight">
                        {getGreeting()}, <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                            {user?.email?.split('@')[0] || 'Viajero'}
                        </span>
                    </h1>
                    <p className="text-slate-400 text-sm leading-relaxed mb-8 max-w-sm">
                        Tu aventura histórica continúa. Hay nuevos personajes esperando compartir sus historias contigo.
                    </p>

                    <button
                        onClick={() => navigate('/student/explore')}
                        className="group/btn relative px-8 py-4 bg-blue-600 rounded-2xl text-white font-semibold text-sm shadow-[0_8px_0_rgb(29,78,216)] active:shadow-[0_4px_0_rgb(29,78,216)] active:translate-y-[4px] transition-all duration-150 flex items-center gap-3 overflow-hidden"
                    >
                        <span className="relative z-10">Explorar Ahora</span>
                        <ChevronRight size={18} className="relative z-10 group-hover/btn:translate-x-1 transition-transform" />
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
                    </button>
                </div>

                {/* Decorative Image/Icon */}
                <div className="absolute right-0 top-0 bottom-0 w-1/3 flex items-center justify-center opacity-20 lg:opacity-100 transition-all duration-500 group-hover:scale-105">
                    <div className="w-64 h-64 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 blur-3xl absolute opacity-50"></div>
                    <img src="/images/logos/Cronos-digital-transparente.png" alt="Hero" className="relative w-56 h-auto object-contain drop-shadow-2xl" />
                </div>
            </div>

            {/* Quick Stats / Categories */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Sesiones', value: recentSessions.length, icon: MessageSquare, color: 'bg-indigo-500' },
                    { label: 'Favoritos', value: '0', icon: TrendingUp, color: 'bg-pink-500' },
                    { label: 'Tiempo', value: '2h', icon: Clock, color: 'bg-orange-500' },
                    { label: 'Nivel', value: '1', icon: Play, color: 'bg-emerald-500' },
                ].map((stat, idx) => (
                    <div key={idx} className="bg-[#1e2330] p-4 rounded-3xl border border-white/5 hover:bg-[#252a3a] transition-colors cursor-default group">
                        <div className={`w-10 h-10 ${stat.color} rounded-2xl flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform`}>
                            <stat.icon size={20} className="text-white" />
                        </div>
                        <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Recent Sessions */}
            <div>
                <div className="flex items-center justify-between mb-6 px-2">
                    <h2 className="text-lg font-bold text-white">Continuar</h2>
                    <button onClick={() => navigate('/student/chats')} className="text-xs text-blue-400 hover:text-blue-300 font-medium">Ver todo</button>
                </div>

                {recentSessions.length > 0 ? (
                    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
                        {recentSessions.map((session) => (
                            <div
                                key={session.id}
                                onClick={() => navigate('/student/chats', { state: { startChatWith: session.characterId } })}
                                className="min-w-[280px] bg-[#1e2330] p-5 rounded-[2rem] border border-white/5 cursor-pointer hover:border-blue-500/30 transition-all group snap-center"
                            >
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="relative">
                                        <img
                                            src={session.characterImageUrl || '/images/avatars/default.png'}
                                            alt={session.characterName}
                                            className="w-14 h-14 rounded-2xl object-cover shadow-lg"
                                        />
                                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-[#1e2330] rounded-full"></div>
                                    </div>
                                    <div>
                                        <h3 className="text-white font-bold text-sm">{session.characterName}</h3>
                                        <span className="text-[10px] text-slate-500 bg-white/5 px-2 py-1 rounded-full">
                                            Hace 2 min
                                        </span>
                                    </div>
                                </div>
                                <div className="bg-[#151922] p-3 rounded-2xl mb-3">
                                    <p className="text-slate-400 text-xs line-clamp-2 italic">
                                        "{session.lastMessage || 'Continuar conversación...'}"
                                    </p>
                                </div>
                                <button className="w-full py-3 rounded-xl bg-blue-600/10 text-blue-400 text-xs font-bold group-hover:bg-blue-600 group-hover:text-white transition-all">
                                    Reanudar
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-[#1e2330] rounded-[2rem] p-8 text-center border border-white/5 border-dashed">
                        <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3">
                            <MessageSquare size={20} className="text-slate-500" />
                        </div>
                        <p className="text-slate-400 text-sm">No hay conversaciones recientes</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentDashboard;
