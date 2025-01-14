import axios from 'axios';

const instance = axios.create({
    baseURL: 'http://localhost:8080',
    headers: {
        'Content-Type': 'application/json'
    }
});

instance.interceptors.request.use(
    config => {
        console.log('Making request to:', config.url);
        return config;
    },
    error => {
        console.error('Request Error:', error);
        return Promise.reject(error);
    }
);

instance.interceptors.response.use(
    response => response,
    error => {
        console.error('Response Error:', error);
        return Promise.reject(error);
    }
);

export default instance; 