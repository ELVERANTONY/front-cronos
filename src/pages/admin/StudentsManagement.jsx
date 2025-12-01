import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import SuccessToast from '../../components/admin/SuccessToast';
import ConfirmationModal from '../../components/admin/ConfirmationModal';
import Pagination from '../../components/admin/Pagination';
import { adminService } from '../../services/adminService';

const StudentsManagement = () => {
    const [students, setStudents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(null);
    const [showSuccessToast, setShowSuccessToast] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);

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
        onConfirm: null,
        confirmText: ''
    });

    // Form State
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: ''
    });

    useEffect(() => {
        loadStudents();
    }, []);

    const loadStudents = async (page = currentPage) => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await adminService.getStudents({
                page,
                page_size: pageSize
            });
            console.log('✅ Students loaded:', data);

            // Handle paginated response from Django REST Framework
            if (data.results) {
                setStudents(data.results);
                setTotalCount(data.count);
                setTotalPages(Math.ceil(data.count / pageSize));
                setCurrentPage(page);
            } else {
                // Fallback for non-paginated response
                setStudents(Array.isArray(data) ? data : []);
                setTotalCount(Array.isArray(data) ? data.length : 0);
                setTotalPages(1);
            }
        } catch (error) {
            console.error('❌ Error loading students:', error);
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const generatePassword = () => {
        const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
        let pass = "";
        for (let i = 0; i < 12; i++) {
            pass += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setFormData(prev => ({ ...prev, password: pass }));
    };

    const handleCreateStudent = async (e) => {
        e.preventDefault();
        console.log('📤 Attempting to create student:', formData);

        try {
            const response = await adminService.createStudent(formData);
            console.log('✅ Student created successfully:', response);

            setShowCreateModal(false);
            setFormData({ first_name: '', last_name: '', email: '', password: '' });
            loadStudents();
            setShowSuccessToast(true);
        } catch (error) {
            console.error('❌ Create Student Error:', error);
            console.error('Error details:', error.response?.data);

            let errorMessage = 'Error al crear estudiante';
            if (error.response?.data) {
                const data = error.response.data;
                if (data.email) {
                    errorMessage = `Email: ${data.email[0]}`;
                } else if (data.detail) {
                    errorMessage = data.detail;
                } else if (data.message) {
                    errorMessage = data.message;
                }
            } else if (error.message) {
                errorMessage = error.message;
            }

            alert(errorMessage);
        }
    };

    const handleToggleActive = (student) => {
        const isActive = student.enabled || student.is_active;
        const action = isActive ? 'desactivar' : 'activar';
        const isDeactivating = action === 'desactivar';

        setConfirmModal({
            isOpen: true,
            title: isDeactivating ? '¿Desactivar Estudiante?' : '¿Activar Estudiante?',
            message: isDeactivating
                ? `Al desactivar a "${student.first_name} ${student.last_name}", no podrá acceder al sistema. ¿Estás seguro?`
                : `Al activar a "${student.first_name} ${student.last_name}", podrá acceder nuevamente al sistema.`,
            variant: isDeactivating ? 'danger' : 'success',
            confirmText: isDeactivating ? 'Sí, Desactivar' : 'Sí, Activar',
            onConfirm: async () => {
                try {
                    await adminService.toggleStudentActive(student.id);
                    loadStudents();
                    setConfirmModal(prev => ({ ...prev, isOpen: false }));
                } catch (error) {
                    console.error('❌ Error toggling student:', error);
                    alert('Error al cambiar estado: ' + error.message);
                }
            }
        });
    };

    const handleEditStudent = (student) => {
        setEditingStudent(student);
        setFormData({
            first_name: student.first_name,
            last_name: student.last_name,
            email: student.email,
            password: ''
        });
        setShowEditModal(true);
    };

    const handleUpdateStudent = async (e) => {
        e.preventDefault();
        console.log('📤 Updating student:', editingStudent.id, formData);

        try {
            await adminService.updateStudent(editingStudent.id, {
                first_name: formData.first_name,
                last_name: formData.last_name
            });
            setShowEditModal(false);
            setEditingStudent(null);
            setFormData({ first_name: '', last_name: '', email: '', password: '' });
            loadStudents();
            setShowSuccessToast(true);
        } catch (error) {
            console.error('❌ Update Student Error:', error);
            alert('Error al actualizar estudiante: ' + (error.response?.data?.detail || error.message));
        }
    };

    const handleDeleteStudent = (student) => {
        setConfirmModal({
            isOpen: true,
            title: '¿Eliminar Estudiante?',
            message: `¿Estás seguro de que deseas eliminar a "${student.first_name} ${student.last_name}"? Esta acción no se puede deshacer.`,
            variant: 'danger',
            confirmText: 'Sí, Eliminar',
            onConfirm: async () => {
                try {
                    await adminService.deleteStudent(student.id);
                    loadStudents();
                    setConfirmModal(prev => ({ ...prev, isOpen: false }));
                } catch (error) {
                    console.error('❌ Error deleting student:', error);
                    alert('Error al eliminar estudiante: ' + error.message);
                }
            }
        });
    };


    // Client-side search - filters current page results
    const filteredStudents = students.filter(student =>
        student.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${student.first_name} ${student.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AdminLayout>
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Estudiantes</h1>
                    <p className="text-slate-400 text-sm">Gestiona el acceso y progreso de los alumnos</p>
                </div>
                <button
                    onClick={() => {
                        setFormData({ first_name: '', last_name: '', email: '', password: '' });
                        setShowCreateModal(true);
                    }}
                    className="px-8 py-4 bg-gradient-to-r from-[#4facfe] to-[#00f2fe] text-white font-bold rounded-2xl shadow-[0_10px_20px_-10px_rgba(79,172,254,0.5)] hover:shadow-[0_20px_30px_-10px_rgba(79,172,254,0.6)] transition-all active:scale-95 flex items-center gap-3 transform hover:-translate-y-1"
                >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    Nuevo Estudiante
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
                    placeholder="Buscar por nombre o correo..."
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
                                <th className="px-8 py-6 text-sm font-bold text-slate-400 uppercase tracking-wider">Estudiante</th>
                                <th className="px-8 py-6 text-sm font-bold text-slate-400 uppercase tracking-wider">Contacto</th>
                                <th className="px-8 py-6 text-sm font-bold text-slate-400 uppercase tracking-wider">Estado</th>
                                <th className="px-8 py-6 text-sm font-bold text-slate-400 uppercase tracking-wider text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="4" className="px-8 py-12 text-center text-slate-500 animate-pulse">Cargando datos...</td>
                                </tr>
                            ) : filteredStudents.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-8 py-16 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
                                                <svg className="w-8 h-8 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                                </svg>
                                            </div>
                                            <h3 className="text-base font-medium text-white">No hay estudiantes</h3>
                                            <p className="text-slate-500">Comienza agregando uno nuevo.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredStudents.map((student) => (
                                    <tr key={student.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                                                    {student.first_name?.[0] || 'U'}{student.last_name?.[0] || ''}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-white text-sm">
                                                        {student.full_name || `${student.first_name} ${student.last_name}`}
                                                    </div>
                                                    <div className="text-xs text-slate-500">ID: #{student.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-slate-400 font-medium">{student.email}</td>
                                        <td className="px-8 py-5">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${student.enabled || student.is_active
                                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                : 'bg-red-500/10 text-red-400 border-red-500/20'
                                                }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full mr-2 ${(student.enabled || student.is_active) ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
                                                {(student.enabled || student.is_active) ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleToggleActive(student)}
                                                    className={`p-2 rounded-lg transition-all ${(student.enabled || student.is_active)
                                                        ? 'text-slate-400 hover:text-amber-400 hover:bg-amber-500/10'
                                                        : 'text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10'
                                                        }`}
                                                    title={(student.enabled || student.is_active) ? "Desactivar estudiante" : "Activar estudiante"}
                                                >
                                                    {(student.enabled || student.is_active) ? (
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
                                                <button
                                                    onClick={() => handleEditStudent(student)}
                                                    className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all"
                                                    title="Editar estudiante"
                                                >
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteStudent(student)}
                                                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                                                    title="Eliminar estudiante"
                                                >
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
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
                {!isLoading && filteredStudents.length > 0 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalCount={totalCount}
                        pageSize={pageSize}
                        onPageChange={(page) => loadStudents(page)}
                    />
                )}
            </div>

            {/* Premium Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-slate-950/70 flex items-center justify-center z-[60] p-4 transition-all duration-200">
                    <div className="bg-[#151A30] border border-slate-700/50 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="p-8 border-b border-slate-800 bg-[#0B0E1E] flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-bold text-white">Agregar Estudiante</h2>
                                <p className="text-slate-400 text-sm mt-1">Crea una nueva cuenta de acceso</p>
                            </div>
                            <button onClick={() => setShowCreateModal(false)} className="text-slate-500 hover:text-white transition-colors bg-slate-800/50 hover:bg-slate-700 p-2 rounded-full">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleCreateStudent} className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-300 mb-2">Nombre</label>
                                    <input
                                        type="text"
                                        placeholder="Ej: Juan"
                                        value={formData.first_name}
                                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                        className="w-full px-4 py-3.5 bg-[#0B0E1E] border border-slate-700 rounded-xl text-white focus:border-[#4facfe] focus:ring-1 focus:ring-[#4facfe] focus:outline-none transition-all placeholder-slate-600"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-300 mb-2">Apellido</label>
                                    <input
                                        type="text"
                                        placeholder="Ej: Pérez"
                                        value={formData.last_name}
                                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                        className="w-full px-4 py-3.5 bg-[#0B0E1E] border border-slate-700 rounded-xl text-white focus:border-[#4facfe] focus:ring-1 focus:ring-[#4facfe] focus:outline-none transition-all placeholder-slate-600"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-300 mb-2">Correo electrónico</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                        </svg>
                                    </div>
                                    <input
                                        type="email"
                                        placeholder="juan@example.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full pl-12 pr-4 py-3.5 bg-[#0B0E1E] border border-slate-700 rounded-xl text-white focus:border-[#4facfe] focus:ring-1 focus:ring-[#4facfe] focus:outline-none transition-all placeholder-slate-600"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-300 mb-2">Contraseña</label>
                                <div className="flex gap-3">
                                    <div className="relative flex-1">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            className="w-full px-4 py-3.5 bg-[#0B0E1E] border border-slate-700 rounded-xl text-white focus:border-[#4facfe] focus:ring-1 focus:ring-[#4facfe] focus:outline-none transition-all placeholder-slate-600"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-white"
                                        >
                                            {showPassword ? (
                                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                                </svg>
                                            ) : (
                                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={generatePassword}
                                        className="px-4 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl font-medium transition-colors flex items-center gap-2 border border-slate-700"
                                        title="Generar contraseña segura"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                    </button>
                                </div>
                                <p className="text-xs text-slate-500 mt-2">
                                    La contraseña será enviada por correo al estudiante.
                                </p>
                            </div>

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
                                    Crear Estudiante
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && editingStudent && (
                <div className="fixed inset-0 bg-slate-950/70 flex items-center justify-center z-[60] p-4 transition-all duration-200">
                    <div className="bg-[#151A30] border border-slate-700/50 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-8 border-b border-slate-800 bg-[#0B0E1E] flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-bold text-white">Editar Estudiante</h2>
                                <p className="text-slate-400 text-sm mt-1">Actualiza la información del estudiante</p>
                            </div>
                            <button onClick={() => { setShowEditModal(false); setEditingStudent(null); }} className="text-slate-500 hover:text-white transition-colors bg-slate-800/50 hover:bg-slate-700 p-2 rounded-full">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleUpdateStudent} className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-300 mb-2">Nombre</label>
                                    <input
                                        type="text"
                                        placeholder="Ej: Juan"
                                        value={formData.first_name}
                                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                        className="w-full px-4 py-3.5 bg-[#0B0E1E] border border-slate-700 rounded-xl text-white focus:border-[#4facfe] focus:ring-1 focus:ring-[#4facfe] focus:outline-none transition-all placeholder-slate-600"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-300 mb-2">Apellido</label>
                                    <input
                                        type="text"
                                        placeholder="Ej: Pérez"
                                        value={formData.last_name}
                                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                        className="w-full px-4 py-3.5 bg-[#0B0E1E] border border-slate-700 rounded-xl text-white focus:border-[#4facfe] focus:ring-1 focus:ring-[#4facfe] focus:outline-none transition-all placeholder-slate-600"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-300 mb-2">Correo electrónico</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                        </svg>
                                    </div>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        disabled
                                        className="w-full pl-12 pr-4 py-3.5 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-500 cursor-not-allowed"
                                    />
                                </div>
                                <p className="text-xs text-slate-500 mt-2">El correo no se puede modificar</p>
                            </div>

                            <div className="pt-6 flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => { setShowEditModal(false); setEditingStudent(null); }}
                                    className="flex-1 px-6 py-4 bg-[#0B0E1E] border border-slate-700 text-slate-300 rounded-2xl font-bold hover:bg-slate-800 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-6 py-4 bg-gradient-to-r from-[#4facfe] to-[#00f2fe] text-white rounded-2xl font-bold shadow-lg hover:shadow-cyan-500/25 transition-all active:scale-95"
                                >
                                    Guardar Cambios
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Success Toast */}
            <SuccessToast
                isVisible={showSuccessToast}
                message="¡Estudiante Creado!"
                subMessage="Se han enviado las credenciales al correo registrado."
                onClose={() => setShowSuccessToast(false)}
            />

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

export default StudentsManagement;
