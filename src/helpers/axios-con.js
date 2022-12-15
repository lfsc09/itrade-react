import ProgressBar from '@badrap/bar-of-progress';
import axios from 'axios';

const progressBar = new ProgressBar();

const axiosCon = axios.create({
    baseUrl: process.env.REACT_APP_API_URL,
});

// Interceptador da Requisição
axiosCon.interceptors.request.use(
    (config) => {
        progressBar.start();
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptador da Resposta
axiosCon.interceptors.response.use(
    (response) => {
        progressBar.finish();
        return response;
    },
    (error) => {
        progressBar.finish();
        return Promise.reject(error);
    }
);

export { axiosCon };
