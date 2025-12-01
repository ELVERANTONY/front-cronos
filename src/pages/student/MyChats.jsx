import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentService } from '../../services/studentService';
import { MessageSquare, Clock, ArrowRight, Search } from 'lucide-react';
import ChatInterface from './ChatInterface';

const MyChats = () => {
    const navigate = useNavigate();
    const [sessions, setSessions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedSession, setSelectedSession] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchSessions = async () => {
            try {
                const data = await studentService.getMySessions();
                setSessions(data);
            } catch (error) {
                console.error('Error fetching sessions:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSessions();
    }, []);

    const filteredSessions = sessions.filter(session =>
        session.characterName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="w-[95%] max-w-[2000px] mx-auto h-[calc(100vh-6rem)] py-4 flex gap-6">
            {/* Left Panel - Chat List */}
            <div className={`
                flex-col w-full lg:w-[400px] xl:w-[450px] bg-[#1e2330] rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl
                ${selectedSession ? 'hidden lg:flex' : 'flex'}
            `}>
                {/* Header */}
                <div className="p-6 border-b border-white/5 bg-[#1e2330]/95 backdrop-blur-md z-10">
                    <h1 className="text-2xl font-bold text-white mb-1">Mis Conversaciones</h1>
                    <p className="text-slate-400 text-sm mb-4">Continúa donde lo dejaste</p>

                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar conversación..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-[#1a1f2b] border border-white/5 rounded-xl py-3 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all text-sm"
                        />
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                    {filteredSessions.length === 0 ? (
                        <div className="text-center py-10">
                            <p className="text-slate-500">No se encontraron conversaciones</p>
                        </div>
                    ) : (
                        filteredSessions.map((session) => (
                            <div
                                key={session.id}
                                onClick={() => setSelectedSession(session)}
                                className={`
                                    group p-4 rounded-2xl cursor-pointer transition-all duration-200 border border-transparent
                                    ${selectedSession?.id === session.id
                                        ? 'bg-blue-600/10 border-blue-500/30'
                                        : 'hover:bg-white/5 hover:border-white/5'
                                    }
                                `}
                            >
                                <div className="flex items-start gap-4">
                                    <div className="relative">
                                        <img
                                            src={session.characterImageUrl || '/images/avatars/default.png'}
                                            alt={session.characterName}
                                            className="w-12 h-12 rounded-xl object-cover shadow-lg"
                                        />
                                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-[#1e2330] rounded-full"></div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className={`font-bold truncate ${selectedSession?.id === session.id ? 'text-blue-400' : 'text-white group-hover:text-blue-400'} transition-colors`}>
                                                {session.characterName}
                                            </h3>
                                            <span className="text-[10px] text-slate-500 whitespace-nowrap ml-2">
                                                {new Date(session.lastInteraction).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-slate-400 text-xs line-clamp-1 opacity-80">
                                            {session.lastMessagePreview || 'Inicia la conversación...'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Right Panel - Chat Interface */}
            <div className={`
                flex-1 bg-[#1e2330] rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl relative
                ${selectedSession ? 'flex' : 'hidden lg:flex'}
            `}>
                {selectedSession ? (
                    <ChatInterface
                        key={selectedSession.characterId} // Force remount on change
                        characterId={selectedSession.characterId}
                        onBack={() => setSelectedSession(null)}
                        className="w-full h-full border-none shadow-none rounded-none"
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-center p-8 relative overflow-hidden">
                        {/* Background Elements */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[100px]"></div>

                        <div className="relative z-10 max-w-md">
                            <div className="w-24 h-24 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-black/20 border border-white/5 rotate-3 hover:rotate-6 transition-transform duration-500">
                                <MessageSquare size={40} className="text-blue-400" />
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-4">Selecciona una conversación</h2>
                            <p className="text-slate-400 text-lg leading-relaxed mb-8">
                                Elige un personaje de la lista para continuar aprendiendo o explora nuevos mentores.
                            </p>
                            <button
                                onClick={() => navigate('/student/explore')}
                                className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all font-medium shadow-lg shadow-blue-600/20 flex items-center gap-2 mx-auto hover:-translate-y-1"
                            >
                                <Search size={20} />
                                Explorar Personajes
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyChats;
