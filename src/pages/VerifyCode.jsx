import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';

const VerifyCode = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const email = location.state?.email;

    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState('');
    const [resendLoading, setResendLoading] = useState(false);
    const inputRefs = useRef([]);

    useEffect(() => {
        // Si no hay email, redirigir a forgot-password
        if (!email) {
            navigate('/forgot-password');
        }
    }, [email, navigate]);

    const handleChange = (index, value) => {
        if (value.length > 1) value = value[0];
        if (!/^\d*$/.test(value)) return;

        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6);
        if (!/^\d+$/.test(pastedData)) return;

        const newCode = pastedData.split('');
        while (newCode.length < 6) newCode.push('');
        setCode(newCode);

        // Focus last filled input
        const lastIndex = Math.min(pastedData.length, 5);
        inputRefs.current[lastIndex]?.focus();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const fullCode = code.join('');

        if (fullCode.length !== 6) {
            setError('Por favor ingresa el código completo');
            return;
        }

        setError('');

        // NO validamos con el backend aquí
        // La validación se hará en ResetPassword con /api/auth/reset-password
        // que valida el código + resetea la contraseña en una sola llamada
        navigate('/reset-password', { state: { email, code: fullCode } });
    };

    const handleResendCode = async () => {
        setError('');
        setResendLoading(true);

        try {
            await authService.forgotPassword(email);
            setCode(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
            alert('Código reenviado a tu correo electrónico');
        } catch (err) {
            const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Error al reenviar el código';
            setError(errorMessage);
        } finally {
            setResendLoading(false);
        }
    };

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
            <div className="flex flex-col justify-center items-center h-full w-full px-8 lg:px-16 bg-[#0a0e27] overflow-y-auto">
                <div className="w-full max-w-xl py-8">
                    {/* Logo */}
                    <div className="mb-8 flex flex-col items-center text-center">
                        <img
                            src="/images/logos/Cronos-digital-transparente.png"
                            alt="Cronos"
                            className="h-48 w-auto mb-4"
                        />
                        <h1 className="text-3xl font-bold text-white mb-2">Verifica tu código</h1>
                        <p className="text-slate-400 text-base">
                            Hemos enviado un código de 6 dígitos a<br />
                            <span className="text-[#4facfe] font-semibold">{email}</span>
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-sm text-center">
                                {error}
                            </div>
                        )}

                        {/* Code Input */}
                        <div>
                            <label className="block text-sm font-bold text-slate-300 mb-4 text-center">
                                Código de verificación
                            </label>
                            <div className="flex gap-3 justify-center" onPaste={handlePaste}>
                                {code.map((digit, index) => (
                                    <input
                                        key={index}
                                        ref={(el) => (inputRefs.current[index] = el)}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleChange(index, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(index, e)}
                                        className="w-14 h-16 text-center text-2xl font-bold bg-[#0B0E1E] rounded-2xl text-white border-none shadow-[inset_0_4px_8px_rgba(0,0,0,0.6)] focus:ring-2 focus:ring-[#4facfe] transition-all outline-none"
                                    />
                                ))}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={code.join('').length !== 6}
                            className="w-full py-4 bg-gradient-to-r from-[#4facfe] to-[#00f2fe] text-white rounded-2xl font-bold text-lg shadow-[0_8px_0_#0095c8,0_12px_20px_rgba(79,172,254,0.4)] active:shadow-[0_4px_0_#0095c8] active:translate-y-[4px] transition-all disabled:opacity-70 disabled:cursor-not-allowed hover:brightness-110"
                        >
                            Continuar
                        </button>

                        <div className="text-center space-y-3">
                            <button
                                type="button"
                                onClick={handleResendCode}
                                disabled={resendLoading}
                                className="text-sm text-slate-400 hover:text-[#4facfe] transition-colors disabled:opacity-50"
                            >
                                ¿No recibiste el código? <span className="text-[#4facfe] font-semibold">Reenviar</span>
                            </button>

                            <div>
                                <Link
                                    to="/forgot-password"
                                    className="text-sm text-[#4facfe] hover:text-[#00f2fe] transition-colors inline-flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                    </svg>
                                    Cambiar correo electrónico
                                </Link>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default VerifyCode;
