import { Box, Container, styled } from '@mui/system';
import React from 'react';
import LoginForm from '../../components/landing/LoginForm';
import { motion } from 'framer-motion';

const Login = () => {
    const ModContainer = styled(Container)({
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    });

    return (
        <ModContainer>
            <Box component={motion.div} initial={{ y: '-100vh' }} animate={{ y: 0, transition: { duration: 0.25 } }} exit={{ transition: { duration: 0.1 } }}>
                <img src={require('../../assets/landing/img/logo.png')} alt='' />
            </Box>
            <Box component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <LoginForm />
            </Box>
        </ModContainer>
    );
};

export default Login;
