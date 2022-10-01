import jwtDecode from 'jwt-decode';

import { axiosCon } from '../../helpers/axios-con';
import { logout, setUserFromLocalToken } from './auth-slice';

export const handleLogout = () => {
    return (dispatch) => {
        localStorage.removeItem('token');
        dispatch(logout());
    };
};

export const readTokenFromLocal = () => {
    return (dispatch) => {
        const token = localStorage.getItem('token');
        if (token) {
            const user = jwtDecode(token);
            const token_exp_date = new Date(user.exp * 1000);
            if (token_exp_date >= new Date()) {
                axiosCon.defaults.headers.Authorization = `Bearer ${token}`;
                dispatch(setUserFromLocalToken({ token: token, user: user }));
            } else {
                localStorage.removeItem('token');
                dispatch(setUserFromLocalToken({ token: null, user: null }));
            }
        } else dispatch(setUserFromLocalToken({ token: null, user: null }));
    };
};
