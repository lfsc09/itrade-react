import { Box, Container } from '@mui/system';
import { motion } from 'framer-motion';
import React from 'react';

import LoginForm from '../../../components/landing/LoginForm';
import styles from './login.module.scss';

const Login = () => {
    return (
        <Container className={styles.login_container}>
            <Box component={motion.div} initial={{ y: '-100vh' }} animate={{ y: 0, transition: { duration: 0.25 } }} exit={{ transition: { duration: 0.1 } }}>
                <img src={require('../../../assets/landing/img/logo.png')} alt='' />
            </Box>
            <Box component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <LoginForm />
            </Box>
        </Container>
    );
};

export default Login;
