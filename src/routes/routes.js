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
                    <Route path='/login' exact element={<LandingLogin />} />
                    <Route path='*' element={<Navigate replace to='/login' />} />
                </>
            ) : (
                <>
                    <Route path='/daytrade/dashboard' exact element={<BackWrapper />} />
                    <Route path='/daytrade/datasets' exact element={<BackWrapper />} />
                    <Route path='/daytrade/ativos' exact element={<BackWrapper />} />
                    <Route path='/daytrade/gerenciamentos' exact element={<BackWrapper />} />
                    <Route path='/daytrade/cenarios' exact element={<BackWrapper />} />
                    <Route path='/daytrade/builds' exact element={<BackWrapper />} />
                    <Route path='/daytrade/novas_operacoes' exact element={<BackWrapper />} />
                    <Route path='/daytrade/importar_operacoes' exact element={<BackWrapper />} />
                    <Route path='*' element={<Navigate replace to='/daytrade/dashboard' />} />
                </>
            )}
        </Routes>
    );
};

export default MainRoutes;
