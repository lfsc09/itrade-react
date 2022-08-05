import styles from './datasets-novo.module.scss';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LoadingButton } from '@mui/lab';
import { Box, Grid, Paper, Stack, TextField, Typography, Breadcrumbs, Divider, Select, FormControl, InputLabel, MenuItem, ListItemText, OutlinedInput, Chip } from '@mui/material';
import { Link } from 'react-router-dom';
import { NavigateNext, KeyboardDoubleArrowUp, CheckBox } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { add, remove } from '../../../../../store/snack-messages/snack-messages-slice';
import SnackOverlay from '../../../../../components/ui/SnackOverlay';

const validationSchema = yup.object({
    nome: yup.string().trim().required('Informe nome do Dataset'),
});

const NovoDataset = () => {
    /**********
     * DISPATCH
     **********/
    const dispatch = useDispatch();

    /*********
     * STATES
     *********/
    const [isLoading, setIsLoading] = useState(false);
    const { snacks } = useSelector((store) => store.snackMessages);

    /********
     * FORMS
     ********/
    const formik = useFormik({
        initialValues: {
            nome: '',
            situacao: 2,
            tipo: 1,
            usuarios: [],
        },
        validationSchema: validationSchema,
        onSubmit: (values) => {
            dispatch(add({ key: '000', message: JSON.stringify(values), severity: 'warning' }));
            setIsLoading(true);
        },
    });

    return (
        <>
            {snacks.map((item) => (
                <SnackOverlay key={item.key} open={true} severity={item.severity} onClose={() => dispatch(remove(item.key))}>
                    {item.message}
                </SnackOverlay>
            ))}
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
                    <div className={styles.form_panel}>
                        <Paper className={styles.form_container} sx={{ p: 5 }}>
                            <form onSubmit={formik.handleSubmit}>
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <TextField
                                            label='Nome'
                                            variant='outlined'
                                            name='nome'
                                            autoFocus
                                            sx={{ width: '100%' }}
                                            value={formik.values.nome}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            error={formik.touched.nome && Boolean(formik.errors.nome)}
                                            helperText={formik.touched.nome && formik.errors.nome}
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <FormControl sx={{ width: '100%' }}>
                                            <InputLabel id='situacao_select_label'>Situação</InputLabel>
                                            <Select label='Situação' labelId='situacao_select_label' name='situacao' value={formik.values.situacao} onChange={formik.handleChange}>
                                                <MenuItem value={2}>Pendente</MenuItem>
                                                <MenuItem value={3}>Fazendo</MenuItem>
                                                <MenuItem value={1}>Fechado</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <FormControl sx={{ width: '100%' }}>
                                            <InputLabel id='tipo_select_label'>Tipo</InputLabel>
                                            <Select label='Tipo' labelId='tipo_select_label' name='tipo' value={formik.values.tipo} onChange={formik.handleChange}>
                                                <MenuItem value={1}>Live</MenuItem>
                                                <MenuItem value={2}>Replay</MenuItem>
                                                <MenuItem value={3}>Paper Trade</MenuItem>
                                                <MenuItem value={4}>Misto</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <FormControl sx={{ width: '100%' }}>
                                            <InputLabel id='usuarios_select_label'>Usuários</InputLabel>
                                            <Select
                                                labelId='usuarios_select_label'
                                                multiple
                                                name='usuarios'
                                                value={formik.values.usuarios}
                                                onChange={formik.handleChange}
                                                input={<OutlinedInput label='Usuários' />}
                                                renderValue={(selected) => (
                                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                        {selected.map((value, idx) => (
                                                            <Chip key={idx} label={value.nome} />
                                                        ))}
                                                    </Box>
                                                )}
                                            >
                                                <MenuItem key={0} value={{ id: 1, nome: 'Convidado' }}>
                                                    Convidado
                                                </MenuItem>
                                                <MenuItem key={1} value={{ id: 2, nome: 'Kamilla' }}>
                                                    Kamilla
                                                </MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <LoadingButton
                                            loading={isLoading}
                                            variant='contained'
                                            color='primary'
                                            type='submit'
                                            endIcon={<KeyboardDoubleArrowUp />}
                                            sx={{ width: '100%' }}
                                        >
                                            Enviar
                                        </LoadingButton>
                                    </Grid>
                                </Grid>
                            </form>
                        </Paper>
                    </div>
                </Stack>
            </Box>
        </>
    );
};

export default NovoDataset;
