import { useEffect, useState } from 'react';
import { adminService } from '../services/adminService';

export const useTopCharacters = () => {
    const [topCharacters, setTopCharacters] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        loadInitialData();

        const token = localStorage.getItem('jwt_token');
        if (!token) return;

        // Conexión SSE para actualizaciones en tiempo real
        const url = `/admin-api/characters/top_interactions_stream/?token=${token}`;
        console.log('🔗 Connecting to Top Characters SSE:', url);

        const eventSource = new EventSource(url);

        eventSource.onopen = () => {
            setIsConnected(true);
            console.log('✅ Top Characters SSE connection established');
        };

        eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.top_characters) {
                    setTopCharacters(data.top_characters);
                }
            } catch (error) {
                console.error('Error parsing Top Characters SSE data:', error);
            }
        };

        eventSource.onerror = (error) => {
            if (eventSource.readyState !== EventSource.CLOSED) {
                console.error('Top Characters SSE error:', error);
            }
            setIsConnected(false);
            eventSource.close();
        };

        return () => {
            eventSource.close();
            setIsConnected(false);
        };
    }, []);

    const loadInitialData = async () => {
        try {
            setIsLoading(true);
            const data = await adminService.getTopCharacters();
            if (data) {
                setTopCharacters(data);
            }
        } catch (error) {
            console.error('❌ Error loading initial top characters:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return { topCharacters, isLoading, isConnected };
};
