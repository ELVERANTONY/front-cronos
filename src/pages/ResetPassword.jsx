import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';

const ResetPassword = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const email = location.state?.email;

    const [formData, setFormData] = useState({
        code: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [resendCountdown, setResendCountdown] = useState(25);
    const [canResend, setCanResend] = useState(false);

    useEffect(() => {
        // Si no hay email, redirigir a forgot-password
        if (!email) {
            navigate('/forgot-password');
        }
    }, [email, navigate]);

    // Countdown para reenviar código
    useEffect(() => {
        if (resendCountdown > 0) {
            const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            setCanResend(true);
        }
    }, [resendCountdown]);

    const handleChange = (field) => (e) => {
        setFormData(prev => ({ ...prev, [field]: e.target.value }));
        setError('');
    };

    const handleResendCode = async () => {
        if (!canResend) return;

        try {
            await authService.forgotPassword(email);
            setResendCountdown(25);
            setCanResend(false);
            alert('Código reenviado a tu correo electrónico');
        } catch (err) {
            console.error('Error al reenviar código:', err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validaciones
        if (formData.code.length !== 6) {
            setError('El código debe tener 6 dígitos');
            return;
        }

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
            // Llamar al API real - AQUÍ SE VALIDA EL CÓDIGO
            const response = await authService.resetPassword(email, formData.code, formData.newPassword);
            console.log('✅ Contraseña restablecida:', response);

            setSuccess(true);
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            console.error('❌ Error al restablecer contraseña:', err);

            // Manejar errores específicos del backend
            const errorMessage = err.response?.data?.error || err.response?.data?.message;
            setError(errorMessage || 'Error al restablecer la contraseña');
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-[#0a0e27] overflow-hidden">
                <div className="relative hidden lg:block h-full w-full">
                    <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover">
                        <source src="/videos/login-hero.mp4" type="video/mp4" />
                    </video>
                    <div className="absolute inset-0 bg-black/20"></div>
                </div>

                <div className="flex flex-col justify-center items-center h-full w-full px-8 lg:px-16 bg-[#0a0e27]">
                    <div className="w-full max-w-md text-center">
                        <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(16,185,129,0.3)]">
                            <svg className="w-12 h-12 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-3">¡Contraseña Actualizada!</h2>
                        <p className="text-slate-400 text-lg mb-6">
                            Tu contraseña ha sido restablecida exitosamente
                        </p>
                        <p className="text-sm text-slate-500">
                            Serás redirigido al inicio de sesión en unos segundos...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

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
                        <h2 className="text-3xl font-bold mb-4 leading-tight">Recuperación segura</h2>
                        <p className="text-white/80 text-lg">Restablece tu contraseña y vuelve a disfrutar de Cronos.</p>
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
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-slate-800 mb-3">Recuperar Contraseña</h1>
                            <p className="text-slate-500 text-lg">Ingresa el código que recibiste y tu nueva contraseña.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Email Info */}
                            <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-start gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-xs text-blue-500 font-bold uppercase tracking-wider mb-0.5">Código enviado a</p>
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

                            {/* Código de Verificación */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Código de Verificación
                                </label>
                                <input
                                    type="text"
                                    value={formData.code}
                                    onChange={handleChange('code')}
                                    placeholder="Ej: 123456"
                                    maxLength={6}
                                    required
                                    disabled={isLoading}
                                    autoComplete="off"
                                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-slate-800 placeholder-slate-400 focus:bg-white focus:border-[#4facfe] focus:ring-4 focus:ring-[#4facfe]/10 transition-all outline-none text-xl text-center tracking-[0.5em] font-mono font-bold"
                                />
                                <div className="flex items-center justify-between mt-2 px-1">
                                    <p className="text-xs text-slate-400">El código expira en 15 minutos</p>
                                    <button
                                        type="button"
                                        onClick={handleResendCode}
                                        disabled={!canResend}
                                        className="text-xs font-medium text-[#4facfe] hover:text-[#00f2fe] disabled:text-slate-400 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
                                    >
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                        {canResend ? 'Reenviar código' : `Reenviar en ${resendCountdown}s`}
                                    </button>
                                </div>
                            </div>

                            {/* Nueva Contraseña */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Nueva Contraseña
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={formData.newPassword}
                                        onChange={handleChange('newPassword')}
                                        placeholder="Mínimo 8 caracteres"
                                        required
                                        disabled={isLoading}
                                        autoComplete="new-password"
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

                            {/* Confirmar Contraseña */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
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
                                        Restableciendo...
                                    </span>
                                ) : (
                                    'Restablecer Contraseña'
                                )}
                            </button>

                            <div className="text-center pt-4">
                                <Link
                                    to="/forgot-password"
                                    className="text-sm font-medium text-slate-400 hover:text-[#4facfe] transition-colors inline-flex items-center gap-2 group"
                                >
                                    <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                    </svg>
                                    Volver
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
