import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 45000, // 45 seconds for multimodal AI calls
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor to normalize error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = 'An unexpected error occurred while communicating with the server.';
    if (error.response) {
      if (typeof error.response.data?.detail === 'string') {
        message = error.response.data.detail;
      } else if (Array.isArray(error.response.data?.detail)) {
        message = error.response.data.detail.map((d) => d.msg || JSON.stringify(d)).join('; ');
      } else if (error.response.data?.message) {
        message = error.response.data.message;
      } else {
        message = `Server responded with status code ${error.response.status}`;
      }
    } else if (error.request) {
      message = 'Could not connect to the backend server. Please verify that the backend is running.';
    } else {
      message = error.message;
    }
    return Promise.reject(new Error(message));
  }
);

export const api = {
  // Health
  getHealth: async () => {
    const res = await apiClient.get('/health');
    return res.data;
  },

  // Safety Monitor
  analyzeSafety: async (formData) => {
    const res = await apiClient.post('/safety/analyze', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  // Structural Crack Detection
  analyzeCrack: async (formData) => {
    const res = await apiClient.post('/crack/analyze', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  // Project Planner
  calculateProjectPlan: async (payload) => {
    const res = await apiClient.post('/planner/calculate', payload);
    return res.data;
  },

  // Real Estate Valuation
  estimateValuation: async (payload) => {
    const res = await apiClient.post('/valuation/estimate', payload);
    return res.data;
  },

  // Knowledge Assistant
  askKnowledge: async (payload) => {
    const res = await apiClient.post('/knowledge/ask', payload);
    return res.data;
  },

  // Construction Chatbot
  sendChatMessage: async (payload) => {
    const res = await apiClient.post('/chat/message', payload);
    return res.data;
  },

  // Daily Site Assistant
  generateDailySitePlan: async (payload) => {
    const res = await apiClient.post('/daily-site/plan', payload);
    return res.data;
  },

  // Weather Advisor
  getWeatherAdvisory: async (payload) => {
    const res = await apiClient.post('/weather/advisory', payload);
    return res.data;
  },
};

export default api;
