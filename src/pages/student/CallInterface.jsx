import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { studentService } from '../../services/studentService';
import { useChatWebSocket } from '../../hooks/useChatWebSocket';
import { useAudioRecorder } from '../../hooks/useAudioRecorder';
import { Mic, MicOff, PhoneOff, Volume2 } from 'lucide-react';

const CallInterface = () => {
    const { characterId } = useParams();
    const navigate = useNavigate();
    const [character, setCharacter] = useState(null);
    const [status, setStatus] = useState('connecting');
    const [volume, setVolume] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [userTranscript, setUserTranscript] = useState('');

    const audioRef = useRef(new Audio());
    const silenceTimer = useRef(null);
    const isSpeakingRef = useRef(false);
    const lastSpeechTime = useRef(Date.now());
    const animationFrameRef = useRef(null);
    const analyserRef = useRef(null);
    const audioContextRef = useRef(null);
    const playAudioRef = useRef(null);
    const voiceDetectionHistory = useRef([]);

    const token = localStorage.getItem('jwt_token');

    const handleWebSocketMessage = useCallback((data) => {
        switch (data.type) {
            case 'USER_TRANSCRIPT':
                console.log('📝 Transcript received:', data.content);
                setUserTranscript(data.content);
                break;

            case 'TTS_RESPONSE':
            case 'VOICE_RESPONSE':
                if (status === 'listening' && isSpeakingRef.current) {
                    console.log('Ignored late audio packet due to user speaking');
                    return;
                }

                if (data.audio) {
                    if (!isSpeakingRef.current) {
                        setStatus('speaking');
                        setUserTranscript('');
                        if (playAudioRef.current) {
                            playAudioRef.current(data.audio);
                        }
                    }
                }
                break;

            case 'END':
                break;

            case 'ERROR':
                console.error('Call Error:', data.content);
                setStatus('listening');
                break;

            default:
                console.log('⚠️ Mensaje no manejado en llamada:', data.type, data);
                if (data.type === 'RESPONSE') {
                    console.warn('❌ Recibida respuesta de SOLO TEXTO durante llamada. El backend falló al generar audio.', data.content);
                    // Opcional: Mostrar el texto en pantalla aunque no haya audio
                    setUserTranscript(`(Respuesta sin audio): ${data.content || data.message}`);
                    setStatus('listening'); // Volver a escuchar para no quedarse pegado
                }
                break;
        }
    }, [status]);

    const { sendMessage, isConnected } = useChatWebSocket(token, handleWebSocketMessage);
    const { isRecording, startRecording, stopRecording, stream } = useAudioRecorder();

    useEffect(() => {
        const fetchCharacter = async () => {
            try {
                const data = await studentService.getCharacterDetails(characterId);
                setCharacter(data);
            } catch (error) {
                console.error('Error fetching character:', error);
            }
        };
        if (characterId) fetchCharacter();
    }, [characterId]);

    useEffect(() => {
        if (isConnected && !isRecording && !isMuted) {
            startRecording().then(() => setStatus('listening'));
        }
        return () => {
            if (isRecording) stopRecording();
        };
    }, [isConnected, isRecording, isMuted]);

    useEffect(() => {
        if (!stream || status === 'processing') return;

        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
            analyserRef.current = audioContextRef.current.createAnalyser();
            analyserRef.current.fftSize = 256;
        }

        let source;
        try {
            source = audioContextRef.current.createMediaStreamSource(stream);
            source.connect(analyserRef.current);
            if (audioContextRef.current.state === 'suspended') {
                audioContextRef.current.resume();
            }
        } catch (err) {
            console.error("Error connecting audio stream to analyser:", err);
            return;
        }

        const checkAudioLevel = () => {
            if (status === 'processing') {
                animationFrameRef.current = requestAnimationFrame(checkAudioLevel);
                return;
            }

            if (isMuted) {
                animationFrameRef.current = requestAnimationFrame(checkAudioLevel);
                return;
            }

            const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
            analyserRef.current.getByteFrequencyData(dataArray);

            const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
            setVolume(average);

            const THRESHOLD = 50; // Very high to ignore all non-voice sounds
            const SILENCE_DURATION = 1200; // 1.2 seconds
            const VOICE_DETECTION_WINDOW = 500; // Require 500ms of sustained voice
            const VOICE_FREQ_MIN = 300;
            const VOICE_FREQ_MAX = 3400;
            const MIN_DETECTIONS_REQUIRED = 5; // Need 5 detections in window

            const sampleRate = audioContextRef.current.sampleRate;
            const binSize = sampleRate / analyserRef.current.fftSize;
            const minBin = Math.floor(VOICE_FREQ_MIN / binSize);
            const maxBin = Math.floor(VOICE_FREQ_MAX / binSize);

            let voiceEnergy = 0;
            for (let i = minBin; i <= maxBin && i < dataArray.length; i++) {
                voiceEnergy += dataArray[i];
            }
            const voiceAverage = voiceEnergy / (maxBin - minBin + 1);

            // Calculate spectral flatness to distinguish voice from percussive sounds
            // Voice has lower flatness (more tonal), percussive sounds have higher flatness
            const geometricMean = Math.exp(dataArray.reduce((sum, val) => sum + Math.log(val + 1), 0) / dataArray.length);
            const arithmeticMean = average;
            const spectralFlatness = geometricMean / (arithmeticMean + 1);

            // Voice typically has spectral flatness < 0.3, percussive sounds > 0.5
            const isTonal = spectralFlatness < 0.3;

            const hasVoiceHarmonics = voiceAverage > THRESHOLD && average > THRESHOLD * 0.9 && isTonal;

            const now = Date.now();
            if (hasVoiceHarmonics) {
                voiceDetectionHistory.current.push(now);
            }
            voiceDetectionHistory.current = voiceDetectionHistory.current.filter(
                time => now - time < VOICE_DETECTION_WINDOW
            );

            const isSustainedVoice = voiceDetectionHistory.current.length >= MIN_DETECTIONS_REQUIRED;

            if (isSustainedVoice) {
                if (!isSpeakingRef.current && userTranscript) {
                    setUserTranscript('');
                }

                if (status === 'speaking') {
                    console.log('Interruption detected! Stopping audio...');
                    if (audioRef.current) {
                        audioRef.current.pause();
                        audioRef.current.currentTime = 0;
                        audioRef.current.src = '';
                    }
                    setStatus('listening');
                    sendMessage({ type: "ASSISTANT_SPEAKING", speaking: false });
                    isSpeakingRef.current = true;
                }

                isSpeakingRef.current = true;
                lastSpeechTime.current = Date.now();
                if (silenceTimer.current) {
                    clearTimeout(silenceTimer.current);
                    silenceTimer.current = null;
                }
            } else if (isSpeakingRef.current) {
                const timeSinceSpeech = Date.now() - lastSpeechTime.current;

                if (timeSinceSpeech > SILENCE_DURATION && !silenceTimer.current) {
                    isSpeakingRef.current = false;
                    voiceDetectionHistory.current = [];
                    handleSendAudio();
                }
            }

            animationFrameRef.current = requestAnimationFrame(checkAudioLevel);
        };

        checkAudioLevel();

        return () => {
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
            if (silenceTimer.current) clearTimeout(silenceTimer.current);
            if (source) {
                source.disconnect();
            }
        };
    }, [stream, isMuted, status]);

    const handleSendAudio = async () => {
        console.log('🎤 Sending audio...');
        setStatus('processing');
        const base64Audio = await stopRecording();

        if (base64Audio) {
            sendMessage({
                type: 'AUDIO',
                audio: base64Audio,
                characterId: parseInt(characterId),
                isVoiceMode: true
            });
        }

        if (!isMuted) {
            await startRecording();
            setStatus('listening');
        }
    };

    const playAudioFromBase64 = (base64Audio) => {
        try {
            const byteCharacters = atob(base64Audio);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'audio/mpeg' });
            const audioUrl = URL.createObjectURL(blob);

            if (audioRef.current.src) URL.revokeObjectURL(audioRef.current.src);
            audioRef.current.src = audioUrl;

            audioRef.current.play();

            sendMessage({ type: "ASSISTANT_SPEAKING", speaking: true });

            audioRef.current.onended = () => {
                setStatus('listening');
                sendMessage({ type: "ASSISTANT_SPEAKING", speaking: false });
                if (!isRecording && !isMuted) startRecording();
            };
        } catch (error) {
            console.error("Error playing audio:", error);
            setStatus('listening');
        }
    };

    playAudioRef.current = playAudioFromBase64;

    const toggleMute = () => {
        const wasMuted = isMuted;
        setIsMuted(!isMuted);

        if (!wasMuted) {
            if (status === 'listening') {
                stopRecording();
                setStatus('muted');
            }
        } else {
            if (status === 'muted') {
                startRecording();
                setStatus('listening');
            }
        }
    };

    const handleHangup = () => {
        stopRecording();
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = '';
        }
        navigate(`/student/chat/${characterId}`);
    };

    return (
        <div className="flex flex-col h-full bg-[#1e2330] relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[120px] transition-all duration-1000 ${status === 'speaking' ? 'bg-blue-600/20' : status === 'listening' ? 'bg-green-500/10' : 'bg-transparent'}`}></div>
            </div>

            <div className="absolute top-0 left-0 right-0 p-8 flex justify-between items-start z-20">
                <button onClick={handleHangup} className="p-3 bg-white/5 hover:bg-white/10 rounded-full text-white backdrop-blur-md transition-colors border border-white/5">
                    <PhoneOff size={24} />
                </button>

                <div className="flex flex-col items-center gap-2">
                    <div className="px-4 py-1.5 bg-black/20 rounded-full backdrop-blur-md border border-white/5">
                        <span className="text-xs font-bold tracking-wider uppercase text-white/90 flex items-center gap-2">
                            {status === 'connecting' && <><span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span> Conectando</>}
                            {status === 'listening' && <><span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Escuchando</>}
                            {status === 'processing' && <><span className="w-2 h-2 bg-blue-500 rounded-full animate-spin"></span> Procesando</>}
                            {status === 'speaking' && <><Volume2 size={12} className="animate-pulse text-blue-400" /> Hablando</>}
                            {status === 'muted' && <><MicOff size={12} className="text-red-400" /> Silenciado</>}
                        </span>
                    </div>
                </div>

                <div className="w-12"></div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center relative z-10 pt-8 pb-40">
                {(status === 'speaking' || (status === 'listening' && volume > 10)) && (
                    <>
                        <div className={`absolute w-64 h-64 rounded-full ${status === 'speaking' ? 'bg-blue-500/20' : 'bg-green-500/20'} animate-ping opacity-50 duration-[2s]`}></div>
                        <div className={`absolute w-80 h-80 rounded-full ${status === 'speaking' ? 'bg-blue-500/10' : 'bg-green-500/10'} animate-pulse duration-[3s]`}></div>
                    </>
                )}

                <div className="relative group">
                    <div className={`w-56 h-56 rounded-full p-1.5 border-4 ${status === 'speaking' ? 'border-blue-500 shadow-[0_0_50px_rgba(59,130,246,0.6)]' : status === 'listening' && volume > 10 ? 'border-green-500 shadow-[0_0_50px_rgba(34,197,94,0.6)]' : 'border-white/10'} transition-all duration-300 bg-[#151922]`}>
                        <img
                            src={character?.imagenUrl || character?.avatarUrl || '/images/avatars/default.png'}
                            alt={character?.name}
                            className="w-full h-full rounded-full object-cover"
                        />
                    </div>
                </div>

                <div className="mt-8 text-center space-y-3 px-8 w-full max-w-2xl">
                    <h2 className="text-4xl font-bold text-white tracking-tight">{character?.name}</h2>
                    <p className="text-slate-400 font-medium text-lg">{character?.categoryName}</p>

                    <div className="min-h-24 flex flex-col items-center justify-center mt-6 gap-2">
                        {status === 'processing' && (
                            <p className="text-blue-400 animate-pulse font-semibold text-lg uppercase tracking-wide">Pensando...</p>
                        )}

                        {userTranscript && (
                            <p className="text-white/90 text-2xl font-medium italic mt-1">"{userTranscript}"</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="absolute bottom-8 left-0 right-0 flex flex-col items-center gap-4 z-20">
                {(status === 'listening' || status === 'muted') && (
                    <div className="flex flex-col items-center gap-1">
                        <p className="text-xs text-white/30 uppercase tracking-wider font-semibold">Nivel de Audio</p>
                        <div className="h-1.5 w-56 bg-white/10 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-green-500 transition-all duration-75"
                                style={{ width: `${Math.min(volume * 2, 100)}%` }}
                            ></div>
                        </div>
                    </div>
                )}

                <div className="flex justify-center items-center gap-8">
                    <button
                        onClick={toggleMute}
                        className={`p-6 rounded-full transition-all transform hover:scale-105 shadow-xl ${isMuted ? 'bg-white text-slate-900 hover:bg-slate-200' : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'}`}
                    >
                        {isMuted ? <MicOff size={32} /> : <Mic size={32} />}
                    </button>

                    <button
                        onClick={handleHangup}
                        className="p-8 bg-red-600 hover:bg-red-500 text-white rounded-full shadow-[0_10px_30px_rgba(220,38,38,0.4)] transition-all transform hover:scale-105 border border-red-400/20"
                    >
                        <PhoneOff size={40} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CallInterface;
