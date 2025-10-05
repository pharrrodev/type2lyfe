import axios from 'axios';

// Create an axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
});

console.log('API Base URL:', api.defaults.baseURL);

// Add a request interceptor to include the token in headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token is invalid or expired
      console.log('🔑 Token expired or invalid, clearing localStorage');
      localStorage.removeItem('token');
      // Redirect to login by reloading the page
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

export default api;

export const register = (data: any) => {
  return api.post('/api/auth/register', data);
};

export const login = (data: any) => {
  return api.post('/api/auth/login', data);
};

export const analyzeGlucoseFromImage = (image: string, mimeType: string) => {
  return api.post(`/api/analyze/glucose-from-image`, { image, mimeType });
};

export const analyzeMealFromImage = (image: string, mimeType: string) => {
  return api.post(`/api/analyze/meal-from-image`, { image, mimeType });
};

export const analyzeGlucoseFromText = (description: string) => {
  return api.post(`/api/analyze/glucose-from-text`, { description });
};

export const analyzeWeightFromImage = (image: string, mimeType: string) => {
  return api.post(`/api/analyze/weight-from-image`, { image, mimeType });
};

export const analyzeBpFromImage = (image: string, mimeType: string) => {
  return api.post(`/api/analyze/bp-from-image`, { image, mimeType });
};

export const analyzeWeightFromText = (description: string) => {
  return api.post(`/api/analyze/weight-from-text`, { description });
};

export const analyzeBpFromText = (description: string) => {
  return api.post(`/api/analyze/bp-from-text`, { description });
};

export const analyzeMealFromText = (description: string) => {
    return api.post(`/api/analyze/meal-from-text`, { description });
};

export const parseLateEntry = (entry: string) => {
    // This function is not available in the backend, so we will mock it for now.
    return Promise.resolve({ data: { type: 'glucose', value: 120 } });
}

export const parseMedicationFromText = (text: string, userMedications: any[]) => {
    // This function is not available in the backend, so we will mock it for now.
    // For now, return a simple mock that matches the first medication
    if (userMedications.length > 0) {
        return Promise.resolve({
            data: {
                matchedMed: userMedications[0],
                quantity: 1
            }
        });
    }
    return Promise.resolve({ data: null });
}