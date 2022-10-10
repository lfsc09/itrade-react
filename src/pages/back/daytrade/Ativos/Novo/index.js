import { KeyboardDoubleArrowUp, NavigateNext } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import { Box, Breadcrumbs, Divider, Grid, Paper, Stack, TextField, Typography } from '@mui/material';
import { useFormik } from 'formik';
import { motion } from 'framer-motion';
import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import * as yup from 'yup';

import gStyles from '../../../../../assets/back/scss/global.module.scss';
import MessageController from '../../../../../components/ui/MessageController';
import { axiosCon } from '../../../../../helpers/axios-con';
import { isObjectEmpty } from '../../../../../helpers/global';
import { add } from '../../../../../store/api-messages/api-messages-slice';
import { handleLogout } from '../../../../../store/auth/auth-action';
import styles from './ativos-novo.module.scss';
import AtivoNovoSkeleton from './Skeleton';

const validationSchema = yup.object({
    nome: yup.string().trim().required('Informe nome do Ativo'),
    custo: yup.number().required('Informe o Custo'),
    valor_tick: yup.number().required('Informe o Valor de cada Tick'),
    pts_tick: yup.number().required('Informe quantos Pts move cada Tick'),
});

const NovoAtivo = (props) => {
    const [isEdit, editID] = [props.editar !== undefined, props.editar?.id];

    /**********
     * DISPATCH
     **********/
    const dispatch = useDispatch();

    /***********
     * NAVIGATE
     ***********/
    const navigate = useNavigate();

    /*********
     * STATES
     *********/
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [isSendLoading, setIsSendLoading] = useState(false);
    const [asyncData, setAsyncData] = useState(null);

    /***********
     * HANDLERS
     ***********/
    const handleFormikSubmit__Novo = useCallback(
        (values) => {
            setIsSendLoading(true);
            axiosCon
                .post('/ativo/novo', values)
                .then((resp) => {
                    dispatch(
                        add({
                            message: 'Ativo cadastrado',
                            severity: 'success',
                        })
                    );
                    formik.resetForm();
                    setIsSendLoading(false);
                })
                .catch((error) => {
                    if (error.response) {
                        if (error.response.status === 401) dispatch(handleLogout());
                        else if (error.response.status === 403) navigate('/daytrade/dashboard', { replace: true });
                        else if (error.response.status === 500) {
                            dispatch(
                                add({
                                    message: error.response.data,
                                    severity: 'error',
                                })
                            );
                        }
                    } else console.log('Error Axios: ', error.message);
                    setIsSendLoading(false);
                });
        },
        [dispatch, navigate]
    );

    const handleFormikSubmit__Edita = useCallback(
        (values) => {
            // Busca apenas campos alterados
            let changedKeys = Object.keys(values).filter((key) => {
                return values[key] !== asyncData[key];
            });
            const changedValues = {};
            changedKeys.forEach((key) => {
                changedValues[key] = values[key];
            });
            if (!isObjectEmpty(changedValues)) {
                setIsSendLoading(true);
                axiosCon
                    .put(`/ativo/edita/${editID}`, changedValues)
                    .then((resp) => {
                        dispatch(
                            add({
                                message: 'Ativo alterado',
                                severity: 'success',
                            })
                        );
                        setAsyncData((prevState) => resp.data.ativo);
                        setIsSendLoading(false);
                    })
                    .catch((error) => {
                        if (error.response) {
                            if (error.response.status === 401) dispatch(handleLogout());
                            else if (error.response.status === 403) navigate('/daytrade/dashboard', { replace: true });
                            else if (error.response.status === 500) {
                                dispatch(
                                    add({
                                        message: error.response.data,
                                        severity: 'error',
                                    })
                                );
                            }
                        } else console.log('Error Axios: ', error.message);
                        setIsSendLoading(false);
                    });
            }
        },
        [editID, dispatch, navigate, asyncData]
    );

    /*******************
     * FORMIK DATA LOAD
     *******************/
    useEffect(() => {
        const abortController = new AbortController();
        if (isEdit) {
            axiosCon
                .get(`/ativo/list_edita/${editID}`, { signal: abortController.signal })
                .then((resp) => {
                    // Se por algum motivo veio sem os dados do Ativo
                    if (resp.data.ativo === null) {
                        dispatch(
                            add({
                                message: 'Informações do Ativo inexistentes',
                                severity: 'error',
                            })
                        );
                        return;
                    }

                    setAsyncData((prevState) => resp.data.ativo);
                    setIsInitialLoading(false);
                })
                .catch((error) => {
                    if (error.response) {
                        if (error.response.status === 401) dispatch(handleLogout());
                        else if (error.response.status === 403) navigate('/daytrade/dashboard', { replace: true });
                    } else console.log('Error Axios: ', error.message);
                });
        } else setIsInitialLoading(false);
        return () => {
            abortController.abort();
        };
    }, [isEdit, editID, dispatch, navigate]);

    /*********
     * FORMIK
     *********/
    const formik = useFormik({
        initialValues: {
            nome: asyncData?.nome ?? '',
            custo: asyncData?.custo ?? '',
            valor_tick: asyncData?.valor_tick ?? '',
            pts_tick: asyncData?.pts_tick ?? '',
        },
        enableReinitialize: true,
        validationSchema: validationSchema,
        onSubmit: isEdit ? handleFormikSubmit__Edita : handleFormikSubmit__Novo,
    });

    return (
        <>
            <MessageController overlay={true} />
            <Box
                className={gStyles.wrapper}
                component={motion.div}
                initial={{ y: '-100vh' }}
                animate={{ y: 0, transition: { duration: 0.25 } }}
                exit={{ transition: { duration: 0.1 } }}
            >
                <Stack direction='column' spacing={2} alignItems='strech' sx={{ height: '100%' }}>
                    <div className={gStyles.title_panel}>
                        <Breadcrumbs separator={<NavigateNext fontSize='small' />}>
                            <Typography className={gStyles.title_link} variant='overline' component={Link} to='/daytrade/dashboard' replace={true}>
                                Daytrade
                            </Typography>
                            <Typography className={gStyles.title_link} variant='overline' component={Link} to='/daytrade/ativos' replace={true}>
                                Ativos
                            </Typography>
                            <Typography className={gStyles.title} variant='overline'>
                                {isEdit ? `Editar` : 'Novo'}
                            </Typography>
                        </Breadcrumbs>
                    </div>
                    <Divider />
                    <div className={styles.form_panel}>
                        <Paper className={styles.form_container} sx={{ p: 5 }}>
                            {isInitialLoading ? (
                                <AtivoNovoSkeleton />
                            ) : (
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
                                                error={formik.touched.nome && Boolean(formik.errors.nome)}
                                                helperText={formik.touched.nome && formik.errors.nome}
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextField
                                                label='Custo'
                                                variant='outlined'
                                                name='custo'
                                                sx={{ width: '100%' }}
                                                value={formik.values.custo}
                                                onChange={formik.handleChange}
                                                error={formik.touched.custo && Boolean(formik.errors.custo)}
                                                helperText={formik.touched.custo && formik.errors.custo}
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextField
                                                label='Valor do Tick'
                                                variant='outlined'
                                                name='valor_tick'
                                                sx={{ width: '100%' }}
                                                value={formik.values.valor_tick}
                                                onChange={formik.handleChange}
                                                error={formik.touched.valor_tick && Boolean(formik.errors.valor_tick)}
                                                helperText={formik.touched.valor_tick && formik.errors.valor_tick}
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextField
                                                label='Pts por Tick'
                                                variant='outlined'
                                                name='pts_tick'
                                                sx={{ width: '100%' }}
                                                value={formik.values.pts_tick}
                                                onChange={formik.handleChange}
                                                error={formik.touched.pts_tick && Boolean(formik.errors.pts_tick)}
                                                helperText={formik.touched.pts_tick && formik.errors.pts_tick}
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <LoadingButton
                                                loading={isSendLoading}
                                                variant='contained'
                                                color='primary'
                                                type='submit'
                                                endIcon={<KeyboardDoubleArrowUp />}
                                                sx={{ width: '100%' }}
                                            >
                                                {isEdit ? 'Atualizar' : 'Enviar'}
                                            </LoadingButton>
                                        </Grid>
                                    </Grid>
                                </form>
                            )}
                        </Paper>
                    </div>
                </Stack>
            </Box>
        </>
    );
};

export default NovoAtivo;
