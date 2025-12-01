import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentService } from '../../services/studentService';
import { Search, Filter, MessageCircle, ChevronRight, Sparkles } from 'lucide-react';
import CharacterCard from '../../components/student/CharacterCard';

const ExploreCharacters = () => {
    const navigate = useNavigate();
    const [characters, setCharacters] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    // Fetch Categories on mount
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await studentService.getAllCategories(0, 100);
                setCategories(data.content || []);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };
        fetchCategories();
    }, []);

    // Fetch Characters when filters change
    useEffect(() => {
        const fetchCharacters = async () => {
            setIsLoading(true);
            try {
                let data;
                if (searchQuery) {
                    const results = await studentService.searchCharacters(searchQuery);
                    setCharacters(results);
                    setTotalPages(1);
                } else if (selectedCategory) {
                    // Updated to use the new endpoint structure
                    data = await studentService.getCharactersByCategory(selectedCategory, page, 8);
                    // The backend returns { categoryId, ..., characters: { content: [], ... } }
                    if (data.characters) {
                        setCharacters(data.characters.content || []);
                        setTotalPages(data.characters.totalPages);
                    } else {
                        // Fallback if structure is different
                        setCharacters([]);
                        setTotalPages(0);
                    }
                } else {
                    data = await studentService.getAllCharacters(page, 8);
                    setCharacters(data.content || []);
                    setTotalPages(data.totalPages);
                }
            } catch (error) {
                console.error('Error fetching characters:', error);
            } finally {
                setIsLoading(false);
            }
        };

        const timeoutId = setTimeout(() => {
            fetchCharacters();
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [page, selectedCategory, searchQuery]);

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
        setPage(0);
    };

    const handleCategorySelect = (categoryId) => {
        if (selectedCategory === categoryId) {
            setSelectedCategory(null);
        } else {
            setSelectedCategory(categoryId);
        }
        setPage(0);
    };

    return (
        <div className="w-[92%] max-w-[2000px] mx-auto py-8 space-y-8 pb-40">
            {/* Header & Search */}
            <div className="flex flex-col md:flex-row gap-6 items-end justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Explorar</h1>
                    <p className="text-slate-400 text-sm">Descubre las figuras que marcaron la historia</p>
                </div>

                {/* Floating Search Bar */}
                <div className="relative w-full md:w-96 group">
                    <div className="absolute inset-0 bg-blue-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative flex items-center bg-[#1e2330] border border-white/10 rounded-2xl p-2 shadow-lg transition-all focus-within:border-blue-500/50 focus-within:ring-1 focus-within:ring-blue-500/50">
                        <div className="p-2 text-slate-400">
                            <Search size={20} />
                        </div>
                        <input
                            type="text"
                            placeholder="Buscar personaje..."
                            value={searchQuery}
                            onChange={handleSearch}
                            className="w-full bg-transparent border-none text-white placeholder-slate-500 focus:ring-0 text-sm"
                        />
                        <button className="p-2 bg-[#252a3a] rounded-xl text-slate-400 hover:text-white hover:bg-blue-600 transition-all">
                            <Filter size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Categories Pills */}
            <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
                <button
                    onClick={() => setSelectedCategory(null)}
                    className={`
                        px-6 py-3 rounded-2xl whitespace-nowrap transition-all font-medium text-sm border
                        ${!selectedCategory
                            ? 'bg-blue-600 border-blue-500 text-white shadow-[0_4px_12px_rgba(37,99,235,0.3)]'
                            : 'bg-[#1e2330] border-white/5 text-slate-400 hover:bg-[#252a3a] hover:text-white'
                        }
                    `}
                >
                    Todos
                </button>
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => handleCategorySelect(cat.id)}
                        className={`
                            px-6 py-3 rounded-2xl whitespace-nowrap transition-all font-medium text-sm border flex items-center gap-2
                            ${selectedCategory === cat.id
                                ? 'bg-blue-600 border-blue-500 text-white shadow-[0_4px_12px_rgba(37,99,235,0.3)]'
                                : 'bg-[#1e2330] border-white/5 text-slate-400 hover:bg-[#252a3a] hover:text-white'
                            }
                        `}
                    >
                        <span>{cat.icon}</span>
                        <span>{cat.name}</span>
                    </button>
                ))}
            </div>

            {/* Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="bg-[#1e2330] rounded-[2rem] h-96 animate-pulse border border-white/5"></div>
                    ))}
                </div>
            ) : characters.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {characters.map((char) => (
                        <CharacterCard key={char.id} char={char} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-[#1e2330]/50 rounded-[3rem] border border-white/5 border-dashed">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Search size={32} className="text-slate-500" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">No se encontraron personajes</h3>
                    <p className="text-slate-400 text-sm">Intenta con otros términos de búsqueda o filtros.</p>
                </div>
            )}

            {/* Pagination */}
            {!searchQuery && totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                    <button
                        onClick={() => setPage(p => Math.max(0, p - 1))}
                        disabled={page === 0}
                        className="px-6 py-3 rounded-2xl bg-[#1e2330] border border-white/10 text-white disabled:opacity-50 hover:bg-[#252a3a] transition-colors text-sm font-medium"
                    >
                        Anterior
                    </button>
                    <span className="px-6 py-3 text-slate-400 text-sm flex items-center">
                        {page + 1} / {totalPages}
                    </span>
                    <button
                        onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                        disabled={page >= totalPages - 1}
                        className="px-6 py-3 rounded-2xl bg-[#1e2330] border border-white/10 text-white disabled:opacity-50 hover:bg-[#252a3a] transition-colors text-sm font-medium"
                    >
                        Siguiente
                    </button>
                </div>
            )}
        </div>
    );
};

export default ExploreCharacters;
