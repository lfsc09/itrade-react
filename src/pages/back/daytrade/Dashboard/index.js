import styles from './dashboard.module.scss';
import React from 'react';
import { motion } from 'framer-motion';
import { Box, Button, Checkbox, FormControl, FormHelperText, Grid, ListItemText, MenuItem, Paper, Select, TextField, Typography } from '@mui/material';
import { AutoFixHigh } from '@mui/icons-material';
import { useSelector } from 'react-redux';

const datasets = ['Dataset 1', 'Dataset 2', 'Dataset 3'];

const Dashboard = () => {
    const { user } = useSelector((store) => store.auth);

    return (
        <Box sx={{ height: '100%' }} component={motion.div} initial={{ y: '-100vh' }} animate={{ y: 0, transition: { duration: 0.25 } }} exit={{ transition: { duration: 0.1 } }}>
            <Grid container spacing={2}>
                <Grid className={styles.greetings_panel} item xs={12} sx={{ px: 2 }}>
                    <Typography className={styles.greetings_user} variant='overline'>
                        Bem vindo, {user.nome} &#128075;
                    </Typography>
                    <FormControl className={styles.dataset_form}>
                        <Select multiple value={[datasets[0]]} size='small' renderValue={(selected) => selected.join(', ')}>
                            {datasets.map((item, index) => (
                                <MenuItem key={index} value={item}>
                                    <Checkbox checked={false} />
                                    <ListItemText primary={item} />
                                </MenuItem>
                            ))}
                        </Select>
                        <FormHelperText>Analisar Dataset</FormHelperText>
                    </FormControl>
                </Grid>
                <Grid className={styles.filter_panel} item xs={12} sx={{ px: 2 }}>
                    <Button variant='contained' className={styles.filter_panel__button}>
                        <AutoFixHigh />
                    </Button>
                    <Grid container spacing={1}>
                        <Grid item xs={12}>
                            <Paper className={styles.filter_container} sx={{ p: 2 }}>
                                <TextField label='Filtrar Data' variant='outlined' size='small' />
                            </Paper>
                        </Grid>
                        <Grid item xs={12}>
                            <Paper className={styles.simulation_container} sx={{ p: 2 }}>
                                <TextField label='Periodo' variant='outlined' size='small' />
                            </Paper>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Dashboard;
