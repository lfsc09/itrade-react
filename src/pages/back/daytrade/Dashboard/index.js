import { AutoFixHigh, CheckBox, CheckBoxOutlineBlank, FilterList } from '@mui/icons-material';
import { Autocomplete, Box, Button, Checkbox, Divider, FormControlLabel, FormGroup, IconButton, ListItemText, Paper, Stack, Switch, TextField, Typography } from '@mui/material';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import React, { useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import { batch, useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import gStyles from '../../../../assets/back/scss/global.module.scss';
import MessageController from '../../../../components/ui/MessageController';
import NoContent from '../../../../components/ui/NoContent';
import { axiosCon } from '../../../../helpers/axios-con';
import { isObjectEmpty } from '../../../../helpers/global';
import { generate__DashboardOps } from '../../../../helpers/rv-statistics';
import { handleLogout } from '../../../../store/auth/auth-action';
import styles from './dashboard.module.scss';
import DatagridOps from './DatagridOps';
import DatagridStats from './DatagridStats';
import { reducer as dataReducer, INI_STATE as DGR_INI_STATE, TYPES as DGR_TYPES } from './dataReducer';
import FilterDashboard from './Filter';

const Dashboard = () => {
    const { user } = useSelector((store) => store.auth);

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
    const [step2_firstLoad, setStep2_firstLoad] = useState(true);
    const [filterModalOpen, setFilterModalOpen] = useState(false);
    const [comparaDataset, setComparaDataset] = useState(false);
    const [dataset, setDataset] = useState([]);
    // Checksum com ID do dataset, para averiguar mudanças no 'dataset'
    const [dataset_checksum, setDataset_Checksum] = useState('');
    const [operacoes, setOperacoes] = useState(null);
    const [statistics, setStatistics] = useState(null);

    /***************
     * DATA REDUCER
     ***************/
    const [dataState, dataDispatch] = useReducer(dataReducer, DGR_INI_STATE);

    /*********************************
     * STEP1: FIRST FILTERS DATA LOAD
     *********************************/
    // Carregamento do select de Datasets e carrega informações dos filtros do SESSION STORAGE
    useEffect(() => {
        const abortController = new AbortController();
        axiosCon
            .get('/dash/load_datasets', { signal: abortController.signal })
            .then((resp) => {
                // Carrega informações no SESSION STORAGE
                let sessionData = JSON.parse(sessionStorage.getItem('daytrade'));
                let loadData = {
                    datasets: resp.data.datasets,
                    filters: sessionData?.filters ?? { gerenciamento: null },
                    simulations: sessionData?.simulations ?? { periodo_calc: 1, usa_custo: 1, ignora_erro: 0, tipo_cts: 1 },
                };
                let selectedDatasets = sessionData?.dataset ?? [resp.data.datasets[0]];
                batch(() => {
                    setDataset((prevState) => selectedDatasets);
                    setDataset_Checksum((prevState) => selectedDatasets.reduce((t, d) => t + '_' + d.id, ''));
                    dataDispatch({ type: DGR_TYPES.STEP1_LOAD, payload: loadData });
                });
            })
            .catch((error) => {
                if (error.response) {
                    if (error.response.status === 401) dispatch(handleLogout());
                } else console.log('Error Axios: ', error.message);
            });
        return () => {
            abortController.abort();
        };
    }, []);

    /*********************************************************
     * STEP2: DATASETS OPs LOAD (Operações, Cenarios, Ativos)
     *********************************************************/
    useEffect(() => {
        if (dataset.length) {
            const abortController = new AbortController();
            axiosCon
                .post(
                    '/dash/load_datasets__info',
                    {
                        filters: { dataset: dataset.map((d) => d.id) },
                    },
                    { signal: abortController.signal }
                )
                .then((resp) => {
                    let loadData = {
                        ativos: resp.data.ativos,
                        gerenciamentos: resp.data.gerenciamentos,
                        cenarios: resp.data.cenarios,
                        originalInfo: {
                            date_inicial: new Date(new Date(resp.data.originalInfo.date_inicial).toDateString()),
                            date_final: new Date(new Date(resp.data.originalInfo.date_final).toDateString()),
                            dias: resp.data.originalInfo.dias,
                        },
                    };
                    loadData.originalInfo.date_inicial_checksum = format(loadData.originalInfo.date_inicial, 'yyyy-MM-dd');
                    loadData.originalInfo.date_final_checksum = format(loadData.originalInfo.date_final, 'yyyy-MM-dd');
                    if (step2_firstLoad) {
                        // Se for o primeiro load da Aba (SESSION STORAGE Vazio)
                        if (dataState.filters.gerenciamento === null) loadData.filters = { gerenciamento: resp.data.gerenciamentos?.[0] ?? null };
                    } else {
                        // Reseta os filters e simulations ao mudar os Datasets
                        loadData.filters = { gerenciamento: resp.data.gerenciamentos?.[0] ?? null };
                        loadData.simulations = { periodo_calc: 1, usa_custo: 1, ignora_erro: 0, tipo_cts: 1 };
                    }
                    batch(() => {
                        if (step2_firstLoad) setStep2_firstLoad(false);
                        setOperacoes((prevState) => resp.data.operacoes);
                        dataDispatch({ type: DGR_TYPES.STEP2_LOAD, payload: loadData });
                    });
                })
                .catch((error) => {
                    if (error.response) {
                        if (error.response.status === 401) dispatch(handleLogout());
                    } else console.log('Error Axios: ', error.message);
                });
            return () => {
                abortController.abort();
            };
        }
    }, [dataset_checksum]);

    /************************************
     * REACALCULA AS ESTATISTICAS APENAS
     ************************************/
    useEffect(() => {
        console.log(dataState.filters_checksum, dataState.simulations_checksum);
        if (operacoes !== null && dataState.filters !== null && dataState.simulations !== null)
            setStatistics((prevstate) => generate__DashboardOps(operacoes, dataState.filters, dataState.simulations));
    }, [dataState.filters_checksum, dataState.simulations_checksum]);

    /***********
     * HANDLERS
     ***********/
    const handleFilterModalOpen = useCallback(() => {
        setFilterModalOpen(true);
    }, []);

    const handleDatasetAutocomplete = useCallback((e, values) => {
        if (values.length) setDataset((prevState) => values);
    }, []);

    const handleComparaDatasetSwitch = useCallback((e) => {
        setComparaDataset((prevState) => e.target.checked);
    }, []);

    const handleDatasetChangeClick = useCallback(() => {
        if (dataset.length) setDataset_Checksum((prevState) => dataset.reduce((t, d) => t + '_' + d.id, ''));
    }, [dataset]);

    return (
        <>
            <MessageController overlay={true} />
            {dataState.filters !== null && dataState.ativos !== null && dataState.gerenciamentos !== null && dataState.cenarios !== null ? (
                <FilterDashboard
                    open={filterModalOpen}
                    ativosSuggest={dataState.ativos}
                    gerenciamentosSuggest={dataState.gerenciamentos}
                    cenariosSuggest={dataState.cenarios}
                    filterState={dataState.filters}
                    filterChecksum={dataState.filters_checksum}
                    simulationState={dataState.simulations}
                    simulationChecksum={dataState.simulations_checksum}
                    original={dataState.originalInfo}
                    dispatchers={{ dataDispatch: dataDispatch, setFilterModalOpen: setFilterModalOpen }}
                />
            ) : (
                <></>
            )}
            <Box
                className={gStyles.wrapper}
                component={motion.div}
                initial={{ y: '-100vh' }}
                animate={{ y: 0, transition: { duration: 0.25 } }}
                exit={{ transition: { duration: 0.1 } }}
            >
                <Stack direction='column' spacing={2} sx={{ height: '100%', flexGrow: '1' }}>
                    <div className={styles.greetings_panel}>
                        <Typography className={styles.greetings_user} variant='overline'>
                            Bem vindo, {user.nome} &#128075;
                        </Typography>
                        <Stack direction='row' spacing={2}>
                            <IconButton color='primary' onClick={handleFilterModalOpen}>
                                <FilterList />
                            </IconButton>
                            <Typography className={styles.dash_place} variant='overline'>
                                daytrade
                            </Typography>
                        </Stack>
                    </div>
                    <Divider />
                    <Paper sx={{ p: 1, pt: 2 }}>
                        <Stack direction='row' spacing={3}>
                            <Autocomplete
                                multiple
                                disableCloseOnSelect
                                size='small'
                                name='dataset'
                                options={dataState.datasets}
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
                                renderInput={(params) => <TextField {...params} label='Datasets' placeholder='' />}
                            />
                            <FormGroup className={styles.filter__compara}>
                                <FormControlLabel
                                    classes={{ label: styles.filter__compara_label }}
                                    componentsProps={{ typography: { variant: 'overline' } }}
                                    control={<Switch color='success' checked={comparaDataset} onChange={handleComparaDatasetSwitch} disabled />}
                                    label={comparaDataset ? 'Comparar Datasets' : 'Juntar Datasets'}
                                />
                            </FormGroup>
                            <Button variant='contained' size='small' onClick={handleDatasetChangeClick}>
                                <AutoFixHigh />
                            </Button>
                        </Stack>
                    </Paper>
                    {statistics !== null && !isObjectEmpty(statistics.dashboard_ops__table_stats) ? (
                        <DatagridStats stats={statistics} periodoCalc={dataState.simulations?.periodo_calc} />
                    ) : (
                        <NoContent
                            type='empty-data'
                            empty_text='Sem Dados'
                            withContainer={true}
                            addedClasses={{ wrapper: `${styles.no_content__wrapper}`, container: `${styles.no_content__container}` }}
                        />
                    )}
                    {statistics !== null && statistics.dashboard_ops__table_trades.length ? (
                        <DatagridOps rows={statistics.dashboard_ops__table_trades} periodoCalc={dataState.simulations?.periodo_calc} />
                    ) : (
                        <NoContent
                            type='empty-data'
                            empty_text='Sem Dados'
                            withContainer={true}
                            addedClasses={{ wrapper: `${styles.no_content__wrapper}`, container: `${styles.no_content__container}` }}
                        />
                    )}
                </Stack>
            </Box>
        </>
    );
};

export default Dashboard;
