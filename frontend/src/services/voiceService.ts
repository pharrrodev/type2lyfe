import api from './api';

/**
 * Transcribe audio using backend API
 * This avoids exposing the Gemini API key in the frontend
 */
export const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
  const formData = new FormData();
  formData.append('audio', audioBlob);

  const response = await api.post('/voice/transcribe', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.transcript;
};

