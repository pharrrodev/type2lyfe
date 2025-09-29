import api from './api';

export const analyzeImage = async (file: File, type: 'glucose' | 'meal' | 'weight' | 'bp') => {
  const formData = new FormData();
  formData.append('image', file);

  let url;
  switch (type) {
    case 'glucose':
      url = '/analyze/glucose-from-image';
      break;
    case 'meal':
      url = '/analyze/meal-from-image';
      break;
    case 'weight':
      url = '/analyze/weight-from-image';
      break;
    case 'bp':
      url = '/analyze/bp-from-image';
      break;
    default:
      throw new Error("Invalid analysis type");
  }

  const response = await api.post(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const analyzeText = async (text: string, type: 'glucose' | 'meal' | 'weight' | 'bp') => {
  let url;
  switch (type) {
    case 'glucose':
      url = '/analyze/glucose-from-text';
      break;
    case 'meal':
      url = '/analyze/meal-from-text';
      break;
    case 'weight':
      url = '/analyze/weight-from-text';
      break;
    case 'bp':
      url = '/analyze/bp-from-text';
      break;
    default:
      throw new Error("Invalid analysis type");
  }

  const response = await api.post(url, { text });
  return response.data;
};