import styles from './datasets-novo.module.scss';
import DatasetNovoSkeleton from './Skeleton';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { LoadingButton } from '@mui/lab';
import {
    Box,
    Grid,
    Paper,
    Stack,
    TextField,
    Typography,
    Breadcrumbs,
    Divider,
    Select,
    FormControl,
    InputLabel,
    MenuItem,
    Autocomplete,
    Checkbox,
    ListItemText,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { NavigateNext, KeyboardDoubleArrowUp, CheckBoxOutlineBlank, CheckBox } from '@mui/icons-material';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import Editor from 'ckeditor5-custom-build/build/ckeditor';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { add, remove } from '../../../../../store/snack-messages/snack-messages-slice';
import SnackOverlay from '../../../../../components/ui/SnackOverlay';
import axiosCon from '../../../../../helpers/axios-con';

const validationSchema = yup.object({
    nome: yup.string().trim().required('Informe nome do Dataset'),
});

const NovoDataset = (props) => {
    const [isEdit, editID] = [props.editar !== undefined, props.editar?.id];

    /**********
     * DISPATCH
     **********/
    const dispatch = useDispatch();

    /*********
     * STATES
     *********/
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [isSendLoading, setIsSendLoading] = useState(false);
    const [asyncData, setAsyncData] = useState(null);
    const { snacks } = useSelector((store) => store.snackMessages);

    useEffect(() => {
        axiosCon
            .get(isEdit ? `/dataset/list_edita/${editID}` : '/dataset/list_novo')
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

                const newState = { usuarios: resp.data.usuarios };

                // Aloca e prepara os dados para o formulario de Dataset
                if (resp.data.dataset !== null) {
                    let dataset_usuarios__raw = resp.data.dataset.usuarios.split(';').map((val) => parseInt(val)),
                        dataset_usuarios = [];
                    for (let d_u of dataset_usuarios__raw) {
                        for (let u = 0; u < newState.usuarios.length; u++) {
                            if (newState.usuarios[u].id === d_u) {
                                dataset_usuarios.push(newState.usuarios[u]);
                                break;
                            }
                        }
                    }
                    newState.dataset = {
                        ...resp.data.dataset,
                        usuarios: dataset_usuarios,
                    };
                }

                setAsyncData((prevState) => newState);
                setIsInitialLoading(false);
            })
            .catch((error) => {
                if (error.response) {
                    if (error.response.status === 401)
                        dispatch(
                            add({
                                message: 'Não Autorizado',
                                severity: 'error',
                            })
                        );
                } else {
                    dispatch(
                        add({
                            message: error.message,
                            severity: 'error',
                        })
                    );
                }
            });
    }, [isEdit, editID, dispatch]);

    /********
     * FORMS
     ********/
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
        onSubmit: (values) => {
            console.log(values);
            setIsSendLoading(true);
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
