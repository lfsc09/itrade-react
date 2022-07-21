import styles from './navside.module.css';
import { Analytics, CandlestickChart, Euro, ExpandLess, ExpandMore, Grading, Layers, LocalAtm, Logout, Science, Storage } from '@mui/icons-material';
import { Divider, Paper, Box, Typography, List, ListItemButton, ListItemIcon, ListItemText, Collapse } from '@mui/material';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';

const NavSide = () => {
    /*********
     * STATES
     *********/
    const { user } = useSelector((store) => store.auth);
    const [openDaytrade, setOpenDaytrade] = useState(false);

    return (
        <Paper className={styles.nav_container}>
            <Box className={styles.nav_header}>
                <img className={styles.nav_logo} src={require('../../../assets/back/img/mascot.png')} alt='' />
                <div className={styles.nav_user}>
                    <Typography variant='button'>Bom dia</Typography>
                    <Typography className={styles.nav_username} variant='overline'>
                        {user.nome}
                    </Typography>
                </div>
            </Box>
            <Divider variant='middle' className={styles.nav_divider} sx={{ mb: 1 }} />
            <List component='nav' sx={{ flexGrow: 1 }}>
                <ListItemButton className={styles.nav_button} onClick={() => setOpenDaytrade(!openDaytrade)}>
                    <ListItemIcon>
                        <CandlestickChart />
                    </ListItemIcon>
                    <ListItemText primary='Daytrade' primaryTypographyProps={{ variant: 'overline' }} />
                    {openDaytrade ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>
                <Collapse in={openDaytrade} timeout='auto' unmountOnExit>
                    <List component='div' disablePadding>
                        <ListItemButton className={styles.nav_button} sx={{ pl: 4 }}>
                            <ListItemIcon>
                                <Analytics />
                            </ListItemIcon>
                            <ListItemText primary='Dashboard' primaryTypographyProps={{ variant: 'overline' }} />
                        </ListItemButton>
                        <ListItemButton className={styles.nav_button} sx={{ pl: 4 }}>
                            <ListItemIcon>
                                <Storage />
                            </ListItemIcon>
                            <ListItemText primary='Datasets' primaryTypographyProps={{ variant: 'overline' }} />
                        </ListItemButton>
                        <ListItemButton className={styles.nav_button} sx={{ pl: 4 }}>
                            <ListItemIcon>
                                <Euro />
                            </ListItemIcon>
                            <ListItemText primary='Ativos' primaryTypographyProps={{ variant: 'overline' }} />
                        </ListItemButton>
                        <ListItemButton className={styles.nav_button} sx={{ pl: 4 }}>
                            <ListItemIcon>
                                <LocalAtm />
                            </ListItemIcon>
                            <ListItemText primary='Gerenciamentos' primaryTypographyProps={{ variant: 'overline' }} />
                        </ListItemButton>
                        <ListItemButton className={styles.nav_button} sx={{ pl: 4 }}>
                            <ListItemIcon>
                                <Grading />
                            </ListItemIcon>
                            <ListItemText primary='Cenarios' primaryTypographyProps={{ variant: 'overline' }} />
                        </ListItemButton>
                        <ListItemButton className={styles.nav_button} sx={{ pl: 4 }}>
                            <ListItemIcon>
                                <Science />
                            </ListItemIcon>
                            <ListItemText primary='Builds' primaryTypographyProps={{ variant: 'overline' }} />
                        </ListItemButton>
                        <ListItemButton className={styles.nav_button} sx={{ pl: 4 }}>
                            <ListItemIcon>
                                <Layers />
                            </ListItemIcon>
                            <ListItemText primary='Adiconar Operações' primaryTypographyProps={{ variant: 'overline' }} />
                        </ListItemButton>
                    </List>
                </Collapse>
                <ListItemButton className={styles.nav_button} sx={{ marginTop: 'auto' }}>
                    <ListItemIcon>
                        <Logout />
                    </ListItemIcon>
                    <ListItemText primary='Logout' primaryTypographyProps={{ variant: 'overline' }} />
                </ListItemButton>
            </List>
        </Paper>
    );
};

export default NavSide;
