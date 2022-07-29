import styles from './navside.module.scss';
import { Analytics, CandlestickChart, CloudUpload, DataThresholding, Euro, ExpandLess, ExpandMore, Grading, Layers, LocalAtm, Logout, Science, Storage } from '@mui/icons-material';
import { Divider, Paper, Box, List, ListItemButton, ListItemIcon, ListItemText, Collapse } from '@mui/material';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { handleLogout } from '../../../store/auth/auth-action';

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
                            <ListItemButton className={styles.nav_button} sx={{ pl: 4 }} component={Link} to='/daytrade/dashboard'>
                                <ListItemIcon>
                                    <Analytics />
                                </ListItemIcon>
                                <ListItemText primary='Dashboard' primaryTypographyProps={{ variant: 'overline' }} />
                            </ListItemButton>
                            <ListItemButton className={styles.nav_button} sx={{ pl: 4 }} component={Link} to='/daytrade/datasets'>
                                <ListItemIcon>
                                    <Storage />
                                </ListItemIcon>
                                <ListItemText primary='Datasets' primaryTypographyProps={{ variant: 'overline' }} />
                            </ListItemButton>
                            <ListItemButton className={styles.nav_button} sx={{ pl: 4 }} component={Link} to='/daytrade/ativos'>
                                <ListItemIcon>
                                    <Euro />
                                </ListItemIcon>
                                <ListItemText primary='Ativos' primaryTypographyProps={{ variant: 'overline' }} />
                            </ListItemButton>
                            <ListItemButton className={styles.nav_button} sx={{ pl: 4 }} component={Link} to='/daytrade/gerenciamentos'>
                                <ListItemIcon>
                                    <LocalAtm />
                                </ListItemIcon>
                                <ListItemText primary='Gerenciamentos' primaryTypographyProps={{ variant: 'overline' }} />
                            </ListItemButton>
                            <ListItemButton className={styles.nav_button} sx={{ pl: 4 }} component={Link} to='/daytrade/cenarios'>
                                <ListItemIcon>
                                    <Grading />
                                </ListItemIcon>
                                <ListItemText primary='Cenarios' primaryTypographyProps={{ variant: 'overline' }} />
                            </ListItemButton>
                            <ListItemButton className={styles.nav_button} sx={{ pl: 4 }} component={Link} to='/daytrade/builds'>
                                <ListItemIcon>
                                    <Science />
                                </ListItemIcon>
                                <ListItemText primary='Builds' primaryTypographyProps={{ variant: 'overline' }} />
                            </ListItemButton>
                            <ListItemButton className={styles.nav_button} sx={{ pl: 4 }} component={Link} to='/daytrade/novas_operacoes'>
                                <ListItemIcon>
                                    <Layers />
                                </ListItemIcon>
                                <ListItemText primary='Novas Operações' primaryTypographyProps={{ variant: 'overline' }} />
                            </ListItemButton>
                            <ListItemButton className={styles.nav_button} sx={{ pl: 4 }} component={Link} to='/daytrade/importar_operacoes'>
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
