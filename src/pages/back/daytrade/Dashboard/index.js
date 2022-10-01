import { AutoFixHigh, FilterList } from '@mui/icons-material';
import { Box, Button, Checkbox, Divider, FormControl, FormHelperText, Grid, IconButton, ListItemText, MenuItem, Paper, Select, Stack, TextField, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import React, { useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import { batch, useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';

import gStyles from '../../../../assets/back/scss/global.module.scss';
import MessageController from '../../../../components/ui/MessageController';
import { axiosCon } from '../../../../helpers/axios-con';
import { formatValue_fromRaw, isObjectEmpty } from '../../../../helpers/global';
import { add } from '../../../../store/api-messages/api-messages-slice';
import { handleLogout } from '../../../../store/auth/auth-action';
import styles from './dashboard.module.scss';
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
    const [filterModalOpen, setFilterModalOpen] = useState(false);

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
            .get('/dash/step1', { signal: abortController.signal })
            .then((resp) => {
                // Carrega informações no SESSION STORAGE
                let sessionData = JSON.parse(sessionStorage.getItem('daytrade'));
                let loadData = {
                    datasets: resp.data.datasets,
                    filters: sessionData?.filters ?? { dataset: [resp.data.datasets[0]], dataset_react_checksum: resp.data.datasets[0].id, gerenciamento: null },
                    simulations: sessionData?.simulations ?? { periodo_calc: 1, usa_custo: 1, ignora_erro: 1, tipo_cts: 1 },
                };
                dataDispatch({ type: DGR_TYPES.STEP1_LOAD, payload: loadData });
            })
            .catch((error) => {
                if (error.response) {
                    if (error.response.status === 401) dispatch(handleLogout());
                } else {
                    console.log('Error Suggest: ', error.message);
                }
            });
        return () => {
            abortController.abort();
        };
    }, []);

    /***************************
     * STEP2: DATASETS OPs LOAD
     ***************************/
    useEffect(() => {
        if (dataState.filters !== null) {
            const abortController = new AbortController();
            axiosCon
                .get('/dash/step2', { signal: abortController.signal })
                .then((resp) => {
                    let loadData = {
                        cenarios: resp.data.cenarios,
                        operacoes_p_dataset: resp.data.operacoes_por_dataset,
                    };
                    dataDispatch({ type: DGR_TYPES.STEP2_LOAD, payload: loadData });
                })
                .catch((error) => {
                    if (error.response) {
                        if (error.response.status === 401) dispatch(handleLogout());
                    } else {
                        console.log('Error Suggest: ', error.message);
                    }
                });
            return () => {
                abortController.abort();
            };
        }
    }, [dataState.filters?.dataset_react_checksum]);

    /***********
     * HANDLERS
     ***********/
    const handleFilterModalOpen = useCallback(() => {
        setFilterModalOpen(true);
    }, []);

    return (
        <>
            <MessageController overlay={true} />
            {dataState.filters !== null ? (
                <FilterDashboard
                    open={filterModalOpen}
                    filterState={dataState.filters}
                    simulationState={dataState.simulations}
                    /**
                     * TODO:
                     */
                    original={{ data_inicial: new Date(new Date().toDateString()), data_final: new Date(new Date().toDateString()) }}
                    datasetSuggest={dataState.datasets}
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
                <Stack direction='column' spacing={2} alignItems='strech' sx={{ height: '100%' }}>
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
                </Stack>
            </Box>
        </>
    );
};

export default Dashboard;
