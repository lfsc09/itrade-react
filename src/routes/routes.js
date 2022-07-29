import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useSelector } from 'react-redux';
import LandingLogin from '../pages/landing/Login';
import BackWrapper from '../pages/back';

const MainRoutes = () => {
    const { user } = useSelector((store) => store.auth);

    if (user === undefined) return <></>;

    return (
        <Routes>
            {user === null ? (
                <>
                    <Route path='/login' element={<LandingLogin />} />
                    <Route path='*' element={<Navigate replace to='/login' />} />
                </>
            ) : (
                <>
                    <Route path='/daytrade/dashboard' element={<BackWrapper />} />
                    <Route path='/daytrade/datasets' element={<BackWrapper />} />
                    <Route path='/daytrade/ativos' element={<BackWrapper />} />
                    <Route path='/daytrade/gerenciamentos' element={<BackWrapper />} />
                    <Route path='/daytrade/cenarios' element={<BackWrapper />} />
                    <Route path='/daytrade/builds' element={<BackWrapper />} />
                    <Route path='/daytrade/novas_operacoes' element={<BackWrapper />} />
                    <Route path='/daytrade/importar_operacoes' element={<BackWrapper />} />
                    <Route path='*' element={<Navigate replace to='/daytrade/dashboard' />} />
                </>
            )}
        </Routes>
    );
};

export default MainRoutes;
