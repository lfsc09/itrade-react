import styles from './dashboard.module.css';
import React from 'react';
import { Box, Grid } from '@mui/material';
import NavSide from '../../../../components/back/NavSide';
import { motion } from 'framer-motion';

const Home = () => {
    const consts = {
        pageWidth_max: '2560px',
    };

    return (
        <div className={styles.wrapper}>
            <Grid container spacing={2} sx={{ height: '100%', m: 0, width: '100%' }}>
                <Grid item xs={2}>
                    <Box
                        sx={{ height: '100%' }}
                        component={motion.div}
                        initial={{ x: `-${consts.appbar_width}px` }}
                        animate={{ x: 0, transition: { duration: 0.25 } }}
                        exit={{ transition: { duration: 0.1 } }}
                    >
                        <NavSide />
                    </Box>
                </Grid>
                <Grid item xs={10}>
                    <Box
                        sx={{ height: '100%' }}
                        component={motion.div}
                        initial={{ y: '-100vh' }}
                        animate={{ y: 0, transition: { duration: 0.25 } }}
                        exit={{ transition: { duration: 0.1 } }}
                    >
                        {'Content'}
                    </Box>
                </Grid>
            </Grid>
        </div>
    );
};

export default Home;
