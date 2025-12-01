import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await authService.forgotPassword(email);
            console.log('✅ Código enviado:', response);

            navigate('/reset-password', { state: { email } });
        } catch (err) {
            console.error('❌ Error al enviar código:', err);

            const status = err.response?.status;
            const errorData = err.response?.data;
            let errorMessage = 'Error al enviar el código';

            if (status === 400) {
                errorMessage = errorData?.error || 'No existe una cuenta con este correo electrónico.';
            } else if (status === 429) {
                errorMessage = 'Has excedido el límite de intentos.';
            } else if (errorData?.error || errorData?.message) {
                errorMessage = errorData.error || errorData.message;
            }

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

            <div className="relative flex items-center justify-center min-h-screen px-8 lg:px-16 bg-[#0a0e27]">
                {/* Logo - Absolute Position */}
                <img
                    src="/images/logos/Cronos-digital-transparente.png"
                    alt="Cronos"
                    className="absolute top-4 left-1/2 -translate-x-1/2 h-32 w-auto opacity-90 z-10 pointer-events-none"
                />

                <div className="w-full max-w-md pt-24 pb-8">
                    <div className="mb-6 text-center">
                        <h1 className="text-2xl font-bold text-white mb-2">¿Olvidaste tu contraseña?</h1>
                        <p className="text-slate-400 text-sm">
                            Ingresa tu correo y te enviaremos un código
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm text-center">
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
                                className="w-full px-6 py-4 bg-[#0B0E1E] rounded-xl text-white placeholder-slate-600 border-none shadow-[inset_0_4px_8px_rgba(0,0,0,0.6)] focus:ring-2 focus:ring-[#4facfe] transition-all outline-none text-base"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-4 bg-gradient-to-r from-[#4facfe] to-[#00f2fe] text-white rounded-xl font-bold text-base shadow-[0_8px_0_#0095c8,0_12px_20px_rgba(79,172,254,0.4)] active:shadow-[0_4px_0_#0095c8] active:translate-y-[4px] transition-all disabled:opacity-70 disabled:cursor-not-allowed hover:brightness-110"
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Enviando...
                                </span>
                            ) : (
                                'Enviar Código'
                            )}
                        </button>

                        <div className="text-center">
                            <Link to="/login" className="text-sm text-[#4facfe] hover:text-[#00f2fe] transition-colors inline-flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Volver al inicio de sesión
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
