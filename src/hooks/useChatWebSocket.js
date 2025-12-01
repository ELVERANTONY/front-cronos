import { useEffect, useRef, useState, useCallback } from 'react';

export const useChatWebSocket = (token, onMessageReceived) => {
    const ws = useRef(null);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState(null);

    const onMessageReceivedRef = useRef(onMessageReceived);

    useEffect(() => {
        onMessageReceivedRef.current = onMessageReceived;
    }, [onMessageReceived]);

    const connect = useCallback(() => {
        if (!token) return;

        // Ensure we use the correct WebSocket URL port (8081 for user service)
        const wsUrl = 'ws://localhost:8005/ws/chat';
        const encodedToken = encodeURIComponent(token);
        const socket = new WebSocket(`${wsUrl}?token=${encodedToken}`);

        socket.onopen = () => {
            console.log('✅ WS Conectado');
            setIsConnected(true);
            setError(null);
        };

        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);

                // Handle Connection Ready message
                if (data.type === 'CONNECTION_READY') {
                    console.log('🔌 Conexión lista:', data);
                    return;
                }

                // Debug Audio Responses (Requested by Backend)
                if (data.type === 'VOICE_RESPONSE' || data.type === 'TTS_RESPONSE') {
                    console.log("🎤 Audio recibido del backend:", data.provider || 'Unknown', "Bytes:", data.audio ? data.audio.length : 0);
                }

                if (onMessageReceivedRef.current) {
                    onMessageReceivedRef.current(data);
                }
            } catch (e) {
                console.error('Error parseando mensaje WS:', e);
            }
        };

        socket.onerror = (e) => {
            console.error('❌ WS Error:', e);
            setError('Error de conexión con el chat');
        };

        socket.onclose = (event) => {
            console.log('🔌 WS Cerrado', event.code, event.reason);
            setIsConnected(false);
        };

        ws.current = socket;
    }, [token]);

    useEffect(() => {
        connect();
        return () => {
            if (ws.current) {
                ws.current.close();
            }
        };
    }, [connect]);

    const sendMessage = (payload) => {
        if (ws.current?.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify(payload));
        } else {
            console.warn('WS no está conectado. No se pudo enviar mensaje.');
            setError('No hay conexión con el chat');
        }
    };

    return { sendMessage, isConnected, error };
};
