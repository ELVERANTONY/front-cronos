import React from 'react';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/Button';

const Dashboard = () => {
    const { logout } = useAuth();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    return (
        <div className="min-h-screen bg-[#1a1f2e] text-white">
            {/* Navbar */}
            <nav className="bg-slate-900/50 border-b border-slate-700/50 px-6 py-4 flex items-center justify-between backdrop-blur-xl">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/20">
                        C
                    </div>
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                        Cronos
                    </span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium text-white">{user.email}</p>
                        <p className="text-xs text-slate-400">Estudiante</p>
                    </div>
                    <Button
                        onClick={logout}
                        className="!w-auto px-6 py-2 text-sm bg-slate-800 hover:bg-slate-700 border border-slate-700"
                    >
                        Cerrar Sesión
                    </Button>
                </div>
            </nav>

            {/* Main Content */}
            <main className="container mx-auto px-6 py-12">
                <div className="mb-12">
                    <h1 className="text-4xl font-bold mb-4">
                        Bienvenido de nuevo, <span className="text-blue-400">{user.email?.split('@')[0]}</span>
                    </h1>
                    <p className="text-slate-400 text-lg">
                        Aquí tienes un resumen de tu actividad reciente.
                    </p>
                </div>

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Card 1 */}
                    <div className="bg-slate-800/50 border border-slate-700/50 rounded-3xl p-6 hover:bg-slate-800/80 transition-all cursor-pointer group">
                        <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold mb-2">Mis Cursos</h3>
                        <p className="text-slate-400 text-sm">Accede a tus materiales de estudio y lecciones pendientes.</p>
                    </div>

                    {/* Card 2 */}
                    <div className="bg-slate-800/50 border border-slate-700/50 rounded-3xl p-6 hover:bg-slate-800/80 transition-all cursor-pointer group">
                        <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold mb-2">Progreso</h3>
                        <p className="text-slate-400 text-sm">Visualiza tus estadísticas y avance en cada materia.</p>
                    </div>

                    {/* Card 3 */}
                    <div className="bg-slate-800/50 border border-slate-700/50 rounded-3xl p-6 hover:bg-slate-800/80 transition-all cursor-pointer group">
                        <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold mb-2">Calendario</h3>
                        <p className="text-slate-400 text-sm">Revisa tus próximas evaluaciones y eventos importantes.</p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
