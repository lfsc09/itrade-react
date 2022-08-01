import styles from './datasets-novo.module.scss';
import React from 'react';
import { motion } from 'framer-motion';
import { Box, Grid, Paper, Stack, TextField, Typography, Breadcrumbs, Button, Divider } from '@mui/material';
import { Link } from 'react-router-dom';
import { NavigateNext } from '@mui/icons-material';

const index = () => {
    return (
        <Box
            className={styles.wrapper}
            component={motion.div}
            initial={{ y: '-100vh' }}
            animate={{ y: 0, transition: { duration: 0.25 } }}
            exit={{ transition: { duration: 0.1 } }}
        >
            <Stack direction='column' spacing={2} alignItems='strech' sx={{ height: '100%' }}>
                <div className={styles.title_panel}>
                    <Breadcrumbs separator={<NavigateNext fontSize='small' />}>
                        <Typography className={styles.title_link} variant='overline' component={Link} to='/daytrade/dashboard' replace={true}>
                            Daytrade
                        </Typography>
                        <Typography className={styles.title_link} variant='overline' component={Link} to='/daytrade/datasets' replace={true}>
                            Datasets
                        </Typography>
                        <Typography className={styles.title} variant='overline'>
                            Novo
                        </Typography>
                    </Breadcrumbs>
                </div>
                <Divider />
            </Stack>
        </Box>
    );
};

export default index;
