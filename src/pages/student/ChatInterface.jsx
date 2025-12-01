import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { studentService } from '../../services/studentService';
import { useChatWebSocket } from '../../hooks/useChatWebSocket';
import { ArrowLeft, Send, MoreVertical, Volume2, Phone } from 'lucide-react';

const ChatInterface = ({ characterId: propCharacterId, onBack, className }) => {
    const { characterId: paramCharacterId } = useParams();
    const characterId = propCharacterId || paramCharacterId;
    const navigate = useNavigate();
    const [character, setCharacter] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isAssistantSpeaking, setIsAssistantSpeaking] = useState(false);
    const messagesEndRef = useRef(null);
    const audioRef = useRef(new Audio());

    const token = localStorage.getItem('jwt_token');

    // WebSocket Handler
    const [streamingContent, setStreamingContent] = useState('');
    const [isStreaming, setIsStreaming] = useState(false);

    // Auto-scroll logic
    const messagesContainerRef = useRef(null);
    const [showScrollButton, setShowScrollButton] = useState(false);

    const scrollToBottom = () => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    };

    // Scroll on new messages
    useEffect(() => {
        scrollToBottom();
    }, [messages, streamingContent, isStreaming]);

    // Handle scroll visibility
    const handleScroll = () => {
        if (messagesContainerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
            const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
            setShowScrollButton(!isNearBottom);
        }
    };

    // Fetch Character Details & History
    useEffect(() => {
        console.log('ChatInterface mounted/updated. characterId:', characterId);

        const initChat = async () => {
            console.log('initChat started for:', characterId);
            try {
                const [charData, history] = await Promise.all([
                    studentService.getCharacterDetails(characterId),
                    studentService.getCharacterMessages(characterId)
                ]);
                console.log('initChat data received:', { charData, history });
                setCharacter(charData);
                // Map history to UI format
                setMessages(history.map(msg => ({
                    id: msg.id,
                    text: msg.content,
                    sender: msg.senderType,
                    timestamp: msg.createdAt
                })));
            } catch (error) {
                console.error('Error initializing chat:', error);
            } finally {
                console.log('initChat finished, setting isLoading(false)');
                setIsLoading(false);
            }
        };

        if (characterId) {
            initChat();
        } else {
            console.warn('No characterId found');
            setIsLoading(false);
        }
    }, [characterId]);

    const handleWebSocketMessage = useCallback((data) => {
        switch (data.type) {
            case 'START':
                setIsStreaming(true);
                setStreamingContent('');
                break;

            case 'CHUNK':
                setStreamingContent(prev => prev + (data.content || ''));
                break;

            case 'END':
                setIsStreaming(false);
                setMessages(prev => [...prev, {
                    id: Date.now(),
                    text: streamingContent || data.content,
                    sender: 'CHARACTER',
                    timestamp: new Date().toISOString()
                }]);
                setStreamingContent('');
                break;

            case 'ERROR':
                console.error('Chat Error:', data.content);
                break;

            default:
                if (data.type === 'RESPONSE') {
                    setMessages(prev => [...prev, {
                        id: Date.now(),
                        text: data.content || data.message,
                        sender: 'CHARACTER',
                        timestamp: new Date().toISOString()
                    }]);
                }
        }
    }, [streamingContent]);

    const { sendMessage, isConnected } = useChatWebSocket(token, handleWebSocketMessage);

    const handleSendText = (e) => {
        e.preventDefault();
        if (!inputText.trim() || !isConnected) return;

        // Add user message immediately for optimistic UI
        const newMessage = {
            id: Date.now(),
            text: inputText,
            sender: 'USER',
            timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, newMessage]);

        // Send to WS
        sendMessage({
            type: 'MESSAGE',
            message: inputText,
            characterId: parseInt(characterId),
            isVoiceMode: false
        });

        setInputText('');
    };

    const handleCall = () => {
        navigate(`/student/call/${characterId}`);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full bg-[#1e2330] text-white rounded-[2.5rem]">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className={`bg-[#1e2330] rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden flex flex-col relative h-full ${className}`}>
            {/* Ambient Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[120px]"></div>
            </div>

            {/* Header - Fixed at top */}
            <div className="flex-none bg-[#1e2330]/95 backdrop-blur-md p-4 border-b border-white/5 flex items-center justify-between z-20 shadow-sm h-20">
                <div className="flex items-center gap-4">
                    {onBack && (
                        <button onClick={onBack} className="p-2 hover:bg-white/5 rounded-full text-slate-400 hover:text-white transition-colors lg:hidden">
                            <ArrowLeft size={24} />
                        </button>
                    )}
                    {!onBack && (
                        <button onClick={() => navigate('/student/explore')} className="p-2 hover:bg-white/5 rounded-full text-slate-400 hover:text-white transition-colors">
                            <ArrowLeft size={24} />
                        </button>
                    )}
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <img
                                src={character?.imagenUrl || character?.avatarUrl || '/images/avatars/default.png'}
                                alt={character?.name}
                                className="w-10 h-10 rounded-full object-cover"
                            />
                            <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#1e2330] ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        </div>
                        <div>
                            <h2 className="font-bold text-white">{character?.name}</h2>
                            <p className="text-xs text-slate-400">{character?.categoryName}</p>
                        </div>
                    </div>
                </div>

                {/* Call Button */}
                <button
                    onClick={() => navigate(`/student/call/${characterId}`)}
                    className="p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-lg shadow-blue-600/20 transition-all"
                >
                    <Phone size={20} />
                </button>
            </div>

            {/* Messages Area - Fills remaining space */}
            <div
                ref={messagesContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent relative z-10"
            >
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`flex gap-4 ${msg.sender === 'USER' ? 'justify-end' : 'justify-start'}`}
                    >
                        {/* Character Avatar (Only for Character messages) */}
                        {msg.sender !== 'USER' && (
                            <div className="flex-none flex flex-col justify-end">
                                <img
                                    src={character?.imagenUrl || character?.avatarUrl || '/images/avatars/default.png'}
                                    alt={character?.name}
                                    className="w-8 h-8 rounded-full object-cover mb-1"
                                />
                            </div>
                        )}

                        <div className={`flex flex-col ${msg.sender === 'USER' ? 'items-end' : 'items-start'} max-w-[80%]`}>
                            {/* Character Name */}
                            {msg.sender !== 'USER' && (
                                <span className="text-xs text-slate-400 mb-1 ml-1">{character?.name}</span>
                            )}

                            {/* Message Bubble */}
                            <div
                                className={`
                                    p-4 rounded-2xl shadow-sm
                                    ${msg.sender === 'USER'
                                        ? 'bg-gradient-to-r from-[#4facfe] to-[#00f2fe] text-white rounded-tr-none'
                                        : 'bg-[#252a3a] text-slate-200 rounded-tl-none border border-white/5'
                                    }
                                `}
                            >
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                            </div>

                            {/* Timestamp */}
                            <span className={`text-[10px] mt-1 opacity-60 ${msg.sender === 'USER' ? 'text-blue-100' : 'text-slate-400'}`}>
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>
                ))}

                {/* Streaming Message */}
                {isStreaming && streamingContent && (
                    <div className="flex justify-start">
                        <div className="max-w-[80%] p-4 rounded-2xl rounded-tl-none bg-[#252a3a] text-slate-200 border border-white/5 shadow-sm">
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{streamingContent}</p>
                            <span className="text-[10px] mt-1 block text-slate-400 opacity-60">Escribiendo...</span>
                        </div>
                    </div>
                )}

                {/* Status Indicators */}
                {(isStreaming || isAssistantSpeaking) && !streamingContent && (
                    <div className="flex justify-start">
                        <div className="bg-[#252a3a] px-4 py-2 rounded-full flex items-center gap-2">
                            <div className="flex gap-1">
                                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></span>
                                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce delay-75"></span>
                                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce delay-150"></span>
                            </div>
                            <span className="text-xs text-slate-400">
                                {isAssistantSpeaking ? 'Hablando...' : 'Escribiendo...'}
                            </span>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />

                {/* Scroll to Bottom Button - Positioned relative to container */}
                {showScrollButton && (
                    <button
                        onClick={scrollToBottom}
                        className="sticky bottom-4 left-full mr-4 p-3 bg-[#1e2330] border border-white/10 text-white rounded-full shadow-xl hover:bg-[#252a3a] transition-all z-30 animate-in fade-in slide-in-from-bottom-4"
                    >
                        <ArrowLeft size={20} className="-rotate-90" />
                    </button>
                )}
            </div>

            {/* Input Area - Fixed at bottom */}
            <div className="flex-none p-4 bg-[#1a1f2b] border-t border-white/5 z-20">
                <form onSubmit={handleSendText} className="flex items-end gap-3 max-w-4xl mx-auto relative">
                    <div className="flex-1 bg-[#1e2330] rounded-2xl border border-white/5 focus-within:border-blue-500/50 focus-within:ring-1 focus-within:ring-blue-500/50 transition-all flex items-center shadow-inner">
                        <input
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="Escribe un mensaje..."
                            className="w-full bg-transparent border-none text-white placeholder-slate-500 focus:ring-0 px-4 py-3 text-sm"
                            disabled={isStreaming || isAssistantSpeaking}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={!inputText.trim() || isStreaming || isAssistantSpeaking}
                        className="p-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 text-white rounded-xl transition-all shadow-lg shadow-blue-600/20"
                    >
                        <Send size={20} />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatInterface;
