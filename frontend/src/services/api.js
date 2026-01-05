import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

console.log('API URL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

console.log('Axios instance created with baseURL:', api.defaults.baseURL);
console.log(api)

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('Token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('Request:', config.method.toUpperCase(), config.url);
    return config;
},
(error) =>{
    console.error('Request interceptor error:', error);
    return Promise.reject(error); 
}
);

api.interceptors.response.use((response) => 
{
    console.log('Response:', response.config.url, response.status);
    return response;
},
(error) => {
    console.error('Response error:', error.message);
    if(error.response){
        console.error('  Status:', error.response.status);
        console.error('  Data:', error.response.data);
        if (error.response.status === 401) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            window.location.href = '/';
        }
    } 
    else if (error.request) {
        console.error('  No response received from server');
        console.error('  Is backend running on', API_URL, '?');
    }
    else {
        console.error('  Error setting up request:', error.message);
    }
    return Promise.reject(error);
}
);

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
        api.get(`/user/${address}`),

    updateProfile: (address, data) =>
        api.put(`/user/${address}`, data),

    getNFTs: (address, params) =>
        api.get(`/user/${address}/nfts`, { params }),

    getMintedNFTs: (address, params) =>
        api.get(`/user/${address}/minted`, { params }),
};

export const transactionAPI = {
    getAll: (params) =>
        api.get('/transaction', { params }),
    
    getById: (hash) =>
        api.get(`/transaction/${hash}`),

    getByToken: (tokenId, params) =>
        api.get(`/transaction/token/${tokenId}`, { params }),

    getByAddress: (address, params) =>
        api.get(`/transaction/address/${address}`, { params }),

    getHistory: (tokenId) =>
        api.get(`/transaction/token/${tokenId}/history`),
    getStats: () =>
        api.get('/transaction/stats'),
};

export default api;
