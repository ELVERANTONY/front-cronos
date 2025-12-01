import { useEffect } from 'react';
import { sessionService } from '../services/sessionService';

/**
 * Hook para mantener la sesión del usuario activa
 * Envía un heartbeat cada 30 segundos a Django
 */
export const useSessionHeartbeat = () => {
    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const token = localStorage.getItem('jwt_token');

        if (!user.id || !token) {
            return;
        }

        const stopHeartbeat = sessionService.startHeartbeat();

        // Manejar cierre de pestaña/navegador
        const handleBeforeUnload = () => {
            sessionService.closeSession();
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        // Cleanup: detener heartbeat cuando el componente se desmonta
        return () => {
            stopHeartbeat();
            window.removeEventListener('beforeunload', handleBeforeUnload);
            // Opcional: llamar a closeSession aquí también si queremos cerrar al desmontar (navegar fuera)
            // sessionService.closeSession(); 
        };
    }, []);
};
