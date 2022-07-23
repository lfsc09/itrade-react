import styles from './back.module.css';
import React from 'react';
import { useLocation } from 'react-router-dom';
import { Box, Grid } from '@mui/material';
import NavSide from '../../components/back/NavSide';
import { motion } from 'framer-motion';
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
            <Grid container spacing={2} sx={{ height: '100%', m: 0, width: '100%' }}>
                <Grid item xs={2}>
                    <Box
                        sx={{ height: '100%' }}
                        component={motion.div}
                        initial={{ y: '100vh' }}
                        animate={{ y: 0, transition: { duration: 0.25 } }}
                        exit={{ transition: { duration: 0.1 } }}
                    >
                        <NavSide />
                    </Box>
                </Grid>
                <Grid item xs={10}>
                    {content_switch(location.pathname)}
                </Grid>
            </Grid>
        </div>
    );
};

export default BackWrapper;
