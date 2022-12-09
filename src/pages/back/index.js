import { Stack } from '@mui/material';
import React from 'react';
import { useLocation, useParams } from 'react-router-dom';

import NavbarTop from '../../components/back/NavbarTop';
import FetchingContent from '../../components/ui/FetchingContent';
import NoContent from '../../components/ui/NoContent';
import styles from './back.module.scss';

const DaytradeAtivos = React.lazy(() => import('./daytrade/Ativos'));
const DaytradeAtivosNovo = React.lazy(() => import('./daytrade/Ativos/Novo'));
const DaytradeCenarios = React.lazy(() => import('./daytrade/Cenarios'));
const DaytradeDashboard = React.lazy(() => import('./daytrade/Dashboard'));
const DaytradeDatasets = React.lazy(() => import('./daytrade/Datasets'));
const DaytradeDatasetsNovo = React.lazy(() => import('./daytrade/Datasets/Novo'));
const DaytradeGerenciamentos = React.lazy(() => import('./daytrade/Gerenciamentos'));
const DaytradeGerenciamentosNovo = React.lazy(() => import('./daytrade/Gerenciamentos/Novo'));
const DaytradeOperacoesNovo = React.lazy(() => import('./daytrade/Operacoes/Novo'));

const content_switch = (url, urlParams) => {
    if (url.match(/^.*\/daytrade\/dashboard$/)) return <DaytradeDashboard />;
    if (url.match(/^.*\/daytrade\/datasets$/)) return <DaytradeDatasets />;
    if (url.match(/^.*\/daytrade\/datasets\/novo$/)) return <DaytradeDatasetsNovo />;
    if (url.match(/^.*\/daytrade\/datasets\/editar\/\d*$/)) return <DaytradeDatasetsNovo editar={urlParams} />;
    if (url.match(/^.*\/daytrade\/ativos$/)) return <DaytradeAtivos />;
    if (url.match(/^.*\/daytrade\/ativos\/novo$/)) return <DaytradeAtivosNovo />;
    if (url.match(/^.*\/daytrade\/ativos\/editar\/\d*$/)) return <DaytradeAtivosNovo editar={urlParams} />;
    if (url.match(/^.*\/daytrade\/gerenciamentos$/)) return <DaytradeGerenciamentos />;
    if (url.match(/^.*\/daytrade\/gerenciamentos\/novo$/)) return <DaytradeGerenciamentosNovo />;
    if (url.match(/^.*\/daytrade\/gerenciamentos\/editar\/\d*$/)) return <DaytradeGerenciamentosNovo editar={urlParams} />;
    if (url.match(/^.*\/daytrade\/cenarios$/)) return <DaytradeCenarios />;
    if (url.match(/^.*\/daytrade\/operacoes\/novo$/)) return <DaytradeOperacoesNovo />;
    return <NoContent type='under-construction' addedClasses={{ wrapper: `${styles.no_content__wrapper}` }} />;
};

const BackWrapper = () => {
    const location = useLocation();
    const urlParams = useParams();

    return (
        <div className={styles.wrapper}>
            <Stack spacing={2} className={styles.container}>
                <NavbarTop />
                <React.Suspense fallback={<FetchingContent />}>{content_switch(location.pathname, urlParams)}</React.Suspense>
            </Stack>
        </div>
    );
};

export default BackWrapper;
