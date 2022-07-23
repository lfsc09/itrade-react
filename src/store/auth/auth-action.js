import jwtDecode from 'jwt-decode';
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
            dispatch(setUserFromLocalToken({ token: token, user: user }));
        } else dispatch(setUserFromLocalToken({ token: null, user: null }));
    };
};
