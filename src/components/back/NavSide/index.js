import { Analytics, CandlestickChart, CloudUpload, DataThresholding, Euro, ExpandLess, ExpandMore, Grading, Layers, LocalAtm, Logout, Science, Storage } from '@mui/icons-material';
import { Box, Collapse, Divider, List, ListItemButton, ListItemIcon, ListItemText, Paper } from '@mui/material';
import { motion } from 'framer-motion';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';

import { handleLogout } from '../../../store/auth/auth-action';
import styles from './navside.module.scss';

const NavSide = () => {
    const dispatch = useDispatch();
    /*********
     * STATES
     *********/
    const [openDaytrade, setOpenDaytrade] = useState(false);
    const [openRendaFixa, setOpenRendaFixa] = useState(false);

    return (
        <Box className={styles.wrapper} component={motion.div} initial={{ y: '100vh' }} animate={{ y: 0, transition: { duration: 0.25 } }} exit={{ transition: { duration: 0.1 } }}>
            <Paper className={styles.nav_container}>
                <Box className={styles.nav_header}>
                    <img className={styles.nav_logo} src={require('../../../assets/back/img/logo.png')} alt='' />
                </Box>
                <Divider variant='middle' className={styles.nav_divider} sx={{ mb: 1 }} />
                <List className={styles.nav_list} component='nav'>
                    <ListItemButton className={styles.nav_button} onClick={() => setOpenDaytrade(!openDaytrade)}>
                        <ListItemIcon>
                            <CandlestickChart />
                        </ListItemIcon>
                        <ListItemText primary='Daytrade' primaryTypographyProps={{ variant: 'overline' }} />
                        {openDaytrade ? <ExpandLess /> : <ExpandMore />}
                    </ListItemButton>
                    <Collapse in={openDaytrade} timeout='auto' unmountOnExit>
                        <List component='div' disablePadding>
                            <ListItemButton className={styles.nav_button} sx={{ pl: 4 }} component={Link} to='/daytrade/dashboard' replace={true}>
                                <ListItemIcon>
                                    <Analytics />
                                </ListItemIcon>
                                <ListItemText primary='Dashboard' primaryTypographyProps={{ variant: 'overline' }} />
                            </ListItemButton>
                            <ListItemButton className={styles.nav_button} sx={{ pl: 4 }} component={Link} to='/daytrade/datasets' replace={true}>
                                <ListItemIcon>
                                    <Storage />
                                </ListItemIcon>
                                <ListItemText primary='Datasets' primaryTypographyProps={{ variant: 'overline' }} />
                            </ListItemButton>
                            <ListItemButton className={styles.nav_button} sx={{ pl: 4 }} component={Link} to='/daytrade/ativos' replace={true}>
                                <ListItemIcon>
                                    <Euro />
                                </ListItemIcon>
                                <ListItemText primary='Ativos' primaryTypographyProps={{ variant: 'overline' }} />
                            </ListItemButton>
                            <ListItemButton className={styles.nav_button} sx={{ pl: 4 }} component={Link} to='/daytrade/gerenciamentos' replace={true}>
                                <ListItemIcon>
                                    <LocalAtm />
                                </ListItemIcon>
                                <ListItemText primary='Gerenciamentos' primaryTypographyProps={{ variant: 'overline' }} />
                            </ListItemButton>
                            <ListItemButton className={styles.nav_button} sx={{ pl: 4 }} component={Link} to='/daytrade/cenarios' replace={true}>
                                <ListItemIcon>
                                    <Grading />
                                </ListItemIcon>
                                <ListItemText primary='Cenarios' primaryTypographyProps={{ variant: 'overline' }} />
                            </ListItemButton>
                            <ListItemButton className={styles.nav_button} sx={{ pl: 4 }} component={Link} to='/daytrade/builds' replace={true}>
                                <ListItemIcon>
                                    <Science />
                                </ListItemIcon>
                                <ListItemText primary='Builds' primaryTypographyProps={{ variant: 'overline' }} />
                            </ListItemButton>
                            <ListItemButton className={styles.nav_button} sx={{ pl: 4 }} component={Link} to='/daytrade/operacoes/novo' replace={true}>
                                <ListItemIcon>
                                    <Layers />
                                </ListItemIcon>
                                <ListItemText primary='Novas Operações' primaryTypographyProps={{ variant: 'overline' }} />
                            </ListItemButton>
                            <ListItemButton className={styles.nav_button} sx={{ pl: 4 }} component={Link} to='/daytrade/operacoes/importar' replace={true}>
                                <ListItemIcon>
                                    <CloudUpload />
                                </ListItemIcon>
                                <ListItemText primary='Importar Operações' primaryTypographyProps={{ variant: 'overline' }} />
                            </ListItemButton>
                        </List>
                    </Collapse>
                    <ListItemButton className={styles.nav_button} onClick={() => setOpenRendaFixa(!openRendaFixa)}>
                        <ListItemIcon>
                            <DataThresholding />
                        </ListItemIcon>
                        <ListItemText primary='Renda Fixa' primaryTypographyProps={{ variant: 'overline' }} />
                        {openRendaFixa ? <ExpandLess /> : <ExpandMore />}
                    </ListItemButton>
                    <ListItemButton
                        className={styles.nav_button}
                        sx={{ marginTop: 'auto' }}
                        onClick={() => {
                            dispatch(handleLogout());
                        }}
                    >
                        <ListItemIcon>
                            <Logout />
                        </ListItemIcon>
                        <ListItemText primary='Logout' primaryTypographyProps={{ variant: 'overline' }} />
                    </ListItemButton>
                </List>
            </Paper>
        </Box>
    );
};

export default NavSide;
