import React, { createContext, useContext, useState, useCallback } from 'react';
import { adminService } from '../services/adminService';

const CharacterCreationContext = createContext();

export const CharacterCreationProvider = ({ children }) => {
    const [isCreating, setIsCreating] = useState(false);
    const [progress, setProgress] = useState(0);
    const [statusMessage, setStatusMessage] = useState('');
    const [characterName, setCharacterName] = useState('');
    const [pollInterval, setPollInterval] = useState(null);
    const [isSuccess, setIsSuccess] = useState(false);

    const createCharacter = useCallback(async (name, categoryId, onSuccess, onError) => {
        setIsCreating(true);
        setIsSuccess(false);
        setProgress(0);
        setCharacterName(name);
        setStatusMessage('Iniciando creación con IA...');

        try {
            // Step 1: Start async job
            const { job_id } = await adminService.createCharacterAsync(name, categoryId);

            // Step 2: Poll for status
            const interval = setInterval(async () => {
                try {
                    const response = await adminService.getJobStatus(job_id);
                    console.log('📊 Job status response:', response);

                    const status = response.data;
                    setProgress(status.progress || 0);
                    setStatusMessage(status.message || 'Procesando...');

                    if (status.status === 'completed') {
                        clearInterval(interval);
                        setIsCreating(false);
                        setIsSuccess(true);
                        setProgress(100);
                        setStatusMessage('¡Personaje creado exitosamente!');

                        // Hide success message after 5 seconds
                        setTimeout(() => {
                            setIsSuccess(false);
                            setStatusMessage('');
                        }, 5000);

                        // Success callback - handle different response structures
                        if (onSuccess) {
                            const characterId = status.data?.character_id || status.character_id;
                            onSuccess(characterId);
                        }
                    } else if (status.status === 'failed') {
                        clearInterval(interval);
                        setIsCreating(false);
                        setStatusMessage('Error al crear personaje');

                        if (onError) {
                            onError(status.error || 'Error desconocido');
                        }
                    }
                } catch (err) {
                    console.error('Error polling job status:', err);
                    clearInterval(interval);
                    setIsCreating(false);
                    if (onError) {
                        onError(err.message || 'Error al verificar estado del job');
                    }
                }
            }, 2500); // Poll every 2.5 seconds

            setPollInterval(interval);
        } catch (error) {
            setIsCreating(false);
            setStatusMessage('Error al iniciar creación');
            if (onError) {
                // Pass the full error object so we can access error.response.data
                onError(error);
            }
        }
    }, []);

    const cancelCreation = useCallback(() => {
        if (pollInterval) {
            clearInterval(pollInterval);
            setPollInterval(null);
        }
        setIsCreating(false);
        setIsSuccess(false);
        setProgress(0);
        setStatusMessage('');
    }, [pollInterval]);

    return (
        <CharacterCreationContext.Provider
            value={{
                isCreating,
                isSuccess,
                progress,
                statusMessage,
                characterName,
                createCharacter,
                cancelCreation
            }}
        >
            {children}
        </CharacterCreationContext.Provider>
    );
};

export const useCharacterCreation = () => {
    const context = useContext(CharacterCreationContext);
    if (!context) {
        throw new Error('useCharacterCreation must be used within CharacterCreationProvider');
    }
    return context;
};
