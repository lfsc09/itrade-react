import React from 'react';
import styled from '@emotion/styled';
import { Box, Grid, Stack } from '@mui/material';
import NavSide from '../../../components/back/NavSide';
import { motion } from 'framer-motion';
import { Container } from '@mui/system';

const Home = () => {
    const consts = {
        pageWidth_max: '1920px',
    };

    return (
        <Box width='100%' height='100vh' sx={{ backgroundColor: '#ebf0f5' }}>
            <Container sx={{ maxWidth: `${consts.pageWidth_max}` }} maxWidth={false}>
                <Grid container spacing={2} sx={{ height: '100%' }}>
                    <Grid item xs={2}>
                        <Box
                            sx={{ margin: '1.5rem' }}
                            component={motion.div}
                            initial={{ x: `-${consts.appbar_width}px` }}
                            animate={{ x: 0, transition: { duration: 0.25 } }}
                            exit={{ transition: { duration: 0.1 } }}
                        >
                            <NavSide />
                        </Box>
                    </Grid>
                    <Grid item xs={8}>
                        <Box
                            sx={{ margin: '1.5rem' }}
                            component={motion.div}
                            initial={{ y: '-100vh' }}
                            animate={{ y: 0, transition: { duration: 0.25 } }}
                            exit={{ transition: { duration: 0.1 } }}
                        >
                            {'Content'}
                        </Box>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default Home;
