import styles from './navside.module.css';
import { CandlestickChart } from '@mui/icons-material';
import { Button, Divider, Paper, Box } from '@mui/material';
import React from 'react';

const NavSide = () => {
    return (
        <Paper className={styles.nav_container}>
            <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img className={styles.nav_logo} src={require('../../../assets/back/img/logo.png')} alt='' />
            </Box>
            <Divider sx={{ background: '#ebf0f5', mt: 2, mb: 3 }} />
            <Button className={styles.nav_button} variant='text' fullWidth startIcon={<CandlestickChart />}>
                Daytrade
            </Button>
        </Paper>
    );
};

export default NavSide;
