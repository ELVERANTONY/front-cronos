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
                        <h2 className="text-3xl font-bold mb-4 leading-tight">Recupera tu acceso</h2>
                        <p className="text-white/80 text-lg">Estamos aquí para ayudarte a volver a tu aprendizaje.</p>
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
                            <h1 className="text-3xl font-bold text-slate-800 mb-3">¿Olvidaste tu contraseña?</h1>
                            <p className="text-slate-500 text-lg">No te preocupes, ingresa tu correo y te enviaremos un código.</p>
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

                            <div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Ingresa tu correo electrónico"
                                    required
                                    disabled={isLoading}
                                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-slate-800 placeholder-slate-400 focus:bg-white focus:border-[#4facfe] focus:ring-4 focus:ring-[#4facfe]/10 transition-all outline-none text-base font-medium"
                                />
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
                                        Enviando...
                                    </span>
                                ) : (
                                    'Enviar Código'
                                )}
                            </button>

                            <div className="text-center pt-4">
                                <Link to="/login" className="text-sm font-medium text-slate-400 hover:text-[#4facfe] transition-colors inline-flex items-center gap-2 group">
                                    <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                    </svg>
                                    Volver al inicio de sesión
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
