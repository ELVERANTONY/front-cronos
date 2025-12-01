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
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-[#0a0e27] overflow-hidden">
            {/* Left Side - Video */}
            <div className="relative hidden lg:block h-full w-full">
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                >
                    <source src="/videos/login-hero.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-black/20"></div>
            </div>

            {/* Right Side - Form */}
            <div className="relative flex items-center justify-center min-h-screen px-8 lg:px-16 bg-[#0a0e27] overflow-y-auto">
                {/* Logo - Absolute Position */}
                <img
                    src="/images/logos/Cronos-digital-transparente.png"
                    alt="Cronos"
                    className="absolute top-4 left-1/2 -translate-x-1/2 h-32 w-auto opacity-90 z-10 pointer-events-none"
                />

                <div className="w-full max-w-lg pt-24 pb-8">
                    {/* Header */}
                    <div className="mb-5 text-center">
                        <h1 className="text-2xl font-bold text-white mb-2">Recuperar Contraseña</h1>
                        <p className="text-slate-400 text-sm">
                            Ingresa el código que recibiste y tu nueva contraseña
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email Info */}
                        <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl flex items-start gap-2">
                            <svg className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <div className="flex-1">
                                <p className="text-xs text-blue-300 font-medium">Código enviado a</p>
                                <p className="text-sm text-white font-semibold">{email}</p>
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs text-center">
                                {error}
                            </div>
                        )}

                        {/* Código de Verificación */}
                        <div>
                            <label className="block text-xs font-bold text-slate-300 mb-2">
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
                                className="w-full px-4 py-3 bg-[#0B0E1E] rounded-xl text-white placeholder-slate-600 border-none shadow-[inset_0_4px_8px_rgba(0,0,0,0.6)] focus:ring-2 focus:ring-[#4facfe] transition-all outline-none text-base text-center tracking-widest font-mono"
                            />
                            <div className="flex items-center justify-between mt-1.5">
                                <p className="text-[10px] text-slate-500">El código expira en 15 minutos</p>
                                <button
                                    type="button"
                                    onClick={handleResendCode}
                                    disabled={!canResend}
                                    className="text-[10px] text-[#4facfe] hover:text-[#00f2fe] disabled:text-slate-600 disabled:cursor-not-allowed flex items-center gap-1"
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
                            <label className="block text-xs font-bold text-slate-300 mb-2">
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
                                    className="w-full px-4 py-3 bg-[#0B0E1E] rounded-xl text-white placeholder-slate-600 border-none shadow-[inset_0_4px_8px_rgba(0,0,0,0.6)] focus:ring-2 focus:ring-[#4facfe] transition-all outline-none text-sm pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
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
                            {formData.newPassword && formData.newPassword.length < 8 && (
                                <div className="mt-2 space-y-1">
                                    <p className="text-xs text-orange-400 font-medium">Requisitos faltantes:</p>
                                    <ul className="text-xs text-orange-400 list-disc list-inside">
                                        <li>Al menos una mayúscula</li>
                                    </ul>
                                </div>
                            )}
                        </div>

                        {/* Confirmar Contraseña */}
                        <div>
                            <label className="block text-xs font-bold text-slate-300 mb-2">
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
                                    className="w-full px-4 py-3 bg-[#0B0E1E] rounded-xl text-white placeholder-slate-600 border-none shadow-[inset_0_4px_8px_rgba(0,0,0,0.6)] focus:ring-2 focus:ring-[#4facfe] transition-all outline-none text-sm pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                                >
                                    {showConfirmPassword ? (
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

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 bg-gradient-to-r from-[#4facfe] to-[#00f2fe] text-white rounded-xl font-bold text-sm shadow-[0_6px_0_#0095c8,0_10px_20px_rgba(79,172,254,0.4)] active:shadow-[0_3px_0_#0095c8] active:translate-y-[3px] transition-all disabled:opacity-70 disabled:cursor-not-allowed hover:brightness-110"
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Actualizando...
                                </span>
                            ) : (
                                'Restablecer Contraseña'
                            )}
                        </button>

                        <div className="text-center">
                            <Link
                                to="/forgot-password"
                                className="text-sm text-[#4facfe] hover:text-[#00f2fe] transition-colors inline-flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Volver
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
