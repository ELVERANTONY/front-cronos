import { useEffect, useState } from 'react';

export const useActiveStudents = () => {
    const [activeStudents, setActiveStudents] = useState([]);
    const [count, setCount] = useState(0);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('jwt_token');
        console.log('🔍 useActiveStudents token check:', token ? 'Token exists' : 'No token');
        if (!token) return;

        // Use correct Django endpoint path
        const url = `/admin-api/dashboard/active_students_stream/?token=${token}`;
        console.log('🔗 Connecting to SSE:', url);

        const eventSource = new EventSource(url);

        eventSource.onopen = () => {
            setIsConnected(true);
            console.log('✅ SSE connection established');
        };

        eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                setActiveStudents(data.students || []);
                setCount(data.active_students || 0);
            } catch (error) {
                console.error('Error parsing SSE data:', error);
            }
        };

        eventSource.onerror = (error) => {
            // Don't log error on simple connection close or reload
            if (eventSource.readyState !== EventSource.CLOSED) {
                console.error('SSE error:', error);
            }
            setIsConnected(false);
            eventSource.close();
        };

        return () => {
            eventSource.close();
            setIsConnected(false);
        };
    }, []);

    return { activeStudents, count, isConnected };
};
