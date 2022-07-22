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
                    <Route path='/login' exact element={<LandingLogin />} />
                    <Route path='*' element={<Navigate replace to='/login' />} />
                </>
            ) : (
                <>
                    <Route path='/dashboard' exact element={<BackDaytradeDashboard />} />
                    <Route path='*' element={<Navigate replace to='/dashboard' />} />
                </>
            )}
        </Routes>
    );
};

export default MainRoutes;
