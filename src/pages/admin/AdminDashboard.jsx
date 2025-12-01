import React, { useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useActiveStudents } from '../../hooks/useActiveStudents';
import { useTopCharacters } from '../../hooks/useTopCharacters';
import { useAuth } from '../../hooks/useAuth';

const AdminDashboard = () => {
    const { count, activeStudents, isConnected: isStudentsConnected } = useActiveStudents();
    const { topCharacters, isLoading, isConnected: isCharactersConnected } = useTopCharacters();
    const { user } = useAuth();
    // const [stats, setStats] = useState(null); // Ya no se usa
    // const [isLoading, setIsLoading] = useState(true); // Ya no se usa, viene del hook

    /*
    useEffect(() => {
        loadDashboardStats();
    }, []);

    const loadDashboardStats = async () => {
        try {
            setIsLoading(true);
            // TODO: Endpoint no existe en Django aún
            // const data = await adminService.getDashboardStats();
            // console.log('📊 Dashboard stats loaded:', data);
            // setStats(data);
            setStats({ popular_characters: [] }); // Mock data for now
        } catch (error) {
            console.error('❌ Error loading dashboard stats:', error);
        } finally {
            setIsLoading(false);
        }
    };
    */

    return (
        <AdminLayout>
            <div className="mb-10">
                <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
                    Bienvenido de nuevo, <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4facfe] to-[#00f2fe]">{user?.email?.split('@')[0] || 'Admin'}</span>
                </h1>
                <p className="text-slate-400 text-lg">Aquí tienes un resumen de la actividad en tiempo real.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Active Students Card - Premium */}
                <div className="bg-[#151A30] border border-slate-800/50 rounded-3xl p-8 shadow-2xl relative overflow-hidden group hover:border-[#4facfe]/30 transition-all duration-500">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity duration-500 transform group-hover:scale-110">
                        <svg className="w-32 h-32 text-[#4facfe]" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                        </svg>
                    </div>

                    <div className="flex justify-between items-start mb-6 relative z-10">
                        <div className="p-3 bg-[#0B0E1E] rounded-2xl border border-slate-700/50">
                            <svg className="w-8 h-8 text-[#4facfe]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </div>
                        <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold border ${isStudentsConnected ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                            <span className={`w-2 h-2 rounded-full ${isStudentsConnected ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`}></span>
                            {isStudentsConnected ? 'EN VIVO' : 'OFFLINE'}
                        </div>
                    </div>

                    <div className="relative z-10">
                        <h3 className="text-slate-400 font-medium mb-1">Estudiantes Conectados</h3>
                        <div className="flex items-baseline gap-3">
                            <span className="text-6xl font-bold text-white tracking-tighter">{count}</span>
                            <span className="text-sm text-slate-500 font-medium">ahora</span>
                        </div>
                        <p className="text-xs text-slate-600 mt-2">En vivo</p>
                    </div>
                </div>

                {/* Popular Characters Card - Premium */}
                <div className="bg-[#151A30] border border-slate-800/50 rounded-3xl p-8 shadow-2xl col-span-1 md:col-span-2 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-xl font-bold text-white">Personajes Más Populares</h3>
                            <p className="text-sm text-slate-400">Top 5 personajes con más interacciones</p>
                        </div>
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold border ${isCharactersConnected ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isCharactersConnected ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`}></span>
                            {isCharactersConnected ? 'LIVE' : 'OFF'}
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-slate-500 animate-pulse">Cargando estadísticas...</div>
                        </div>
                    ) : topCharacters && topCharacters.length > 0 ? (
                        <div className="space-y-3">
                            {topCharacters.slice(0, 5).map((character, index) => (
                                <div key={character.id} className="bg-[#0B0E1E] border border-slate-800/50 rounded-xl p-4 hover:border-slate-700 transition-all group">
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-3 flex-1">
                                            <div className="text-slate-600 font-bold text-sm w-8">#{index + 1}</div>
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                                {character.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="text-white font-bold text-base">{character.name}</h4>
                                                <p className="text-slate-500 text-sm">{character.category_name}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="flex items-center gap-4">
                                                <div>
                                                    <p className="text-slate-400 text-xs">Mensajes</p>
                                                    <p className="text-white font-bold text-lg">{character.message_count || 0}</p>
                                                </div>
                                                <div>
                                                    <p className="text-slate-400 text-xs">Usuarios</p>
                                                    <p className="text-[#4facfe] font-bold text-lg">{character.user_count || 0}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-slate-800 rounded-2xl bg-[#0B0E1E]/50">
                            <div className="w-20 h-20 bg-slate-800/30 rounded-full flex items-center justify-center mb-6 shadow-inner">
                                <svg className="w-10 h-10 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                            </div>
                            <h4 className="text-white font-semibold text-lg mb-2">Sin datos suficientes</h4>
                            <p className="text-slate-500 max-w-xs mx-auto">
                                A medida que los estudiantes interactúen con los personajes, verás las estadísticas aquí.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminDashboard;
