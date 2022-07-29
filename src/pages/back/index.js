import styles from './back.module.scss';
import React from 'react';
import { useLocation } from 'react-router-dom';
import { Stack } from '@mui/material';
import NavSide from '../../components/back/NavSide';
import NoContent from '../../components/ui/NoContent';
import DaytradeDashboard from './daytrade/Dashboard';
import DaytradeDatasets from './daytrade/Datasets';

const content_switch = (url) => {
    if (url.includes('/daytrade/dashboard')) return <DaytradeDashboard />;
    if (url.includes('/daytrade/datasets')) return <DaytradeDatasets />;
    return <NoContent type='under-construction' />;
};

const BackWrapper = () => {
    const location = useLocation();

    return (
        <div className={styles.wrapper}>
            <Stack spacing={2} sx={{ height: '100%', width: '100%' }} direction='row'>
                <NavSide />
                {content_switch(location.pathname)}
            </Stack>
        </div>
    );
};

export default BackWrapper;
