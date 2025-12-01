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
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-[#0a0e27]">
            <div className="relative hidden lg:block">
                <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover">
                    <source src="/videos/login-hero.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-black/20"></div>
            </div>

            <div className="relative flex items-center justify-center min-h-screen px-8 lg:px-16 bg-[#0a0e27] overflow-y-auto">
                <img
                    src="/images/logos/Cronos-digital-transparente.png"
                    alt="Cronos"
                    className="absolute top-4 left-1/2 -translate-x-1/2 h-32 w-auto opacity-90 z-10 pointer-events-none"
                />

                <div className="w-full max-w-md pt-24 pb-8">
                    <div className="mb-6 text-center">
                        <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">Cambio de Contraseña Obligatorio</h1>
                        <p className="text-slate-400 text-sm">
                            Por seguridad, debes cambiar tu contraseña temporal
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Email Info */}
                        <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl flex items-start gap-2">
                            <svg className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <div className="flex-1">
                                <p className="text-xs text-blue-300 font-medium">Usuario</p>
                                <p className="text-sm text-white font-semibold">{email}</p>
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm text-center">
                                {error}
                            </div>
                        )}

                        {/* Nueva Contraseña */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Nueva Contraseña
                            </label>
                            <div className="relative">
                                <input
                                    type={showNewPassword ? "text" : "password"}
                                    value={formData.newPassword}
                                    onChange={handleChange('newPassword')}
                                    placeholder="Mínimo 8 caracteres"
                                    required
                                    disabled={isLoading}
                                    autoComplete="new-password"
                                    className="w-full px-6 py-3 bg-[#0B0E1E] rounded-xl text-white placeholder-slate-600 border-none shadow-[inset_0_4px_8px_rgba(0,0,0,0.6)] focus:ring-2 focus:ring-[#4facfe] transition-all outline-none text-base pr-12"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        {showNewPassword ? (
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                        ) : (
                                            <>
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </>
                                        )}
                                    </svg>
                                </button>
                            </div>
                            {formData.newPassword && formData.newPassword.length < 8 && (
                                <p className="text-xs text-orange-400 mt-1">
                                    ⚠️ Debe tener al menos 8 caracteres
                                </p>
                            )}
                        </div>

                        {/* Confirmar Contraseña */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Confirmar Contraseña
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={formData.confirmPassword}
                                    onChange={handleChange('confirmPassword')}
                                    placeholder="Repite tu contraseña"
                                    required
                                    disabled={isLoading}
                                    autoComplete="new-password"
                                    className="w-full px-6 py-3 bg-[#0B0E1E] rounded-xl text-white placeholder-slate-600 border-none shadow-[inset_0_4px_8px_rgba(0,0,0,0.6)] focus:ring-2 focus:ring-[#4facfe] transition-all outline-none text-base pr-12"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        {showConfirmPassword ? (
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                        ) : (
                                            <>
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </>
                                        )}
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="p-3 bg-orange-500/10 border border-orange-500/30 rounded-xl text-orange-300 text-xs">
                            <p className="font-semibold mb-0.5">Esta acción es obligatoria para continuar</p>
                            <p>Por tu seguridad, no podrás acceder al sistema con la contraseña temporal.</p>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-4 bg-gradient-to-r from-[#4facfe] to-[#00f2fe] text-white rounded-xl font-bold text-base shadow-[0_8px_0_#0095c8,0_12px_20px_rgba(79,172,254,0.4)] active:shadow-[0_3px_0_#0095c8] active:translate-y-[4px] transition-all disabled:opacity-70 disabled:cursor-not-allowed hover:brightness-110"
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
    );
};

export default ChangeTemporalPassword;
