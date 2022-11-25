import { Stack } from '@mui/material';
import React from 'react';
import { useLocation, useParams } from 'react-router-dom';

import NavbarTop from '../../components/back/NavbarTop';
import NavSide from '../../components/back/NavSide';
import NoContent from '../../components/ui/NoContent';
import styles from './back.module.scss';
import DaytradeAtivos from './daytrade/Ativos';
import DaytradeAtivosNovo from './daytrade/Ativos/Novo';
import DaytradeCenarios from './daytrade/Cenarios';
import DaytradeDashboard from './daytrade/Dashboard';
import DaytradeDatasets from './daytrade/Datasets';
import DaytradeDatasetsNovo from './daytrade/Datasets/Novo';
import DaytradeGerenciamentos from './daytrade/Gerenciamentos';
import DaytradeGerenciamentosNovo from './daytrade/Gerenciamentos/Novo';
import DaytradeOperacoesNovo from './daytrade/Operacoes/Novo';

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
                {content_switch(location.pathname, urlParams)}
            </Stack>
        </div>
    );
};

export default BackWrapper;
