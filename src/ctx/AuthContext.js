import React, { createContext, useCallback, useEffect, useState } from 'react';
import jwtDecode from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import axiosCon from '../helpers/axios-con';

const LoginContext = createContext();

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    const changeAuthState = useCallback((token) => {
        if (token === null) {
            setUser(null);
            axiosCon.defaults.headers.Authorization = '';
        } else {
            setUser(jwtDecode(token));
            axiosCon.defaults.headers.Authorization = `Bearer ${token}`;
        }
    }, []);

    //Carrega o Token se ja está logado
    useEffect(() => {
        const savedToken = localStorage.getItem('token');
        changeAuthState(savedToken);
    }, [changeAuthState]);

    //Salva e carrega o token após o login, e redireciona para dentro
    const handleLogin = (receivedToken) => {
        localStorage.setItem('token', receivedToken);
        changeAuthState(receivedToken);
        navigate('/');
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        changeAuthState(null);
        navigate('/');
    };

    return <LoginContext.Provider value={{ user, handleLogin, handleLogout }}>{children}</LoginContext.Provider>;
};

// export { LoginContext, AuthProvider };
