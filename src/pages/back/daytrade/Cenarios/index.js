import { Add, CheckBox, CheckBoxOutlineBlank, ContentCopy, KeyboardDoubleArrowUp, NavigateNext } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import {
    Autocomplete,
    Box,
    Breadcrumbs,
    Button,
    Checkbox,
    Divider,
    FormControl,
    Grid,
    InputLabel,
    LinearProgress,
    ListItemText,
    MenuItem,
    Paper,
    Select,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import { motion } from 'framer-motion';
import React, { useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import { batch, useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';

import gStyles from '../../../../assets/back/scss/global.module.scss';
import ConfirmDialog from '../../../../components/ui/ConfirmDialog';
import NoContent from '../../../../components/ui/NoContent';
import SnackOverlay from '../../../../components/ui/SnackOverlay';
import axiosCon from '../../../../helpers/axios-con';
import { generateHash } from '../../../../helpers/global';
import { handleLogout } from '../../../../store/auth/auth-action';
import { add, remove } from '../../../../store/snack-messages/snack-messages-slice';
import CenarioItem from './CenarioItem';
import styles from './cenarios.module.scss';
import { reducer as dataReducer, INI_STATE as DGR_INI_STATE, TYPES as DGR_TYPES } from './dataReducer';

const Cenarios = () => {
    /***********
     * DISPATCH
     ***********/
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
    const [dataset, setDataset] = useState(null);
    const [datasetCopy, setDatasetCopy] = useState(0);
    const [cenarioCopy, setCenarioCopy] = useState(0);
    const [datasetSuggest, setDatasetSuggest] = useState([]);

    /***************
     * DATA REDUCER
     ***************/
    const [dataState, dataDispatch] = useReducer(dataReducer, DGR_INI_STATE);

    /********************************
     * DATASET AUTOCOMPLETE HANDLERS
     ********************************/
    const handleDatasetAutocomplete = useCallback((e, values) => {
        setDataset((prevState) => values);
    }, []);

    /************************
     * COPY PICKERS HANDLERS
     ************************/
    const handleChangeDatasetCopy = useCallback(({ target: { value: value } }) => {
        setDatasetCopy((prevState) => value);
    }, []);

    const handleChangeCenarioCopy = useCallback(({ target: { value: value } }) => {
        setCenarioCopy((prevState) => value);
    }, []);

    const handleCenarioCopy = useCallback(() => {
        const newRows = [];
        const newRow = { id: `new_${generateHash(6)}`, nome: '', observacoes: [] };
        // Copia os cenarios ja carregados
        for (let row of dataState.rows) {
            if (cenarioCopy === row.id) newRow.observacoes = [...row.observacoes];
            newRows.push({ ...row, observacoes: [...row.observacoes] });
        }
        // Joga o novo cenario no começo
        newRows.unshift(newRow);
        // Reseta o select
        setCenarioCopy(0);
        dataDispatch({ type: DGR_TYPES.ROWS_UPDATED, payload: newRows });
    }, [cenarioCopy, dataState.rows]);

    const handleDatasetCopy = useCallback(() => {
        axiosCon
            .post('/cenario/list_datarows', {
                id_dataset: datasetCopy,
            })
            .then((resp) => {
                const newRows = [];
                // Copia os cenarios ja carregados
                for (let row of dataState.rows) newRows.push({ ...row, observacoes: [...row.observacoes] });
                // Copia os cenarios que devem ser adicionados
                for (let fetchedRow of resp.data.datarows) {
                    let skip = newRows.reduce((res, curr) => res || curr.nome === fetchedRow.nome, false);
                    if (!skip) {
                        let newRow = { id: `new_${generateHash(6)}`, nome: fetchedRow.nome, observacoes: fetchedRow.observacoes };
                        // Joga o novo cenario no começo
                        newRows.unshift(newRow);
                    }
                }
                // Reseta o select
                setDatasetCopy(0);
                dataDispatch({ type: DGR_TYPES.ROWS_UPDATED, payload: newRows });
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
                // Reseta o select
                setDatasetCopy(0);
                dataDispatch({ type: DGR_TYPES.STOP_LOADING });
            });
    }, [datasetCopy, dataState.rows, dispatch, navigate]);

    /****************
     * DATA HANDLERS
     ****************/
    // const handlerDeletaCenarioAction = useCallback(
    //     (id) => () => {
    //         dataDispatch({ type: DGR_TYPES.DELETE_CONFIRM, payload: id });
    //     },
    //     []
    // );

    // const handleDeleteConfirm_No = useCallback(() => {
    //     dataDispatch({ type: DGR_TYPES.DELETE_CONFIRM, payload: null });
    // }, []);

    // const handleDeleteConfirm_Yes = useCallback(() => {
    //     axiosCon
    //         .delete(`/cenario/deleta/${dataState.idRowDeleteConfirm}`)
    //         .then((resp) => {
    //             dispatch(
    //                 add({
    //                     message: 'Cenario removido',
    //                     severity: 'success',
    //                 })
    //             );
    //             batch(() => {
    //                 dataDispatch({ type: DGR_TYPES.DELETE_CONFIRM, payload: null });
    //                 dataDispatch({ type: DGR_TYPES.FORCE_RELOAD });
    //             });
    //         })
    //         .catch((error) => {
    //             if (error.response) {
    //                 if (error.response.status === 401) dispatch(handleLogout());
    //                 else if (error.response.status === 403) navigate('/daytrade/dashboard', { replace: true });
    //                 else if (error.response.status === 500) {
    //                     dispatch(
    //                         add({
    //                             message: error.response.data,
    //                             severity: 'error',
    //                         })
    //                     );
    //                 }
    //             } else {
    //                 dispatch(
    //                     add({
    //                         message: error.message,
    //                         severity: 'error',
    //                     })
    //                 );
    //             }
    //             // setIsSendLoading(false);
    //         });
    // }, [dispatch, navigate, dataState.idRowDeleteConfirm]);

    /****************
     * DATAGRID MISC
     ****************/
    // const columns = useMemo(
    //     () => [
    //         { field: 'nome', headerName: 'Nome', flex: 1, cellClassName: styles.table_cell__nome },
    //         { field: 'acoes', headerName: 'Ações', type: 'number', flex: 1, cellClassName: styles.table_cell__acoes, renderCell: acoesCell },
    //         {
    //             field: 'actions',
    //             type: 'actions',
    //             width: 120,
    //             getActions: (params) => [
    //                 <GridActionsCellItem icon={<DriveFileRenameOutline />} label='Editar' onClick={handlerEditaDatagridAction(params.id)} />,
    //                 <GridActionsCellItem icon={<Delete />} label='Apagar' onClick={handlerDeletaDatagridAction(params.id)} />,
    //             ],
    //         },
    //     ],
    //     [handlerEditaDatagridAction, handlerDeletaDatagridAction]
    // );

    /****************************
     * DATASET AUTOCOMPLETE LOAD
     ****************************/
    // Carregamento do select de Datasets
    useEffect(() => {
        axiosCon
            .get('/dataset/list_suggest?place=cenario__picker__nome')
            .then((resp) => {
                setDatasetSuggest(resp.data.suggestion);
            })
            .catch((error) => {
                if (error.response) {
                    if (error.response.status === 401) dispatch(handleLogout());
                    else if (error.response.status === 403) navigate('/daytrade/dashboard', { replace: true });
                    else if (error.response.status === 500) {
                        console.log('Error Suggest: ', error.response.data);
                    }
                } else {
                    console.log('Error Suggest: ', error.message);
                }
            });
    }, []);

    /************
     * DATA LOAD
     ************/
    useEffect(() => {
        // Carrega apenas depois que ja foi escolhido um Dataset
        if (dataset !== null)
            axiosCon
                .post('/cenario/list_datarows', {
                    id_dataset: dataset?.id,
                })
                .then((resp) => {
                    dataDispatch({ type: DGR_TYPES.ROWS_UPDATED__FETCH, payload: resp.data.datarows });
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
                    dataDispatch({ type: DGR_TYPES.STOP_LOADING });
                });
    }, [dataset?.id, dispatch, navigate]);

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
                <Stack direction='column' spacing={2} sx={{ height: '100%' }}>
                    <div className={gStyles.title_panel}>
                        <Breadcrumbs separator={<NavigateNext fontSize='small' />}>
                            <Typography className={gStyles.title_link} variant='overline' component={Link} to='/daytrade/dashboard' replace={true}>
                                Daytrade
                            </Typography>
                            <Typography className={gStyles.title} variant='overline'>
                                Cenários
                            </Typography>
                        </Breadcrumbs>
                    </div>
                    <Divider />
                    <div className={styles.picker_panel}>
                        <Paper elevation={0}>
                            <Autocomplete
                                name='dataset'
                                options={datasetSuggest}
                                value={dataset}
                                onChange={handleDatasetAutocomplete}
                                isOptionEqualToValue={(option, value) => option.id === value.id}
                                getOptionLabel={(option) => option.nome}
                                renderOption={(props, option, { selected }) => (
                                    <li {...props}>
                                        <Checkbox
                                            icon={<CheckBoxOutlineBlank fontSize='small' />}
                                            checkedIcon={<CheckBox fontSize='small' />}
                                            style={{ marginRight: 8 }}
                                            checked={selected}
                                        />
                                        <ListItemText primary={option.nome} />
                                    </li>
                                )}
                                style={{ width: '100%' }}
                                renderInput={(params) => <TextField {...params} label='Dataset' placeholder='' />}
                            />
                        </Paper>
                    </div>
                    {dataset !== null ? (
                        <>
                            <Paper sx={{ p: 1, pt: 2 }}>
                                <Grid container spacing={2}>
                                    <Grid item md={6} xs={12}>
                                        <Stack direction='row' spacing={1}>
                                            <FormControl sx={{ flexGrow: 4 }}>
                                                <InputLabel id='copy_dataset_select_label'>Copiar do Dataset</InputLabel>
                                                <Select
                                                    label='Copiar do Dataset'
                                                    labelId='copy_dataset_select_label'
                                                    name='copy_dataset'
                                                    size='small'
                                                    value={datasetCopy}
                                                    onChange={handleChangeDatasetCopy}
                                                >
                                                    <MenuItem key={0} value={0}>
                                                        ---
                                                    </MenuItem>
                                                    {datasetSuggest.map((row) =>
                                                        dataset?.id !== row.id ? (
                                                            <MenuItem key={row.id} value={row.id}>
                                                                {row.nome}
                                                            </MenuItem>
                                                        ) : (
                                                            ''
                                                        )
                                                    )}
                                                </Select>
                                            </FormControl>
                                            <Button variant='outlined' sx={{ flexGrow: 1 }} endIcon={<ContentCopy />} onClick={handleDatasetCopy}>
                                                Copiar
                                            </Button>
                                        </Stack>
                                    </Grid>
                                    <Grid item md={6} xs={12}>
                                        <Stack direction='row' spacing={1}>
                                            <FormControl sx={{ flexGrow: 4 }}>
                                                <InputLabel id='copy_dataset_select_label'>Copiar Cenário</InputLabel>
                                                <Select
                                                    label='Copiar Cenário'
                                                    labelId='copy_cenario_select_label'
                                                    name='copy_cenario'
                                                    size='small'
                                                    value={cenarioCopy}
                                                    onChange={handleChangeCenarioCopy}
                                                >
                                                    <MenuItem key={0} value={0}>
                                                        Novo Cenário
                                                    </MenuItem>
                                                    {dataState.rows.map((row) =>
                                                        row.nome !== '' || row.observacoes.length > 0 ? (
                                                            <MenuItem key={row.id} value={row.id}>
                                                                {row.nome}
                                                            </MenuItem>
                                                        ) : (
                                                            ''
                                                        )
                                                    )}
                                                </Select>
                                            </FormControl>
                                            <Button variant='outlined' sx={{ flexGrow: 1 }} endIcon={<Add />} onClick={handleCenarioCopy}>
                                                {cenarioCopy === 0 ? 'Criar' : 'Copiar'}
                                            </Button>
                                        </Stack>
                                    </Grid>
                                </Grid>
                            </Paper>
                            {dataState.rows.length > 0 ? (
                                <>
                                    <div className={styles.cenarios_panel}>
                                        <Stack spacing={3}>
                                            {dataState.rows.map((row, i) => (
                                                <CenarioItem key={row.id} row={row} dataDispatch={dataDispatch} />
                                            ))}
                                        </Stack>
                                    </div>
                                    <div className={styles.send_panel}>
                                        <LoadingButton loading={false} variant='contained' color='primary' type='submit' endIcon={<KeyboardDoubleArrowUp />} sx={{ width: '100%' }}>
                                            Atualizar Cenário
                                        </LoadingButton>
                                    </div>
                                </>
                            ) : (
                                <NoContent type='empty-data' empty_text='Não há cenários ainda' />
                            )}
                        </>
                    ) : (
                        <NoContent type='empty-data' empty_text='Nenhum Dataset selecionado' />
                    )}
                </Stack>
            </Box>
        </>
    );
};

export default Cenarios;
