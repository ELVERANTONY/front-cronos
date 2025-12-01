import { useState } from 'react';
import { authService } from '../services/authService';

import { sessionService } from '../services/sessionService';

export const useAuth = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const login = async (email, password) => {
        setIsLoading(true);
        setError(null);

        try {
            const data = await authService.login(email, password);

            // Save session
            localStorage.setItem('jwt_token', data.token);
            const user = { id: data.id, email: data.email, roles: data.roles };
            localStorage.setItem('user', JSON.stringify(user));

            return { success: true, user };

        } catch (err) {
            const message = err.response?.data?.message || 'Error al iniciar sesión';
            setError(message);

            // Specific Rate Limit handling
            if (err.response?.status === 429) {
                setError('Demasiados intentos. Por favor espera 1 minuto.');
            }

            return { success: false, error: message };
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        try {
            await sessionService.closeSession();
        } catch (error) {
            console.error('Error closing session:', error);
        } finally {
            localStorage.removeItem('jwt_token');
            localStorage.removeItem('user');
            window.location.href = '/';
        }
    };

    return { login, logout, isLoading, error };
};
