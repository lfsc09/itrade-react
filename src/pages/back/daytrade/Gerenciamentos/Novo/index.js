import { Add, KeyboardDoubleArrowUp, NavigateNext } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import { Box, Breadcrumbs, Button, ButtonGroup, Divider, Grid, Paper, Stack, TextField, Typography } from '@mui/material';
import { useFormik } from 'formik';
import { motion } from 'framer-motion';
import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import * as yup from 'yup';

import gStyles from '../../../../../assets/back/scss/global.module.scss';
import SnackOverlay from '../../../../../components/ui/SnackOverlay';
import axiosCon from '../../../../../helpers/axios-con';
import { isObjectEmpty } from '../../../../../helpers/global';
import { handleLogout } from '../../../../../store/auth/auth-action';
import { add, remove } from '../../../../../store/snack-messages/snack-messages-slice';
import styles from './gerenciamentos-novo.module.scss';
import GerenciamentoNovoSkeleton from './Skeleton';

const validationSchema = yup.object({
    nome: yup.string().trim().required('Informe nome do Gerenciamento'),
});

const NovoGerenciamento = (props) => {
    const [isEdit, editID] = [props.editar !== undefined, props.editar?.id];

    /**********
     * DISPATCH
     **********/
    const dispatch = useDispatch();

    /***********
     * NAVIGATE
     ***********/
    const navigate = useNavigate();

    /******************
     * SNACKS SELECTOR
     ******************/
    const { snacks } = useSelector((store) => store.snackMessages);

    /*********
     * STATES
     *********/
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [isSendLoading, setIsSendLoading] = useState(false);
    const [asyncData, setAsyncData] = useState(null);
    const [acaoPositivo, setAcaoPositivo] = useState('');
    const [escaladaPositivo, setEscaladaPositivo] = useState('');
    const [acaoNegativo, setAcaoNegativo] = useState('');
    const [escaladaNegativo, setEscaladaNegativo] = useState('');

    /***********
     * HANDLERS
     ***********/
    const handleFormikSubmit__Novo = useCallback(
        (values) => {
            setIsSendLoading(true);
            let treatedValues = {
                nome: values.nome,
                acoes: [],
                escaladas: [],
            };
            for (let gerenc of values.acoes) {
                treatedValues.acoes.push(gerenc.acao);
                treatedValues.escaladas.push(gerenc.escalada);
            }
            if (treatedValues.acoes.length > 0) {
                treatedValues.acoes = JSON.stringify(treatedValues.acoes);
                treatedValues.escaladas = JSON.stringify(treatedValues.escaladas);
                axiosCon
                    .post('/gerenciamento/novo', treatedValues)
                    .then((resp) => {
                        dispatch(
                            add({
                                message: 'Gerenciamento cadastrado',
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
                        } else {
                            dispatch(
                                add({
                                    message: error.message,
                                    severity: 'error',
                                })
                            );
                        }
                        setIsSendLoading(false);
                    });
            } else
                dispatch(
                    add({
                        message: 'Especifique as saidas de Gain e/ou Loss',
                        severity: 'error',
                    })
                );
        },
        [dispatch, navigate]
    );

    const handleFormikSubmit__Edita = useCallback(
        (values) => {
            // Busca apenas campos alterados
            let changedKeys = Object.keys(values).filter((key) => {
                if (key === 'acoes') {
                    if (values[key].length !== asyncData[key].length) return true;
                    const initial_acoes = asyncData[key].reduce((l, cur) => {
                        l.push(`${cur.acao}_${cur.escalada}_${cur.key}`);
                        return l;
                    }, []);
                    for (let g_i = 0; g_i < values[key].length; g_i++) {
                        if (!initial_acoes.includes(`${values[key][g_i].acao}_${values[key][g_i].escalada}_${values[key][g_i].key}`)) return true;
                    }
                    return false;
                }
                return values[key] !== asyncData[key];
            });
            const changedValues = {};
            changedKeys.forEach((key) => {
                if (key === 'acoes') {
                    changedValues.acoes = [];
                    changedValues.escaladas = [];
                    for (let gerenc of values[key]) {
                        changedValues.acoes.push(gerenc.acao);
                        changedValues.escaladas.push(gerenc.escalada);
                    }
                } else changedValues[key] = values[key];
            });
            if ('acoes' in changedValues) {
                if (changedValues.acoes.length > 0) {
                    changedValues.acoes = JSON.stringify(changedValues.acoes);
                    changedValues.escaladas = JSON.stringify(changedValues.escaladas);
                } else {
                    dispatch(
                        add({
                            message: 'Especifique as saidas de Gain e/ou Loss',
                            severity: 'error',
                        })
                    );
                    return true;
                }
            }
            if (!isObjectEmpty(changedValues)) {
                setIsSendLoading(true);
                axiosCon
                    .put(`/gerenciamento/edita/${editID}`, changedValues)
                    .then((resp) => {
                        dispatch(
                            add({
                                message: 'Gerenciamento alterado',
                                severity: 'success',
                            })
                        );
                        setAsyncData((prevState) => resp.data.gerenciamento);
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
                        } else {
                            dispatch(
                                add({
                                    message: error.message,
                                    severity: 'error',
                                })
                            );
                        }
                        setIsSendLoading(false);
                    });
            }
        },
        [editID, dispatch, navigate, asyncData]
    );

    const handleAcaoPositivo = useCallback((e) => {
        setAcaoPositivo((preState) => e.target.value);
    }, []);
    const handleEscaladaPositivo = useCallback((e) => {
        setEscaladaPositivo((prevState) => e.target.value);
    }, []);
    const handleAddPositivo = useCallback(() => {
        if (acaoPositivo !== '') {
            let newAcoes = [
                ...formik.values.acoes,
                {
                    key: formik.values.acoes.length + 1,
                    acao: parseInt(acaoPositivo),
                    escalada: escaladaPositivo !== '' ? parseInt(escaladaPositivo) : 0,
                },
            ];
            formik.setFieldValue('acoes', newAcoes);
            setAcaoPositivo('');
            setEscaladaPositivo('');
        }
    }, [acaoPositivo, escaladaPositivo]);
    const handleAcaoNegativo = useCallback((e) => {
        setAcaoNegativo((prevState) => e.target.value);
    }, []);
    const handleEscaladaNegativo = useCallback((e) => {
        setEscaladaNegativo((prevState) => e.target.value);
    }, []);
    const handleAddNegativo = useCallback(() => {
        if (acaoNegativo !== '') {
            let newAcoes = [
                ...formik.values.acoes,
                {
                    key: formik.values.acoes.length + 1,
                    acao: -parseInt(acaoNegativo),
                    escalada: escaladaNegativo !== '' ? parseInt(escaladaNegativo) : 0,
                },
            ];
            formik.setFieldValue('acoes', newAcoes);
            setAcaoNegativo('');
            setEscaladaNegativo('');
        }
    }, [acaoNegativo, escaladaNegativo]);

    /*******************
     * FORMIK DATA LOAD
     *******************/
    useEffect(() => {
        if (isEdit) {
            axiosCon
                .get(`/gerenciamento/list_edita/${editID}`)
                .then((resp) => {
                    // Se por algum motivo veio sem os dados do Ativo
                    if (resp.data.gerenciamento === null) {
                        dispatch(
                            add({
                                message: 'Informações do Gerenciamento inexistentes',
                                severity: 'error',
                            })
                        );
                        return;
                    }

                    setAsyncData((prevState) => resp.data.gerenciamento);
                    setIsInitialLoading(false);
                })
                .catch((error) => {
                    if (error.response) {
                        if (error.response.status === 401) dispatch(handleLogout());
                        else if (error.response.status === 403) navigate('/daytrade/dashboard', { replace: true });
                    } else {
                        dispatch(
                            add({
                                message: error.message,
                                severity: 'error',
                            })
                        );
                    }
                });
        } else setIsInitialLoading(false);
    }, [isEdit, editID, dispatch, navigate]);

    /*********
     * FORMIK
     *********/
    const formik = useFormik({
        initialValues: {
            nome: asyncData?.nome ?? '',
            acoes: asyncData?.acoes ?? [],
        },
        enableReinitialize: true,
        validationSchema: validationSchema,
        onSubmit: isEdit ? handleFormikSubmit__Edita : handleFormikSubmit__Novo,
    });

    /***************************************
     * AÇÕES (GAIN/LOSS) REMOVE BTN HANDLER
     ***************************************/
    const handleRemoveAcao = useCallback(
        (key) => {
            let newAcoes = formik.values.acoes.filter((gerenc) => gerenc.key !== key);
            formik.setFieldValue('acoes', newAcoes);
        },
        [formik.values.acoes]
    );

    return (
        <>
            {snacks.map((item) => (
                <SnackOverlay key={item.key} open={true} severity={item.severity} onClose={() => dispatch(remove(item.key))}>
                    {item.message}
                </SnackOverlay>
            ))}
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
                            <Typography className={gStyles.title_link} variant='overline' component={Link} to='/daytrade/gerenciamentos' replace={true}>
                                Gerenciamentos
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
                                <GerenciamentoNovoSkeleton />
                            ) : (
                                <form onSubmit={formik.handleSubmit}>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sx={{ mb: 2 }}>
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
                                        <Grid container item spacing={2} md={6} xs={12}>
                                            <Grid item md={6} xs={12}>
                                                <TextField
                                                    label='Scalps de Gain'
                                                    size='small'
                                                    variant='outlined'
                                                    name='acao_gain'
                                                    sx={{ width: '100%' }}
                                                    value={acaoPositivo}
                                                    onChange={handleAcaoPositivo}
                                                />
                                            </Grid>
                                            <Grid item md={6} xs={12}>
                                                <TextField
                                                    label='Qtd Escalada'
                                                    size='small'
                                                    variant='outlined'
                                                    name='escalada_gain'
                                                    sx={{ width: '100%' }}
                                                    value={escaladaPositivo}
                                                    onChange={handleEscaladaPositivo}
                                                />
                                            </Grid>
                                            <Grid item xs={12}>
                                                <Button variant='contained' size='small' color='success' endIcon={<Add />} sx={{ width: '100%' }} onClick={handleAddPositivo}>
                                                    Adicionar Gain
                                                </Button>
                                            </Grid>
                                        </Grid>
                                        <Grid container item spacing={2} md={6} xs={12}>
                                            <Grid item md={6} xs={12}>
                                                <TextField
                                                    label='Scalps de Loss'
                                                    size='small'
                                                    variant='outlined'
                                                    name='acao_loss'
                                                    sx={{ width: '100%' }}
                                                    value={acaoNegativo}
                                                    onChange={handleAcaoNegativo}
                                                />
                                            </Grid>
                                            <Grid item md={6} xs={12}>
                                                <TextField
                                                    label='Qtd Escalada'
                                                    size='small'
                                                    variant='outlined'
                                                    name='escalada_loss'
                                                    sx={{ width: '100%' }}
                                                    value={escaladaNegativo}
                                                    onChange={handleEscaladaNegativo}
                                                />
                                            </Grid>
                                            <Grid item xs={12}>
                                                <Button variant='contained' size='small' color='error' endIcon={<Add />} sx={{ width: '100%' }} onClick={handleAddNegativo}>
                                                    Adicionar Loss
                                                </Button>
                                            </Grid>
                                        </Grid>
                                        <Grid item xs={12} sx={{ my: 2 }}>
                                            <ButtonGroup variant='contained' size='small' className={styles.btn_group}>
                                                {formik.values.acoes
                                                    .sort((a, b) => b.acao - a.acao)
                                                    .map((gerenc) => (
                                                        <Button
                                                            key={gerenc.key}
                                                            className={`${styles.btn} ${gerenc.acao > 0 ? styles.positive : styles.negative}`}
                                                            onClick={() => handleRemoveAcao(gerenc.key)}
                                                        >
                                                            {Math.abs(gerenc.acao)}S{gerenc.escalada !== 0 ? ` E${gerenc.escalada}` : ''}
                                                        </Button>
                                                    ))}
                                            </ButtonGroup>
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

export default NovoGerenciamento;
