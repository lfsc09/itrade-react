import jwtDecode from 'jwt-decode';

import { axiosCon } from '../../helpers/axios-con';
import { logout, setUserFromLocalToken } from './auth-slice';

export const handleLogout = () => {
    return (dispatch) => {
        localStorage.removeItem('token:itrade-dongs');
        dispatch(logout());
    };
};

export const readTokenFromLocal = () => {
    return (dispatch) => {
        const token = localStorage.getItem('token:itrade-dongs');
        if (token && token !== 'undefined' && token !== 'null') {
            const user = jwtDecode(token);
            const token_exp_date = new Date(user.exp * 1000);
            if (user.host === 'itrade-dongs' && token_exp_date >= new Date()) {
                axiosCon.defaults.headers.Authorization = `Bearer ${token}`;
                dispatch(setUserFromLocalToken({ token: token, user: user }));
            } else {
                localStorage.removeItem('token:itrade-dongs');
                dispatch(setUserFromLocalToken({ token: null, user: null }));
            }
        } else {
            localStorage.removeItem('token:itrade-dongs');
            dispatch(setUserFromLocalToken({ token: null, user: null }));
        }
    };
};
