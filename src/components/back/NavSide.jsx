import styled from '@emotion/styled';
import { CandlestickChart } from '@mui/icons-material';
import { Button, Divider, Paper } from '@mui/material';
import { Box } from '@mui/system';
import React from 'react';

const AppBar = styled(Paper)({
    background: '#1f4356',
    color: '#fff',
    padding: '1rem',
    minHeight: '600px',
});

const Logo = styled('img')({
    width: '90px',
});

const NavButtons = styled(Button)({
    color: '#ebf0f5',
});

const NavSide = () => {
    return (
        <AppBar>
            <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Logo src={require('../../assets/back/img/logo.png')} alt='' />
            </Box>
            <Divider sx={{ background: '#ebf0f5', mt: 2, mb: 3 }} />
            <NavButtons variant='text' fullWidth startIcon={<CandlestickChart />}>
                Daytrade
            </NavButtons>
        </AppBar>
    );
};

export default NavSide;
