import axios from 'axios';

const sessionApi = axios.create({
    baseURL: '/admin-api'
});

export const sessionService = {
    /**
     * Registra o actualiza la sesión del usuario
     * Debe llamarse después del login y periódicamente para mantener la sesión activa
     */
    updateSession: async () => {
        try {
            const token = localStorage.getItem('jwt_token');
            const user = JSON.parse(localStorage.getItem('user') || '{}');

            if (!token || !user.id) {
                console.warn('⚠️ No hay token o user ID para actualizar sesión');
                return false;
            }

            const response = await sessionApi.post('/user-session/update/', {
                user_id: user.id,
                token: token
            });

            console.log('✅ Sesión actualizada:', response.data);
            return true;
        } catch (error) {
            console.error('❌ Error actualizando sesión:', error);
            return false;
        }
    },

    /**
     * Cierra la sesión del usuario
     * Debe llamarse en el logout
     */
    closeSession: async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const token = localStorage.getItem('jwt_token'); // Necesitamos el token para el header si fuera necesario, aunque el endpoint actual parece no exigirlo en el body, pero es buena práctica.

            if (!user.id) {
                return false;
            }

            // Usar fetch con keepalive para asegurar que la petición se envíe al cerrar/recargar
            // Nota: keepalive no soporta headers personalizados complejos en algunos navegadores viejos, pero para POST JSON estándar está bien.
            // La URL debe ser completa o relativa a la base. Como sessionApi tiene baseURL, aquí debemos construirla manualmente o usar la misma lógica.
            // Vite proxy maneja /admin-api -> http://localhost:8000/api

            const response = await fetch('/admin-api/user-session/close/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ user_id: user.id }),
                keepalive: true
            });

            if (response.ok) {
                console.log('✅ Sesión cerrada (Beacon/Fetch)');
                return true;
            } else {
                console.error('❌ Error cerrando sesión:', response.status);
                return false;
            }
        } catch (error) {
            console.error('❌ Error cerrando sesión:', error);
            return false;
        }
    },

    /**
     * Inicia un heartbeat para mantener la sesión activa
     * Actualiza la sesión cada 30 segundos
     */
    startHeartbeat: () => {
        // Actualizar inmediatamente
        sessionService.updateSession();

        // Luego cada 30 segundos
        const intervalId = setInterval(() => {
            sessionService.updateSession();
        }, 30000); // 30 segundos

        // Retornar función para detener el heartbeat
        return () => clearInterval(intervalId);
    }
};
