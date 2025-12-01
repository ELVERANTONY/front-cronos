import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';

const ChangeTemporalPassword = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const email = location.state?.email;
    const temporalPassword = location.state?.temporalPassword;

    const [formData, setFormData] = useState({
        newPassword: '',
        confirmPassword: ''
    });
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!email || !temporalPassword) {
            navigate('/login');
        }
    }, [email, temporalPassword, navigate]);

    const handleChange = (field) => (e) => {
        setFormData(prev => ({ ...prev, [field]: e.target.value }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validaciones
        if (formData.newPassword.length < 8) {
            setError('La contraseña debe tener al menos 8 caracteres');
            return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        setIsLoading(true);

        try {
            console.log('📤 Enviando cambio de contraseña:');
            console.log('Email:', email);
            console.log('Temporal Password:', temporalPassword);
            console.log('New Password:', formData.newPassword);

            await authService.changeTemporalPassword(email, temporalPassword, formData.newPassword);

            console.log('✅ Contraseña actualizada, haciendo login automático...');

            // Auto-login con la nueva contraseña
            const loginResponse = await authService.login(email, formData.newPassword);

            // Guardar token y usuario
            if (loginResponse.token) {
                localStorage.setItem('token', loginResponse.token);
                localStorage.setItem('jwt_token', loginResponse.token);
            }

            const user = loginResponse.user || loginResponse;
            const roles = user.roles || [];
            const roleName = user.role_name || user.role || '';

            const userToStore = {
                id: user.id || loginResponse.id,
                email: user.email || loginResponse.email,
                roles: roles,
                role_name: roleName
            };
            localStorage.setItem('user', JSON.stringify(userToStore));

            // Verificar si es Admin o Student
            const userRoles = Array.isArray(roles) ? roles : [roles];
            if (roleName) userRoles.push(roleName);

            const isAdmin = userRoles.some(r =>
                ['ROLE_ADMIN', 'ADMIN', 'ROLE_TEACHER', 'TEACHER'].includes(String(r).toUpperCase())
            ) || (user.email && user.email.toLowerCase().includes('admin'));

            // Redirigir al dashboard correspondiente
            if (isAdmin) {
                navigate('/admin');
            } else {
                navigate('/student/dashboard');
            }
        } catch (err) {
            console.error('❌ Error al cambiar contraseña:', err);
            const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Error al cambiar la contraseña';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0e27] p-4 font-sans">
            <div className="bg-white rounded-[2.5rem] shadow-2xl flex max-w-[1100px] w-full overflow-hidden min-h-[700px] relative">

                {/* Left Side - Hero Image/Video */}
                <div className="hidden lg:block w-1/2 relative bg-[#0a0e27]">
                    <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-80">
                        <source src="/videos/login-hero.mp4" type="video/mp4" />
                    </video>
                    <div className="absolute inset-0 bg-gradient-to-br from-[#4facfe]/20 to-[#00f2fe]/20 mix-blend-overlay"></div>

                    {/* Logo Overlay on Image */}
                    <div className="absolute top-8 left-8">
                        <img
                            src="/images/logos/Cronos-digital-transparente.png"
                            alt="Cronos"
                            className="h-16 w-auto drop-shadow-lg"
                        />
                    </div>

                    <div className="absolute bottom-12 left-12 right-12 text-white">
                        <h2 className="text-3xl font-bold mb-4 leading-tight">Seguridad ante todo</h2>
                        <p className="text-white/80 text-lg">Actualiza tu contraseña temporal para mantener tu cuenta protegida.</p>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="w-full lg:w-1/2 p-8 md:p-16 flex flex-col justify-center bg-white relative">

                    {/* Mobile Logo */}
                    <div className="lg:hidden absolute top-6 left-6">
                        <img
                            src="/images/logos/Cronos-digital-transparente.png"
                            alt="Cronos"
                            className="h-12 w-auto"
                        />
                    </div>

                    <div className="max-w-md mx-auto w-full">
                        <div className="text-center mb-10">
                            <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <h1 className="text-3xl font-bold text-slate-800 mb-3">Cambio Obligatorio</h1>
                            <p className="text-slate-500 text-lg">Por seguridad, debes cambiar tu contraseña temporal.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Email Info */}
                            <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-start gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-xs text-blue-500 font-bold uppercase tracking-wider mb-0.5">Usuario</p>
                                    <p className="text-sm text-slate-700 font-semibold">{email}</p>
                                </div>
                            </div>

                            {error && (
                                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-500 text-sm flex items-center gap-2 animate-shake">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {error}
                                </div>
                            )}

                            {/* Nueva Contraseña */}
                            <div>
                                <div className="relative">
                                    <input
                                        type={showNewPassword ? "text" : "password"}
                                        value={formData.newPassword}
                                        onChange={handleChange('newPassword')}
                                        placeholder="Nueva contraseña (mínimo 8 caracteres)"
                                        required
                                        disabled={isLoading}
                                        autoComplete="new-password"
                                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-slate-800 placeholder-slate-400 focus:bg-white focus:border-[#4facfe] focus:ring-4 focus:ring-[#4facfe]/10 transition-all outline-none text-base font-medium pr-12"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#4facfe] transition-colors"
                                    >
                                        {showNewPassword ? (
                                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                            </svg>
                                        ) : (
                                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                                {formData.newPassword && formData.newPassword.length < 8 && (
                                    <p className="text-xs text-orange-500 mt-2 ml-2 font-medium flex items-center gap-1">
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                        Debe tener al menos 8 caracteres
                                    </p>
                                )}
                            </div>

                            {/* Confirmar Contraseña */}
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={formData.confirmPassword}
                                    onChange={handleChange('confirmPassword')}
                                    placeholder="Repite tu contraseña"
                                    required
                                    disabled={isLoading}
                                    autoComplete="new-password"
                                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-slate-800 placeholder-slate-400 focus:bg-white focus:border-[#4facfe] focus:ring-4 focus:ring-[#4facfe]/10 transition-all outline-none text-base font-medium pr-12"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#4facfe] transition-colors"
                                >
                                    {showConfirmPassword ? (
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                        </svg>
                                    ) : (
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>

                            <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl flex items-start gap-3">
                                <svg className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <div className="text-sm text-orange-800">
                                    <p className="font-bold mb-0.5">Acción requerida</p>
                                    <p className="opacity-90">No podrás acceder al sistema hasta que actualices tu contraseña.</p>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-4 bg-gradient-to-r from-[#4facfe] to-[#00f2fe] text-white rounded-2xl font-bold text-lg shadow-[0_10px_20px_rgba(79,172,254,0.3)] hover:shadow-[0_15px_30px_rgba(79,172,254,0.4)] hover:-translate-y-1 active:translate-y-0 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                {isLoading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 h-5" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Actualizando...
                                    </span>
                                ) : (
                                    'Cambiar Contraseña'
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChangeTemporalPassword;
