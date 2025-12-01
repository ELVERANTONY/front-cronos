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
                    const status = await adminService.getJobStatus(job_id);

                    setProgress(status.data.progress);
                    setStatusMessage(status.data.message);

                    if (status.data.status === 'completed') {
                        clearInterval(interval);
                        setIsCreating(false);
                        setIsSuccess(true); // Show success state
                        setProgress(100);
                        setStatusMessage('¡Personaje creado exitosamente!');

                        // Hide success message after 5 seconds
                        setTimeout(() => {
                            setIsSuccess(false);
                            setStatusMessage('');
                        }, 5000);

                        // Success callback
                        if (onSuccess) {
                            onSuccess(status.data.data.character_id);
                        }
                    } else if (status.data.status === 'failed') {
                        clearInterval(interval);
                        setIsCreating(false);
                        setStatusMessage('Error al crear personaje');

                        // Error callback
                        if (onError) {
                            onError(status.data.error);
                        }
                    }
                } catch (err) {
                    clearInterval(interval);
                    setIsCreating(false);
                    if (onError) {
                        onError(err.message);
                    }
                }
            }, 2500); // Poll every 2.5 seconds

            setPollInterval(interval);
        } catch (error) {
            setIsCreating(false);
            setStatusMessage('Error al iniciar creación');
            if (onError) {
                onError(error.message);
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
