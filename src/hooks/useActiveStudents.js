import { useEffect, useState } from 'react';

export const useActiveStudents = () => {
    const [activeStudents, setActiveStudents] = useState([]);
    const [count, setCount] = useState(0);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('jwt_token');
        if (!token) return;

        const baseURL = import.meta.env.VITE_ADMIN_API_URL || 'http://localhost:8000/api';
        // Append token as query param since EventSource doesn't support headers
        const url = `${baseURL}/students/active-stream/?token=${token}`;

        const eventSource = new EventSource(url);

        eventSource.onopen = () => {
            setIsConnected(true);
            console.log('SSE connection established');
        };

        eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                setActiveStudents(data.students || []);
                setCount(data.active_count || 0);
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
