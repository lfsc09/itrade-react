import styles from './back.module.scss';
import React from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Stack } from '@mui/material';
import NavSide from '../../components/back/NavSide';
import NoContent from '../../components/ui/NoContent';
import DaytradeDashboard from './daytrade/Dashboard';
import DaytradeDatasets from './daytrade/Datasets';
import DaytradeDatasetsNovo from './daytrade/Datasets/Novo';
import DaytradeAtivos from './daytrade/Ativos';
import DaytradeAtivosNovo from './daytrade/Ativos/Novo';
import DaytradeGerenciamentos from './daytrade/Gerenciamentos';
import DaytradeGerenciamentosNovo from './daytrade/Gerenciamentos/Novo';
import DaytradeCenarios from './daytrade/Cenarios';

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
    return <NoContent type='under-construction' />;
};

const BackWrapper = () => {
    const location = useLocation();
    const urlParams = useParams();

    return (
        <div className={styles.wrapper}>
            <Stack spacing={2} className={styles.container} direction='row'>
                <NavSide />
                {content_switch(location.pathname, urlParams)}
            </Stack>
        </div>
    );
};

export default BackWrapper;
