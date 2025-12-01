import { useState, useEffect, useRef, useCallback } from 'react';

export const useAssistantWebSocket = () => {
    const [messages, setMessages] = useState([]);
    const [isConnected, setIsConnected] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [streamingText, setStreamingText] = useState('');
    const [quickReplies, setQuickReplies] = useState([]);
    const [showFeedback, setShowFeedback] = useState(false);
    const [currentConversationId, setCurrentConversationId] = useState(null);
    const [error, setError] = useState(null);

    const wsRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);
    const isMounted = useRef(true);
    const isStreamingRef = useRef(false);

    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
        };
    }, []);

    const connectWebSocket = useCallback(() => {
        const token = localStorage.getItem('jwt_token');
        if (!token) return;

        // Close existing connection if any, preventing reconnect loop
        if (wsRef.current) {
            // Remove listener to prevent triggering onclose logic for intentional close
            wsRef.current.onclose = null;
            wsRef.current.close();
        }

        // Use 127.0.0.1 to avoid localhost ambiguity
        const wsUrl = `ws://127.0.0.1:8005/ws/assistant?token=${encodeURIComponent(token)}`;
        console.log('🔌 Intentando conectar a:', wsUrl);
        const ws = new WebSocket(wsUrl);

        wsRef.current = ws;

        ws.onopen = () => {
            if (!isMounted.current) {
                console.log('🔌 Conexión abierta pero componente desmontado. Cerrando...');
                ws.close();
                return;
            }
            console.log('🤖 Conectado a Cronos Assistant');
            setIsConnected(true);
            setError(null);
        };

        ws.onmessage = (event) => {
            if (!isMounted.current) return;
            try {
                const data = JSON.parse(event.data);
                handleMessage(data);
            } catch (e) {
                console.error('Error parsing WebSocket message:', e);
            }
        };

        ws.onerror = (error) => {
            if (!isMounted.current) return;
            console.error('❌ Error WebSocket Assistant:', error);
            setIsConnected(false);
        };

        ws.onclose = (event) => {
            if (!isMounted.current) return;

            // Only log if it wasn't a clean close (1000) or if we want to debug
            console.log(`👋 Desconectado del Asistente (Code: ${event.code})`);
            setIsConnected(false);

            // Reconnect automatically after 3 seconds ONLY if not closed intentionally
            // However, since we nullify onclose for intentional closes, this should be safe.
            // But let's check if code is 1000 (Normal Closure), sometimes servers send it.
            // If server sends 1000, we might want to reconnect if it was a timeout or something?
            // Usually 1000 means "done". But for a persistent chat, maybe we do want to reconnect if it drops?
            // Let's keep reconnect logic but ensure we don't loop on client-side re-renders.

            if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);

            reconnectTimeoutRef.current = setTimeout(() => {
                if (isMounted.current) {
                    const currentToken = localStorage.getItem('jwt_token');
                    if (currentToken) connectWebSocket();
                }
            }, 3000);
        };
    }, []);

    useEffect(() => {
        connectWebSocket();
        return () => {
            // Cleanup: Close socket and prevent reconnect
            if (wsRef.current) {
                wsRef.current.onclose = null; // Important: prevent reconnect loop
                wsRef.current.close();
            }
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
        };
    }, [connectWebSocket]);

    // Show feedback after 6 messages
    useEffect(() => {
        if (messages.length >= 6 && !showFeedback && currentConversationId) {
            setShowFeedback(true);
        }
    }, [messages.length, showFeedback, currentConversationId]);

    const handleMessage = (data) => {
        switch (data.type) {
            case 'CONNECTION_READY':
                if (data.message) {
                    addMessage('assistant', data.message);
                }
                if (data.quickReplies) {
                    setQuickReplies(data.quickReplies);
                }
                break;

            case 'ASSISTANT_TYPING':
                setIsTyping(true);
                break;

            case 'ASSISTANT_STREAMING_START':
                setIsTyping(false);
                setStreamingText('');
                isStreamingRef.current = true;
                break;

            case 'ASSISTANT_CHUNK':
                setStreamingText(prev => prev + data.chunk);
                break;

            case 'ASSISTANT_STREAMING_END':
                setStreamingText(currentText => {
                    if (currentText) {
                        addMessage('assistant', currentText, data.suggestedActions);
                    }
                    return '';
                });
                isStreamingRef.current = false;
                break;

            case 'ASSISTANT_RESPONSE':
                // Only add if we weren't just streaming this same message
                if (!isStreamingRef.current) {
                    setIsTyping(false);
                    addMessage('assistant', data.response, data.suggestedActions);
                }

                setCurrentConversationId(data.conversationId);

                if (data.responseType === 'rate_limit') {
                    setError('Por favor espera un momento antes de enviar más mensajes.');
                }
                break;

            case 'FEEDBACK_RECEIVED':
                setShowFeedback(false);
                break;

            case 'ERROR':
                setError(data.message);
                setIsTyping(false);
                break;

            default:
                break;
        }
    };

    const addMessage = (role, content, actions = null) => {
        setMessages(prev => {
            // Prevent duplicate consecutive assistant messages with same content
            if (role === 'assistant' && prev.length > 0) {
                const lastMessage = prev[prev.length - 1];
                // Check if last message is from assistant and has identical content
                if (lastMessage.role === 'assistant' && lastMessage.content === content) {
                    console.log('⚠️ Duplicate message prevented:', content.substring(0, 50) + '...');
                    return prev; // Don't add duplicate
                }
            }

            return [...prev, {
                id: Date.now() + Math.random(),
                role,
                content,
                suggestedActions: actions,
                timestamp: new Date()
            }];
        });
    };

    const sendMessage = (text) => {
        if (!text.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
            return;
        }

        addMessage('user', text);

        wsRef.current.send(JSON.stringify({
            type: 'ASSISTANT_MESSAGE',
            message: text,
            assistantType: 'general',
            streaming: true
        }));

        setQuickReplies([]);
    };

    const sendFeedback = (rating, comment = '') => {
        if (!currentConversationId || !wsRef.current) return;

        wsRef.current.send(JSON.stringify({
            type: 'FEEDBACK',
            conversationId: currentConversationId,
            rating,
            comment
        }));

        setShowFeedback(false);
    };

    return {
        messages,
        isConnected,
        isTyping,
        streamingText,
        quickReplies,
        showFeedback,
        sendMessage,
        sendFeedback,
        setShowFeedback,
        error
    };
};
