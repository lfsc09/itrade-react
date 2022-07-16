import React, { useContext } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import LandingLogin from '../pages/landing/Login';
import BackDaytrade from '../pages/back/daytrade/Home';
import { LoginContext } from '../ctx/AuthContext';

const MainRoutes = () => {
    const { user } = useContext(LoginContext);

    return (
        <Routes>
            {user === null ? (
                <>
                    <Route path='/' exact element={<LandingLogin />} />
                    <Route path='*' element={<Navigate replace to='/' />} />
                </>
            ) : (
                <>
                    <Route path='/' exact element={<BackDaytrade />} />
                    <Route path='*' element={<Navigate replace to='/' />} />
                </>
            )}
        </Routes>
    );
};

export default MainRoutes;
