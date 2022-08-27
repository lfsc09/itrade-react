import axios from 'axios';

const axiosCon = axios.create({
    baseUrl: 'http://dev.api.itrade-dongs.net',
});

export default axiosCon;
