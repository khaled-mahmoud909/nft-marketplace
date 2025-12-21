const { default: axios, get } = require("axios");

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    }
  return config;
},
(error) =>{ return Promise.reject(error); }
));

api.interceptors.response.use((response => response,
(error) => {
  if (error.response.status === 401) {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.href = '/';
    }
    return Promise.reject(error);
    }
));

export const authAPI = {
    getNonce: (walletAddress) =>
        api.post('/auth/nonce', { walletAddress }),

    login: (walletAddress, signature, message) =>
        api.post('/auth/login', { walletAddress, signature, message }),

    getProfile: () =>
        api.get('/auth/profile'),

    verifyToken: () =>
        api.get('/auth/verify'),
};

export const nftAPI = {
    getAll: (params) =>
        api.get('/nfts', { params }),

    getById: (tokenId) =>
        api.get(`/nfts/${tokenId}`),

    getByOwner: (address, params) =>
        api.get(`/nfts/owner/${address}`, { params }),

    getStats: () =>
        api.get('/nfts/stats'),
};

export const userAPI = {
    getProfile: (address) =>
        api.get(`/users/${address}`),

    updateProfile: (address, data) =>
        api.put(`/users/${address}`, data),

    getNFTs: (address, params) =>
        api.get(`/users/${address}/nfts`, { params }),

    getMintedNFTs: (address, params) =>
        api.get(`/users/${address}/minted`, { params }),
};

export const transactionAPI = {
    getAll: (params) =>
        api.get('/transactions', { params }),
    
    getById: (hash) =>
        api.get(`/transactions/${hash}`),

    getByToken: (tokenId, params) =>
        api.get(`/transactions/token/${tokenId}`, { params }),

    getByAddress: (address, params) =>
        api.get(`/transactions/address/${address}`, { params }),

    getHistory: (tokenId) =>
        api.get(`/transactions/token/${tokenId}/history`),

    getStats: () =>
        api.get('/transactions/stats'),
};

export default api;
