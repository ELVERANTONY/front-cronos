import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { sessionService } from '../services/sessionService';

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

            // Registrar sesión activa en Django
            await sessionService.updateSession();

            if (isAdmin) {
                navigate('/admin');
            } else {
                navigate('/student/dashboard');
            }
        } catch (err) {
            console.error('❌ Error al iniciar sesión:', err);
            console.log('🔍 Error completo:', {
                status: err.response?.status,
                data: err.response?.data,
                headers: err.response?.headers
            });

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
                        <h2 className="text-3xl font-bold mb-4 leading-tight">Tu asistente educativo inteligente</h2>
                        <p className="text-white/80 text-lg">Potencia tu aprendizaje con la ayuda de la inteligencia artificial.</p>
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
                            <h1 className="text-4xl font-bold text-slate-800 mb-3">¡Hola de nuevo!</h1>
                            <p className="text-slate-500 text-lg">Bienvenido, te hemos echado de menos.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-500 text-sm flex items-center gap-2 animate-shake">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {error}
                                </div>
                            )}

                            <div className="space-y-5">
                                <div>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Ingresa tu usuario o correo"
                                        required
                                        disabled={isLoading}
                                        autoComplete="email"
                                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-slate-800 placeholder-slate-400 focus:bg-white focus:border-[#4facfe] focus:ring-4 focus:ring-[#4facfe]/10 transition-all outline-none text-base font-medium"
                                    />
                                </div>

                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Contraseña"
                                        required
                                        disabled={isLoading}
                                        autoComplete="current-password"
                                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-slate-800 placeholder-slate-400 focus:bg-white focus:border-[#4facfe] focus:ring-4 focus:ring-[#4facfe]/10 transition-all outline-none text-base font-medium pr-12"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#4facfe] transition-colors"
                                    >
                                        {showPassword ? (
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
                            </div>

                            <div className="flex items-center justify-end">
                                <Link to="/forgot-password" className="text-sm font-medium text-slate-400 hover:text-[#4facfe] transition-colors">
                                    Recuperar contraseña
                                </Link>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-4 bg-gradient-to-r from-[#4facfe] to-[#00f2fe] text-white rounded-2xl font-bold text-lg shadow-[0_10px_20px_rgba(79,172,254,0.3)] hover:shadow-[0_15px_30px_rgba(79,172,254,0.4)] hover:-translate-y-1 active:translate-y-0 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
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
        </div>
    );
};

export default Login;
