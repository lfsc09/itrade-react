import { CKEditor } from '@ckeditor/ckeditor5-react';
import { CheckBox, CheckBoxOutlineBlank, KeyboardDoubleArrowUp, NavigateNext } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import {
    Autocomplete,
    Box,
    Breadcrumbs,
    Checkbox,
    Divider,
    FormControl,
    Grid,
    InputLabel,
    ListItemText,
    MenuItem,
    Paper,
    Select,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import Editor from 'ckeditor5-custom-build/build/ckeditor';
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
import styles from './datasets-novo.module.scss';
import DatasetNovoSkeleton from './Skeleton';

const validationSchema = yup.object({
    nome: yup.string().trim().required('Informe nome do Dataset'),
});

const NovoDataset = (props) => {
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
    const asyncData__processDataset = useCallback((usuarios, dataset) => {
        let dataset_usuarios__raw = dataset.usuarios.split(';').map((val) => parseInt(val)),
            dataset_usuarios = [];
        for (let d_u of dataset_usuarios__raw) {
            for (let u = 0; u < usuarios.length; u++) {
                if (usuarios[u].id === d_u) {
                    dataset_usuarios.push(usuarios[u]);
                    break;
                }
            }
        }
        return {
            ...dataset,
            usuarios: dataset_usuarios,
        };
    }, []);

    const handleFormikSubmit__Novo = useCallback(
        (values) => {
            setIsSendLoading(true);
            axiosCon
                .post('/dataset/novo', values)
                .then((resp) => {
                    dispatch(
                        add({
                            message: 'Dataset criado',
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
        },
        [dispatch, navigate]
    );

    const handleFormikSubmit__Edita = useCallback(
        (values) => {
            // Busca apenas campos alterados
            let changedKeys = Object.keys(values).filter((key) => {
                if (key === 'usuarios') {
                    if (values[key].length !== asyncData.dataset[key].length) return true;
                    const initial_sel_id_usuarios = asyncData.dataset[key].reduce((l, cur) => {
                        l.push(cur.id);
                        return l;
                    }, []);
                    for (let u_i = 0; u_i < values[key].length; u_i++) {
                        if (!initial_sel_id_usuarios.includes(values[key][u_i].id)) return true;
                    }
                    return false;
                }
                return values[key] !== asyncData.dataset[key];
            });
            const changedValues = {};
            changedKeys.forEach((key) => {
                changedValues[key] = values[key];
            });
            if (!isObjectEmpty(changedValues)) {
                setIsSendLoading(true);
                axiosCon
                    .put(`/dataset/edita/${editID}`, changedValues)
                    .then((resp) => {
                        dispatch(
                            add({
                                message: 'Dataset alterado',
                                severity: 'success',
                            })
                        );
                        setAsyncData((prevState) => ({
                            ...prevState,
                            dataset: asyncData__processDataset(prevState.usuarios, resp.data.dataset),
                        }));
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
        [editID, dispatch, navigate, asyncData__processDataset, asyncData]
    );

    /*******************
     * FORMIK DATA LOAD
     *******************/
    useEffect(() => {
        const abortController = new AbortController();
        axiosCon
            .get(isEdit ? `/dataset/list_edita/${editID}` : '/dataset/list_novo', { signal: abortController.signal })
            .then((resp) => {
                // Se por algum motivo veio sem os dados do Dataset
                if (isEdit && resp.data.dataset === null) {
                    dispatch(
                        add({
                            message: 'Informações do Dataset inexistentes',
                            severity: 'error',
                        })
                    );
                    return;
                }

                // Ja aloca os a lista de usuarios disponiveis para serem alocados nos Datasets
                const newState = { usuarios: resp.data.usuarios };

                // Aloca e prepara o resto dos dados para o formulario de Dataset
                if (resp.data.dataset !== null) newState.dataset = asyncData__processDataset(newState.usuarios, resp.data.dataset);

                setAsyncData((prevState) => newState);
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
        return () => {
            abortController.abort();
        };
    }, [isEdit, editID, dispatch, navigate, asyncData__processDataset]);

    /*********
     * FORMIK
     *********/
    const formik = useFormik({
        initialValues: {
            nome: asyncData?.dataset?.nome ?? '',
            situacao: asyncData?.dataset?.situacao ?? 2,
            tipo: asyncData?.dataset?.tipo ?? 1,
            usuarios: asyncData?.dataset?.usuarios ?? [],
            observacao: asyncData?.dataset?.observacao ?? '',
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
                            <Typography className={gStyles.title_link} variant='overline' component={Link} to='/daytrade/datasets' replace={true}>
                                Datasets
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
                                <DatasetNovoSkeleton />
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
                                        <Grid item xs={6}>
                                            <FormControl sx={{ width: '100%' }}>
                                                <InputLabel id='situacao_select_label'>Situação</InputLabel>
                                                <Select
                                                    label='Situação'
                                                    labelId='situacao_select_label'
                                                    name='situacao'
                                                    value={formik.values.situacao}
                                                    onChange={formik.handleChange}
                                                >
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
                                            <Autocomplete
                                                multiple
                                                name='usuarios'
                                                options={asyncData.usuarios}
                                                value={formik.values.usuarios}
                                                onChange={(e, value) => {
                                                    formik.setFieldValue('usuarios', value);
                                                }}
                                                disableCloseOnSelect
                                                isOptionEqualToValue={(option, value) => option.id === value.id}
                                                getOptionLabel={(option) => option.usuario}
                                                renderOption={(props, option, { selected }) => (
                                                    <li {...props}>
                                                        <Checkbox
                                                            icon={<CheckBoxOutlineBlank fontSize='small' />}
                                                            checkedIcon={<CheckBox fontSize='small' />}
                                                            style={{ marginRight: 8 }}
                                                            checked={selected}
                                                        />
                                                        <ListItemText primary={option.nome} secondary={option.usuario} />
                                                    </li>
                                                )}
                                                style={{ width: '100%' }}
                                                renderInput={(params) => <TextField {...params} label='Usuarios com Acesso' placeholder='' />}
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <CKEditor
                                                editor={Editor}
                                                data={formik.values.observacao}
                                                onChange={(event, editor) => {
                                                    formik.setFieldValue('observacao', editor.getData());
                                                }}
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

export default NovoDataset;
