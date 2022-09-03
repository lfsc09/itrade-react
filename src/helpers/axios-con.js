import axios from 'axios';

const axiosCon = axios.create({
    baseUrl: 'http://dev.api.itrade-dongs.net',
});

/**
 * TODO: Fazer cancelamento de requisição
 */
axiosCon.CancelToken = axios.CancelToken;
axiosCon.isCancel = axios.isCancel;

export default axiosCon;
