import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useSelector } from 'react-redux';
import LandingLogin from '../pages/landing/Login';
import BackDaytradeDashboard from '../pages/back/daytrade/Dashboard';

const MainRoutes = () => {
    const { user } = useSelector((store) => store.auth);

    return (
        <Routes>
            {user === null ? (
                <>
                    <Route path='/' exact element={<LandingLogin />} />
                    <Route path='*' element={<Navigate replace to='/' />} />
                </>
            ) : (
                <>
                    <Route path='/' exact element={<BackDaytradeDashboard />} />
                    <Route path='*' element={<Navigate replace to='/' />} />
                </>
            )}
        </Routes>
    );
};

export default MainRoutes;
