import axios from 'axios';
import ProgressBar from '@badrap/bar-of-progress';

const progressBar = new ProgressBar();

const axiosCon = axios.create({
    baseUrl: 'http://dev.api.itrade-dongs.net',
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
        return Promise.reject(error);
    }
);

export { axiosCon };
