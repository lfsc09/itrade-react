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
    ListItemText,
    MenuItem,
    Paper,
    Select,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import { motion } from 'framer-motion';
import React, { useCallback, useEffect, useReducer, useState } from 'react';
import { batch } from 'react-redux';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';

import gStyles from '../../../../assets/back/scss/global.module.scss';
import MessageController from '../../../../components/ui/MessageController';
import NoContent from '../../../../components/ui/NoContent';
import { axiosCon } from '../../../../helpers/axios-con';
import { generateHash, isObjectEmpty } from '../../../../helpers/global';
import { add } from '../../../../store/api-messages/api-messages-slice';
import { handleLogout } from '../../../../store/auth/auth-action';
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
        batch(() => {
            setCenarioCopy(0);
            dataDispatch({ type: DGR_TYPES.ROWS_UPDATED, payload: newRows });
        });
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
                batch(() => {
                    setDatasetCopy(0);
                    dataDispatch({ type: DGR_TYPES.ROWS_UPDATED, payload: newRows });
                });
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
                // Reseta o select
                setDatasetCopy(0);
            });
    }, [datasetCopy, dataState.rows, dispatch, navigate]);

    /********************
     * SEND DATA HANDLER
     ********************/
    const handleAtualizaCenariosAction = useCallback(() => {
        if (dataset === null) return false;

        let sendData = {
            id_dataset: dataset?.id,
            cenarios_delete: [],
            cenarios_create: [],
            cenarios_update: [],
        };

        for (let cenario of dataState.rows) {
            // Verifica cenários em branco ou incompletos
            if (cenario.nome === '' && cenario.observacoes.length === 0) continue;
            if (cenario === '' && cenario.observacoes.length === 0) {
                dispatch(
                    add({
                        message: 'Existem cenários sem Nome',
                        severity: 'error',
                    })
                );
                return false;
            }

            // Cenário ja existe e será deletado
            if (cenario?.delete) {
                sendData.cenarios_delete.push(cenario.id);
                continue;
            }

            // Cenário a ser criado
            if (String(cenario.id).includes('new')) {
                let newObs = [];
                for (let obs of cenario.observacoes) newObs.push({ ref: obs.ref, nome: obs.nome });
                sendData.cenarios_create.push({ nome: cenario.nome, observacoes: newObs });
                continue;
            }

            // Verifica se o Cenário está sendo alterado
            let changedRow = {
                obs_delete: [],
                obs_create: [],
                obs_update: [],
            };
            let originalIndex = dataState.originalRows.findIndex((curr) => curr.id === cenario.id);
            if (originalIndex !== -1) {
                // Ve se mudou o nome
                if (cenario.nome !== dataState.originalRows[originalIndex].nome) changedRow.nome = cenario.nome;
                for (let obs of cenario.observacoes) {
                    // Ignora observações em sem nome (Em branco)
                    if ((obs.ref === '' && obs.nome === '') || (obs.ref !== '' && obs.nome === '')) continue;

                    // Da erro em observações sem Ref
                    if (obs.ref === '' && obs.nome !== '') {
                        dispatch(
                            add({
                                message: 'Existem observações incompletas',
                                severity: 'error',
                            })
                        );
                        return false;
                    }

                    // Ve se a observação ja existe e está sendo deletada
                    if (obs?.delete) {
                        changedRow.obs_delete.push(obs.id);
                        continue;
                    }

                    // Verifica se a observação é nova
                    if (String(obs.id).includes('new')) {
                        changedRow.obs_create.push({ ref: obs.ref, nome: obs.nome });
                        continue;
                    }

                    //Ve se foi alterado algo na observação
                    let changedObs = {};
                    let originalObsIndex = dataState.originalRows[originalIndex].observacoes.findIndex((curr) => curr.id === obs.id);
                    if (originalObsIndex !== -1) {
                        // Ref
                        if (obs.ref !== dataState.originalRows[originalIndex].observacoes[originalObsIndex].ref) changedObs.ref = obs.ref;
                        // Nome
                        if (obs.nome !== dataState.originalRows[originalIndex].observacoes[originalObsIndex].nome) changedObs.nome = obs.nome;
                    }
                    if (!isObjectEmpty(changedObs)) {
                        changedObs.id = obs.id;
                        changedRow.obs_update.push(changedObs);
                    }
                }

                if (changedRow?.nome || changedRow.obs_delete.length || changedRow.obs_create.length || changedRow.obs_update.length) {
                    changedRow.id = cenario.id;
                    sendData.cenarios_update.push(changedRow);
                }
            }
        }
        if (sendData.cenarios_delete.length > 0 || sendData.cenarios_create.length > 0 || sendData.cenarios_update.length > 0) {
            axiosCon
                .post('/cenario/gerencia', sendData)
                .then((resp) => {
                    batch(() => {
                        setCenarioCopy(0);
                        dataDispatch({ type: DGR_TYPES.ROWS_UPDATED__FETCH, payload: resp.data.datarows });
                    });
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
                });
        }
    }, [dataState.rows]);

    /****************************
     * DATASET AUTOCOMPLETE LOAD
     ****************************/
    // Carregamento do select de Datasets
    useEffect(() => {
        const abortController = new AbortController();
        axiosCon
            .get('/dataset/list_suggest?place=cenario__picker__nome', { signal: abortController.signal })
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
                } else console.log('Error Axios: ', error.message);
            });
        return () => {
            abortController.abort();
        };
    }, []);

    /************
     * DATA LOAD
     ************/
    useEffect(() => {
        const abortController = new AbortController();
        // Carrega apenas depois que ja foi escolhido um Dataset
        if (dataset !== null)
            axiosCon
                .post(
                    '/cenario/list_datarows',
                    {
                        id_dataset: dataset?.id,
                    },
                    { signal: abortController.signal }
                )
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
                    } else console.log('Error Axios: ', error.message);
                });
        return () => {
            abortController.abort();
        };
    }, [dataset?.id, dispatch, navigate]);

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
                <Stack direction='column' spacing={2} sx={{ height: '100%', flexGrow: '1' }}>
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
                                        <ListItemText
                                            primary={option.nome}
                                            secondary={option.data_atualizacao}
                                            secondaryTypographyProps={{ className: styles.dataset_atualizadoEm }}
                                        />
                                    </li>
                                )}
                                style={{ width: '100%' }}
                                renderInput={(params) => <TextField {...params} label='Dataset' placeholder='' />}
                            />
                        </Paper>
                    </div>
                    <Stack direction='column' sx={{ flexGrow: '1' }}>
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
                                            <LoadingButton
                                                loading={false}
                                                variant='contained'
                                                color='primary'
                                                type='submit'
                                                endIcon={<KeyboardDoubleArrowUp />}
                                                sx={{ width: '100%' }}
                                                onClick={handleAtualizaCenariosAction}
                                            >
                                                Atualizar Cenário
                                            </LoadingButton>
                                        </div>
                                    </>
                                ) : (
                                    <NoContent type='empty-data' empty_text='Não há cenários ainda' addedClasses={{ wrapper: `${styles.no_content__wrapper}` }} />
                                )}
                            </>
                        ) : (
                            <NoContent type='empty-data' empty_text='Nenhum Dataset selecionado' addedClasses={{ wrapper: `${styles.no_content__wrapper}` }} />
                        )}
                    </Stack>
                </Stack>
            </Box>
        </>
    );
};

export default Cenarios;
