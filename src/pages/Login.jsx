import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await authService.login(email, password);
            console.log('✅ Login exitoso:', response);

            // CHECK: ¿Debe cambiar contraseña temporal?
            if (response.isTemporalPassword === true || response.mustChangePassword === true) {
                console.log('⚠️ Usuario con contraseña temporal detectado!');
                console.log('Message:', response.message);
                navigate('/change-temporal-password', {
                    state: {
                        email,
                        temporalPassword: password // Pass the password they just used to login
                    }
                });
                return;
            }

            // GUARDAR TOKEN (ambas keys para compatibilidad)
            if (response.token) {
                localStorage.setItem('token', response.token);
                localStorage.setItem('jwt_token', response.token);
            }

            // Obtener información del usuario
            const user = response.user || response;
            const roles = user.roles || [];
            const roleName = user.role_name || user.role || '';

            // GUARDAR USUARIO completo en localStorage
            const userToStore = {
                id: user.id || response.id,
                email: user.email || response.email,
                roles: roles,
                role_name: roleName
            };
            localStorage.setItem('user', JSON.stringify(userToStore));

            console.log('User Data:', { roles, roleName, email: user.email });

            // Normalizar roles a array
            const userRoles = Array.isArray(roles) ? roles : [roles];
            if (roleName) userRoles.push(roleName);

            // Verificar si es Admin o Teacher
            const isAdmin = userRoles.some(r =>
                ['ROLE_ADMIN', 'ADMIN', 'ROLE_TEACHER', 'TEACHER'].includes(String(r).toUpperCase())
            ) || (user.email && user.email.toLowerCase().includes('admin'));

            console.log('Is Admin?', isAdmin);

            if (isAdmin) {
                navigate('/admin');
            } else {
                navigate('/student/dashboard');
            }
        } catch (err) {
            console.error('❌ Error al iniciar sesión:', err);
            let errorMessage = 'Credenciales inválidas';
            if (err.response) {
                errorMessage = err.response.data?.error || err.response.data?.message || `Error ${err.response.status}`;
            } else if (err.request) {
                errorMessage = 'No hay respuesta del servidor. Verifica tu conexión.';
            } else {
                errorMessage = err.message;
            }
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-[#0a0e27] overflow-hidden">
            <div className="relative hidden lg:block h-full w-full">
                <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover">
                    <source src="/videos/login-hero.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-black/20"></div>
            </div>

            <div className="relative flex items-center justify-center min-h-screen px-8 lg:px-16 bg-[#0a0e27]">
                <img
                    src="/images/logos/Cronos-digital-transparente.png"
                    alt="Cronos"
                    className="absolute top-4 left-1/2 -translate-x-1/2 h-32 w-auto opacity-90 z-10 pointer-events-none"
                />

                <div className="w-full max-w-md pt-24 pb-8">
                    <div className="mb-6 text-center">
                        <h1 className="text-2xl font-bold text-white mb-1">¡Hola!</h1>
                        <p className="text-slate-400 text-sm">Inicia sesión en tu cuenta</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Correo electrónico
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="tu@email.com"
                                required
                                disabled={isLoading}
                                autoComplete="off"
                                className="w-full px-6 py-4 bg-[#0B0E1E] rounded-xl text-white placeholder-slate-600 border-none shadow-[inset_0_4px_8px_rgba(0,0,0,0.6)] focus:ring-2 focus:ring-[#4facfe] transition-all outline-none text-base"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Contraseña
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    disabled={isLoading}
                                    autoComplete="current-password"
                                    className="w-full px-6 py-4 bg-[#0B0E1E] rounded-xl text-white placeholder-slate-600 border-none shadow-[inset_0_4px_8px_rgba(0,0,0,0.6)] focus:ring-2 focus:ring-[#4facfe] transition-all outline-none text-base pr-12"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                                >
                                    {showPassword ? (
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
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    disabled={isLoading}
                                    className="w-4 h-4 rounded border-slate-600 bg-[#1a1f3a] text-[#4facfe] focus:ring-[#4facfe]"
                                />
                                <span className="ml-2 text-sm text-slate-400">Recordarme</span>
                            </label>
                            <Link to="/forgot-password" className="text-sm text-[#4facfe] hover:text-[#00f2fe] transition-colors">
                                ¿Olvidaste tu contraseña?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-4 bg-gradient-to-r from-[#4facfe] to-[#00f2fe] text-white rounded-xl font-bold text-base shadow-[0_8px_0_#0095c8,0_12px_20px_rgba(79,172,254,0.4)] active:shadow-[0_3px_0_#0095c8] active:translate-y-[4px] transition-all disabled:opacity-70 disabled:cursor-not-allowed hover:brightness-110"
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Iniciando sesión...
                                </span>
                            ) : (
                                'Iniciar Sesión'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
