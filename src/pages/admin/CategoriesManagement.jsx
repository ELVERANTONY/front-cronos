import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import ConfirmationModal from '../../components/admin/ConfirmationModal';
import { adminService } from '../../services/adminService';

const CategoriesManagement = () => {
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [error, setError] = useState(null);

    // Confirmation Modal State
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        variant: 'danger',
        onConfirm: null,
        confirmText: ''
    });

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        icon: '' // Lucide icon name like "brain", "flask", "palette", "book"
    });

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const data = await adminService.getCategories();
            console.log('✅ Categories loaded:', data);

            let categoriesArray = [];
            if (Array.isArray(data)) {
                categoriesArray = data;
            } else if (data && Array.isArray(data.results)) {
                categoriesArray = data.results;
            }

            setCategories(categoriesArray);
        } catch (err) {
            console.error('❌ Error loading categories:', err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenModal = (category = null) => {
        if (category) {
            setEditingCategory(category);
            setFormData({
                name: category.name,
                description: category.description || '',
                icon: category.icon || ''
            });
        } else {
            setEditingCategory(null);
            setFormData({ name: '', description: '', icon: '' });
        }
        setShowCreateModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('📤 Submitting category:', formData);

        try {
            if (editingCategory) {
                await adminService.updateCategory(editingCategory.id, formData);
                alert('✅ Categoría actualizada exitosamente');
            } else {
                await adminService.createCategory(formData);
                alert('✅ Categoría creada exitosamente');
            }

            setShowCreateModal(false);
            setFormData({ name: '', description: '', icon: '' });
            setEditingCategory(null);
            loadCategories();
        } catch (error) {
            console.error('❌ Category Submit Error:', error);
            const errorMsg = error.response?.data?.detail || error.response?.data?.name?.[0] || error.message;
            alert('Error al guardar categoría: ' + errorMsg);
        }
    };

    const handleToggleActive = (category) => {
        const action = category.is_active ? 'desactivar' : 'activar';
        const isDeactivating = action === 'desactivar';

        setConfirmModal({
            isOpen: true,
            title: isDeactivating ? '¿Desactivar Categoría?' : '¿Activar Categoría?',
            message: isDeactivating
                ? `Al desactivar la categoría "${category.name}", los personajes asociados podrían dejar de ser visibles para los estudiantes. ¿Estás seguro?`
                : `Al activar la categoría "${category.name}", será visible nuevamente en el sistema.`,
            variant: isDeactivating ? 'danger' : 'success',
            confirmText: isDeactivating ? 'Sí, Desactivar' : 'Sí, Activar',
            onConfirm: async () => {
                try {
                    await adminService.toggleCategoryActive(category.id);
                    // alert(`✅ Categoría ${action === 'desactivar' ? 'desactivada' : 'activada'} exitosamente`);
                    loadCategories();
                    setConfirmModal(prev => ({ ...prev, isOpen: false }));
                } catch (error) {
                    console.error('❌ Error toggling category:', error);
                    alert('Error al cambiar estado: ' + error.message);
                }
            }
        });
    };

    // Defensive filtering
    const safeCategories = Array.isArray(categories) ? categories : [];
    const filteredCategories = safeCategories.filter(cat =>
        (cat.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AdminLayout>
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Categorías</h1>
                    <p className="text-slate-400 text-sm">Organiza los personajes históricos por áreas</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="px-8 py-4 bg-gradient-to-r from-[#4facfe] to-[#00f2fe] text-white font-bold rounded-2xl shadow-[0_10px_20px_-10px_rgba(79,172,254,0.5)] hover:shadow-[0_20px_30px_-10px_rgba(79,172,254,0.6)] transition-all active:scale-95 flex items-center gap-3 transform hover:-translate-y-1"
                >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Nueva Categoría
                </button>
            </div>

            {/* Search Bar */}
            <div className="mb-8 relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <svg className="h-6 w-6 text-slate-500 group-focus-within:text-[#4facfe] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                <input
                    type="text"
                    placeholder="Buscar categorías..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-14 pr-6 py-5 bg-[#151A30] border border-slate-800/50 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-[#4facfe] focus:ring-2 focus:ring-[#4facfe]/20 transition-all text-base shadow-lg"
                />
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-2xl flex items-center gap-3 text-red-400">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                        <p className="font-bold">Error de conexión</p>
                        <p className="text-sm">{error}</p>
                    </div>
                </div>
            )}

            {/* Table Card */}
            <div className="bg-[#151A30] border border-slate-800/50 rounded-3xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#0B0E1E] border-b border-slate-800">
                                <th className="px-8 py-6 text-sm font-bold text-slate-400 uppercase tracking-wider">Nombre</th>
                                <th className="px-8 py-6 text-sm font-bold text-slate-400 uppercase tracking-wider">Icono</th>
                                <th className="px-8 py-6 text-sm font-bold text-slate-400 uppercase tracking-wider">Personajes</th>
                                <th className="px-8 py-6 text-sm font-bold text-slate-400 uppercase tracking-wider">Estado</th>
                                <th className="px-8 py-6 text-sm font-bold text-slate-400 uppercase tracking-wider text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="5" className="px-8 py-12 text-center text-slate-500 animate-pulse">Cargando categorías...</td>
                                </tr>
                            ) : filteredCategories.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-8 py-16 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
                                                <svg className="w-8 h-8 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                                </svg>
                                            </div>
                                            <h3 className="text-base font-medium text-white">No hay categorías</h3>
                                            <p className="text-slate-500">Crea la primera categoría para comenzar.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredCategories.map((cat) => (
                                    <tr key={cat.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-8 py-5">
                                            <div className="font-bold text-white text-sm">{cat.name}</div>
                                            <div className="text-xs text-slate-500 truncate max-w-xs">{cat.description}</div>
                                        </td>
                                        <td className="px-8 py-5 text-slate-400">{cat.icon || '-'}</td>
                                        <td className="px-8 py-5 text-slate-400 font-medium">{cat.character_count || 0}</td>
                                        <td className="px-8 py-5">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${cat.is_active
                                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                : 'bg-red-500/10 text-red-400 border-red-500/20'
                                                }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full mr-2 ${cat.is_active ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
                                                {cat.is_active ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleOpenModal(cat)}
                                                    className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all"
                                                    title="Editar"
                                                >
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => handleToggleActive(cat)}
                                                    className={`p-2 rounded-lg transition-all ${cat.is_active
                                                        ? 'text-slate-400 hover:text-amber-400 hover:bg-amber-500/10'
                                                        : 'text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10'
                                                        }`}
                                                    title={cat.is_active ? "Desactivar categoría" : "Activar categoría"}
                                                >
                                                    {cat.is_active ? (
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
            </div>

            {/* Premium Create/Edit Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-slate-950/70 flex items-center justify-center z-[60] p-4 transition-all duration-200">
                    <div className="bg-[#151A30] border border-slate-700/50 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-8 border-b border-slate-800 bg-[#0B0E1E] flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-bold text-white">{editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}</h2>
                                <p className="text-slate-400 text-sm mt-1">Completa los datos de la nueva categoría</p>
                            </div>
                            <button onClick={() => setShowCreateModal(false)} className="text-slate-500 hover:text-white transition-colors bg-slate-800/50 hover:bg-slate-700 p-2 rounded-full">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            {/* Nombre */}
                            <div>
                                <label className="block text-sm font-bold text-slate-300 mb-2">Nombre *</label>
                                <input
                                    type="text"
                                    placeholder="Ej: Científicos, Filósofos, Artistas"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3.5 bg-[#0B0E1E] border border-slate-700 rounded-xl text-white focus:border-[#4facfe] focus:ring-1 focus:ring-[#4facfe] focus:outline-none transition-all placeholder-slate-600"
                                    required
                                />
                            </div>

                            {/* Descripción */}
                            <div>
                                <label className="block text-sm font-bold text-slate-300 mb-2">Descripción</label>
                                <textarea
                                    placeholder="Descripción breve de la categoría"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-3.5 bg-[#0B0E1E] border border-slate-700 rounded-xl text-white focus:border-[#4facfe] focus:ring-1 focus:ring-[#4facfe] focus:outline-none transition-all placeholder-slate-600 resize-none h-24"
                                />
                            </div>

                            {/* Icono */}
                            <div>
                                <label className="block text-sm font-bold text-slate-300 mb-2">Icono</label>
                                <input
                                    type="text"
                                    placeholder="Ej: brain, flask, palette, book"
                                    value={formData.icon}
                                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                    className="w-full px-4 py-3.5 bg-[#0B0E1E] border border-slate-700 rounded-xl text-white focus:border-[#4facfe] focus:ring-1 focus:ring-[#4facfe] focus:outline-none transition-all placeholder-slate-600"
                                />
                                <p className="text-xs text-slate-500 mt-2">Nombre del icono de Lucide React (opcional)</p>
                            </div>

                            {/* Buttons */}
                            <div className="pt-6 flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 px-6 py-4 bg-[#0B0E1E] border border-slate-700 text-slate-300 rounded-2xl font-bold hover:bg-slate-800 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-6 py-4 bg-gradient-to-r from-[#4facfe] to-[#00f2fe] text-white rounded-2xl font-bold shadow-lg hover:shadow-cyan-500/25 transition-all active:scale-95"
                                >
                                    {editingCategory ? 'Guardar Cambios' : 'Crear'}
                                </button>
                            </div>
                        </form>
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

export default CategoriesManagement;
