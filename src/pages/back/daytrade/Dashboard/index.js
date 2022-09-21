import { AutoFixHigh, FilterList } from '@mui/icons-material';
import { Box, Button, Checkbox, Divider, FormControl, FormHelperText, Grid, IconButton, ListItemText, MenuItem, Paper, Select, Stack, TextField, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import React, { useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import { batch, useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';

import gStyles from '../../../../assets/back/scss/global.module.scss';
import SnackOverlay from '../../../../components/ui/SnackOverlay';
import { axiosCon } from '../../../../helpers/axios-con';
import { formatValue_fromRaw, isObjectEmpty } from '../../../../helpers/global';
import { handleLogout } from '../../../../store/auth/auth-action';
import { add, remove } from '../../../../store/snack-messages/snack-messages-slice';
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

    /******************
     * SNACKS SELECTOR
     ******************/
    const { snacks } = useSelector((store) => store.snackMessages);

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
    // Carregamento do select de Datasets
    useEffect(() => {
        const abortController = new AbortController();
        axiosCon
            .get('/dash/step1', { signal: abortController.signal })
            .then((resp) => {
                let loadData = { datasets: resp.data.datasets, filters: {}, simulations: {} };
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

    /***********
     * HANDLERS
     ***********/
    const handleFilterModalOpen = useCallback(() => {
        setFilterModalOpen(true);
    }, []);

    console.log(dataState);

    return (
        <>
            {snacks.map((item) => (
                <SnackOverlay key={item.key} open={true} severity={item.severity} onClose={() => dispatch(remove(item.key))}>
                    {item.message}
                </SnackOverlay>
            ))}
            <FilterDashboard
                open={filterModalOpen}
                filterState={dataState.filters}
                simulationState={dataState.simulations}
                datasetSuggest={dataState.datasets}
                dispatchers={{ dataDispatch: dataDispatch, setFilterModalOpen: setFilterModalOpen }}
            />
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
