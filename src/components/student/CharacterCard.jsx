import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, ChevronRight } from 'lucide-react';
import { studentService } from '../../services/studentService';

const CharacterCard = ({ char }) => {
    const navigate = useNavigate();
    const [details, setDetails] = useState(null);
    const [isLoadingDetails, setIsLoadingDetails] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const fetchDetails = async () => {
            try {
                const data = await studentService.getCharacterDetails(char.id);
                if (isMounted) {
                    setDetails(data);
                }
            } catch (error) {
                console.error(`Error fetching details for ${char.name}:`, error);
            } finally {
                if (isMounted) {
                    setIsLoadingDetails(false);
                }
            }
        };

        fetchDetails();

        return () => {
            isMounted = false;
        };
    }, [char.id]);

    // Use details if available, otherwise fallback to initial char data
    const description = details?.description || details?.shortDescription || details?.biografiaResumida || char.description || char.shortDescription || "Descubre la historia y conocimientos de este personaje legendario.";
    const topics = details?.topics || [];

    return (
        <div className="group relative h-96 w-full perspective-1000">
            <div className="relative w-full h-full transition-all duration-500 transform style-preserve-3d group-hover:rotate-y-180">
                {/* Front Side */}
                <div className="absolute inset-0 w-full h-full backface-hidden bg-[#1e2330] rounded-[2rem] overflow-hidden border border-white/5 shadow-lg">
                    <img
                        src={char.avatarUrl || char.imagenUrl || '/images/avatars/default.png'}
                        alt={char.name}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1e2330] via-transparent to-transparent opacity-90"></div>

                    {/* Floating Badge */}
                    {char.categoryName && (
                        <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-wider">
                            {char.categoryName}
                        </div>
                    )}

                    {/* Name Overlay */}
                    <div className="absolute bottom-0 left-0 w-full p-6">
                        <h3 className="text-2xl font-bold text-white leading-tight">{char.name}</h3>
                        <div className="flex items-center gap-2 text-blue-400 text-xs font-medium opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 mt-2">
                            <span>Ver detalles</span>
                            <ChevronRight size={14} />
                        </div>
                    </div>
                </div>

                {/* Back Side */}
                <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-[#1e2330] rounded-[2rem] border border-blue-500/30 p-6 flex flex-col justify-between shadow-[0_0_30px_rgba(37,99,235,0.15)]">
                    <div className="overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 pr-2">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-blue-500/30 flex-shrink-0">
                                <img
                                    src={char.avatarUrl || char.imagenUrl || '/images/avatars/default.png'}
                                    alt={char.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white leading-tight">{char.name}</h3>
                                <p className="text-xs text-blue-400 font-medium">{char.categoryName}</p>
                            </div>
                        </div>

                        {isLoadingDetails ? (
                            <div className="space-y-2 animate-pulse">
                                <div className="h-2 bg-white/10 rounded w-full"></div>
                                <div className="h-2 bg-white/10 rounded w-5/6"></div>
                                <div className="h-2 bg-white/10 rounded w-4/6"></div>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <p className="text-slate-300 text-sm leading-relaxed">
                                    {description}
                                </p>
                                {topics.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {topics.slice(0, 3).map((topic, idx) => (
                                            <span key={idx} className="text-[10px] bg-blue-500/10 text-blue-300 px-2 py-1 rounded-md border border-blue-500/20">
                                                {topic}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => navigate('/student/chats', { state: { startChatWith: char.id } })}
                        className="w-full py-3 mt-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition-all hover:-translate-y-1 flex-shrink-0"
                    >
                        <MessageCircle size={18} />
                        <span>Iniciar Conversación</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CharacterCard;
