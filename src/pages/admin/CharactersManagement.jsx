import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import ConfirmationModal from '../../components/admin/ConfirmationModal';
import Pagination from '../../components/admin/Pagination';
import { adminService } from '../../services/adminService';
import { useCharacterCreation } from '../../hooks/useCharacterCreation.jsx';
import CustomSelect from '../../components/admin/CustomSelect';

const CharactersManagement = () => {
    const [characters, setCharacters] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedCharacter, setSelectedCharacter] = useState(null);
    const [newCharName, setNewCharName] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [pageSize] = useState(10);

    // Confirmation Modal State
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        variant: 'danger',
        onConfirm: null
    });

    const {
        isCreating,
        progress,
        statusMessage,
        characterName,
        createCharacter
    } = useCharacterCreation();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async (page = currentPage) => {
        try {
            setIsLoading(true);
            const [charsData, catsData] = await Promise.all([
                adminService.getCharacters({
                    page,
                    page_size: pageSize
                }),
                adminService.getCategories()
            ]);

            // Handle paginated response
            if (charsData.results) {
                setCharacters(charsData.results);
                setTotalCount(charsData.count);
                setTotalPages(Math.ceil(charsData.count / pageSize));
                setCurrentPage(page);
            } else {
                setCharacters(Array.isArray(charsData) ? charsData : []);
                setTotalCount(Array.isArray(charsData) ? charsData.length : 0);
                setTotalPages(1);
            }

            // Handle categories - could be paginated or array
            const categoriesArray = catsData.results || catsData;
            setCategories(Array.isArray(categoriesArray) ? categoriesArray.filter(c => c.is_active) : []);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateCharacter = async () => {
        if (!newCharName || !selectedCategory) {
            alert('Por favor completa todos los campos');
            return;
        }

        setShowCreateModal(false);
        createCharacter(
            newCharName,
            parseInt(selectedCategory),
            (characterId) => {
                console.log('✅ Personaje creado con ID:', characterId);
                setNewCharName('');
                setSelectedCategory('');
                loadData();
            },
            (error) => {
                console.error('❌ Error creating character:', error);
                console.log('🔍 Error structure:', {
                    hasResponse: !!error.response,
                    hasData: !!error.response?.data,
                    data: error.response?.data
                });

                // Extract validation error message
                let errorMessage = 'Error al crear personaje';
                if (error.response?.data) {
                    const data = error.response.data;
                    if (data.name && Array.isArray(data.name)) {
                        errorMessage = `${data.name[0]}`;
                    } else if (data.category && Array.isArray(data.category)) {
                        errorMessage = `Categoría: ${data.category[0]}`;
                    } else if (typeof data === 'string') {
                        errorMessage = data;
                    }
                }
                console.log('📢 Showing alert:', errorMessage);
                alert(errorMessage);
            }
        );
    };

    const handleToggleActive = (character) => {
        const action = character.estado === 'activo' ? 'desactivar' : 'activar';
        const isDeactivating = action === 'desactivar';

        setConfirmModal({
            isOpen: true,
            title: isDeactivating ? '¿Desactivar Personaje?' : '¿Activar Personaje?',
            message: isDeactivating
                ? `Al desactivar a "${character.name}", los estudiantes dejarán de tener acceso al chat con este personaje. ¿Estás seguro de continuar?`
                : `Al activar a "${character.name}", estará disponible nuevamente para que los estudiantes interactúen con él.`,
            variant: isDeactivating ? 'danger' : 'success',
            confirmText: isDeactivating ? 'Sí, Desactivar' : 'Sí, Activar',
            onConfirm: async () => {
                try {
                    await adminService.toggleCharacterActive(character.id);
                    // alert(`✅ Personaje ${action === 'desactivar' ? 'desactivado' : 'activado'} exitosamente`); // Removed alert for cleaner flow
                    loadData();
                    setConfirmModal(prev => ({ ...prev, isOpen: false }));
                } catch (error) {
                    console.error('Error toggling character:', error);
                    alert('Error al cambiar estado: ' + error.message);
                }
            }
        });
    };

    const handleViewDetail = async (character) => {
        try {
            const detail = await adminService.getCharacterAdminDetail(character.id);
            setSelectedCharacter(detail);
            setShowDetailModal(true);
        } catch (error) {
            console.error('Error loading character detail:', error);
            alert('Error al cargar detalles del personaje');
        }
    };

    // Client-side search - filters current page results
    const filteredCharacters = characters.filter(char =>
        char.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        char.category_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AdminLayout>


            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Personajes Históricos</h1>
                    <p className="text-slate-400 text-sm">Gestiona los personajes históricos del sistema</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-8 py-4 bg-gradient-to-r from-[#4facfe] to-[#00f2fe] text-white font-bold rounded-2xl shadow-[0_10px_20px_-10px_rgba(79,172,254,0.5)] hover:shadow-[0_20px_30px_-10px_rgba(79,172,254,0.6)] transition-all active:scale-95 flex items-center gap-3 transform hover:-translate-y-1"
                >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Nuevo Personaje
                </button>
            </div>

            <div className="mb-8 relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <svg className="h-6 w-6 text-slate-500 group-focus-within:text-[#4facfe] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                <input
                    type="text"
                    placeholder="Buscar personajes por nombre o categoría..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-14 pr-6 py-5 bg-[#151A30] border border-slate-800/50 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-[#4facfe] focus:ring-2 focus:ring-[#4facfe]/20 transition-all text-base shadow-lg"
                />
            </div>

            <div className="bg-[#151A30] border border-slate-800/50 rounded-3xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#0B0E1E] border-b border-slate-800">
                                <th className="px-8 py-6 text-sm font-bold text-slate-400 uppercase tracking-wider">Nombre</th>
                                <th className="px-8 py-6 text-sm font-bold text-slate-400 uppercase tracking-wider">Categoría</th>
                                <th className="px-8 py-6 text-sm font-bold text-slate-400 uppercase tracking-wider">Avatar</th>
                                <th className="px-8 py-6 text-sm font-bold text-slate-400 uppercase tracking-wider">Estado</th>
                                <th className="px-8 py-6 text-sm font-bold text-slate-400 uppercase tracking-wider text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="5" className="px-8 py-12 text-center text-slate-500 animate-pulse">Cargando personajes...</td>
                                </tr>
                            ) : filteredCharacters.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-8 py-16 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
                                                <svg className="w-8 h-8 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                            </div>
                                            <h3 className="text-base font-medium text-white">No hay personajes</h3>
                                            <p className="text-slate-500">Crea el primer personaje para comenzar.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredCharacters.map((char) => (
                                    <tr key={char.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-8 py-5">
                                            <div className="font-bold text-white text-sm">{char.name}</div>
                                        </td>
                                        <td className="px-8 py-5 text-slate-400">{char.category_name || '-'}</td>
                                        <td className="px-8 py-5">
                                            <img
                                                src={char.imagen_url || 'https://via.placeholder.com/80'}
                                                alt={char.name}
                                                className="w-12 h-12 rounded-lg object-cover border border-slate-700"
                                            />
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${char.estado === 'activo'
                                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                : 'bg-red-500/10 text-red-400 border-red-500/20'
                                                }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full mr-2 ${char.estado === 'activo' ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
                                                {char.estado === 'activo' ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex justify-end gap-2">
                                                {/* Ver Detalle - Icono de Documento */}
                                                <button
                                                    onClick={() => handleViewDetail(char)}
                                                    className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all"
                                                    title="Ver Detalles"
                                                >
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                </button>

                                                {/* Activar/Desactivar - Icono de Ojo */}
                                                <button
                                                    onClick={() => handleToggleActive(char)}
                                                    className={`p-2 rounded-lg transition-all ${char.estado === 'activo'
                                                        ? 'text-slate-400 hover:text-amber-400 hover:bg-amber-500/10'
                                                        : 'text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10'
                                                        }`}
                                                    title={char.estado === 'activo' ? "Desactivar personaje" : "Activar personaje"}
                                                >
                                                    {char.estado === 'activo' ? (
                                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                                        </svg>
                                                    ) : (
                                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {!isLoading && filteredCharacters.length > 0 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalCount={totalCount}
                        pageSize={pageSize}
                        onPageChange={(page) => loadData(page)}
                    />
                )}
            </div>

            {/* Detail Modal */}
            {showDetailModal && selectedCharacter && (
                <div className="fixed inset-0 bg-slate-950/70 flex items-center justify-center z-[60] p-4 transition-all duration-200">
                    <div className="bg-[#151A30] border border-slate-700/50 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col">
                        {/* Modal Header */}
                        <div className="p-5 border-b border-slate-800 bg-[#0B0E1E] flex justify-between items-center flex-shrink-0">
                            <h2 className="text-lg font-bold text-white">Detalles del Personaje</h2>
                            <button onClick={() => setShowDetailModal(false)} className="text-slate-500 hover:text-white transition-colors bg-slate-800/50 hover:bg-slate-700 p-2 rounded-full">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1">
                            <div className="flex flex-col items-center text-center mb-6">
                                <img
                                    src={selectedCharacter.imagen_url || 'https://via.placeholder.com/150'}
                                    alt={selectedCharacter.name}
                                    className="w-24 h-24 rounded-2xl object-cover border-2 border-slate-700 shadow-lg mb-3"
                                />
                                <h2 className="text-xl font-bold text-white mb-1">{selectedCharacter.name}</h2>
                                {(selectedCharacter.alias || selectedCharacter.short_description) && (
                                    <p className="text-sm text-slate-400 italic font-serif">"{selectedCharacter.alias || selectedCharacter.short_description}"</p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-6">
                                <div className="bg-[#0B0E1E] p-3 rounded-xl border border-slate-800/50">
                                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Categoría</p>
                                    <p className="text-sm text-white font-medium">{selectedCharacter.category_name}</p>
                                </div>
                                <div className="bg-[#0B0E1E] p-3 rounded-xl border border-slate-800/50">
                                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Estado</p>
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border ${selectedCharacter.estado === 'activo'
                                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                        : 'bg-red-500/10 text-red-400 border-red-500/20'
                                        }`}>
                                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${selectedCharacter.estado === 'activo' ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
                                        {selectedCharacter.estado === 'activo' ? 'Activo' : 'Inactivo'}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {selectedCharacter.nacionalidad && (
                                    <div>
                                        <h3 className="text-sm font-bold text-white mb-1.5 flex items-center gap-2">
                                            <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Nacionalidad
                                        </h3>
                                        <p className="text-sm text-slate-300 leading-relaxed pl-6">{selectedCharacter.nacionalidad}</p>
                                    </div>
                                )}

                                {selectedCharacter.biografia_resumida && (
                                    <div>
                                        <h3 className="text-sm font-bold text-white mb-1.5 flex items-center gap-2">
                                            <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                            </svg>
                                            Biografía
                                        </h3>
                                        <p className="text-sm text-slate-300 leading-relaxed pl-6 text-justify">{selectedCharacter.biografia_resumida}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-slate-950/70 flex items-center justify-center z-[60] p-4 transition-all duration-200">
                    <div className="bg-[#151A30] border border-purple-500/30 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-8 border-b border-purple-500/20 flex justify-between items-center bg-gradient-to-r from-purple-900/20 to-indigo-900/20">
                            <div className="flex items-center gap-3">
                                <span className="text-3xl">✨</span>
                                <div>
                                    <h2 className="text-xl font-bold text-white">Crear con IA</h2>
                                    <p className="text-purple-300 text-sm">Generación automática de personajes</p>
                                </div>
                            </div>
                            <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-full transition-colors">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-8 space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-300 mb-2">Nombre del Personaje</label>
                                <input
                                    type="text"
                                    placeholder="Ej: Leonardo da Vinci, Cleopatra, Platón..."
                                    value={newCharName}
                                    onChange={(e) => setNewCharName(e.target.value)}
                                    className="w-full px-4 py-3.5 bg-[#0B0E1E] border border-slate-700 rounded-xl text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none transition-all placeholder-slate-600"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-300 mb-2">Categoría</label>
                                <div className="relative">
                                    <CustomSelect
                                        options={categories.map(cat => ({ value: cat.id, label: cat.name }))}
                                        value={selectedCategory}
                                        onChange={(val) => setSelectedCategory(val)}
                                        placeholder="Selecciona una categoría"
                                    />
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border border-purple-500/20 rounded-2xl p-6">
                                <div className="flex items-center gap-2 mb-4 text-purple-300 font-bold">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                    Potenciado por GPT-4 + DALL·E 3
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="flex items-center gap-2 text-sm text-slate-400">
                                        <span className="w-1.5 h-1.5 bg-purple-400 rounded-full"></span> Biografía
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-400">
                                        <span className="w-1.5 h-1.5 bg-purple-400 rounded-full"></span> Personalidad
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-400">
                                        <span className="w-1.5 h-1.5 bg-purple-400 rounded-full"></span> Voz (TTS)
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-400">
                                        <span className="w-1.5 h-1.5 bg-purple-400 rounded-full"></span> Avatar 3D
                                    </div>
                                </div>
                                <p className="text-xs text-purple-300/60 mt-4 text-center">
                                    ⚡ El proceso se ejecutará en segundo plano
                                </p>
                            </div>

                            <div className="flex gap-4 pt-2">
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 px-6 py-4 bg-[#0B0E1E] border border-slate-700 text-slate-300 rounded-2xl font-bold hover:bg-slate-800 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleCreateCharacter}
                                    className="flex-1 px-6 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-2xl font-bold shadow-lg shadow-purple-500/25 transition-all active:scale-95 flex items-center justify-center gap-2"
                                >
                                    <span>✨</span> Crear con IA
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                variant={confirmModal.variant}
                confirmText={confirmModal.confirmText}
            />
        </AdminLayout>
    );
};

export default CharactersManagement;
