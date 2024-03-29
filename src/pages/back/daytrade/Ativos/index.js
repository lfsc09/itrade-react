import { Add, Delete, DriveFileRenameOutline, FilterList, NavigateNext } from '@mui/icons-material';
import { Box, Breadcrumbs, Button, Chip, Divider, Grid, IconButton, LinearProgress, Paper, Stack, Tab, Tabs, Typography } from '@mui/material';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import { motion } from 'framer-motion';
import React, { useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import { batch, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';

import gStyles from '../../../../assets/back/scss/global.module.scss';
import ConfirmDialog from '../../../../components/ui/ConfirmDialog';
import MessageController from '../../../../components/ui/MessageController';
import { axiosCon } from '../../../../helpers/axios-con';
import { isObjectEmpty } from '../../../../helpers/global';
import { add } from '../../../../store/api-messages/api-messages-slice';
import { handleLogout } from '../../../../store/auth/auth-action';
import styles from './ativos.module.scss';
import { wdoSeries, winSeries } from './calcVencimentos';
import { reducer as datagridReducer, INI_STATE as DGR_INI_STATE, TYPES as DGR_TYPES } from './datagridReducer';
import FilterAtivo from './Filter';
import VencTable from './VencTable';

const currYear = new Date().getFullYear();
const vencWinSeries = winSeries(currYear);
const vencWdoSeries = wdoSeries(currYear);

const Ativos = () => {
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
    const [vencTabControl, setVencTaBControl] = useState(0);

    /*******************
     * DATAGRID REDUCER
     *******************/
    const [datagridState, datagridDispatch] = useReducer(datagridReducer, DGR_INI_STATE);

    /******************
     * FILTER HANDLERS
     ******************/
    const handleFilterModalOpen = useCallback(() => {
        datagridDispatch({ type: DGR_TYPES.CHANGE_FILTER_MODAL_STATE, payload: true });
    }, []);

    const handleFilterRemove = useCallback(
        (obj) => {
            const newFilters = { ...datagridState.filters };
            newFilters[obj.filter] = newFilters[obj.filter].filter((val) => val.value !== obj.value);
            if (newFilters[obj.filter].length === 0) delete newFilters[obj.filter];
            datagridDispatch({ type: DGR_TYPES.FILTERS_CHANGED, payload: newFilters });
        },
        [datagridState.filters]
    );

    /********************
     * DATAGRID HANDLERS
     ********************/
    const handlerEditaDatagridAction = useCallback(
        (id) => () => {
            navigate(`editar/${id}`, { replace: true });
        },
        [navigate]
    );

    const handlerDeletaDatagridAction = useCallback(
        (id) => () => {
            datagridDispatch({ type: DGR_TYPES.DELETE_CONFIRM, payload: id });
        },
        []
    );

    const handlePageChangeDatagrid = useCallback((newPage) => {
        datagridDispatch({ type: DGR_TYPES.PAGE_CHANGE, payload: newPage });
    }, []);

    const handleSortModelChangeDatagrid = useCallback((sortModel) => {
        datagridDispatch({ type: DGR_TYPES.SORTMODEL_CHANGE, payload: sortModel });
    }, []);

    const handleDeleteConfirm_No = useCallback(() => {
        datagridDispatch({ type: DGR_TYPES.DELETE_CONFIRM, payload: null });
    }, []);

    const handleDeleteConfirm_Yes = useCallback(() => {
        axiosCon
            .delete(`/ativo/deleta/${datagridState.idRowDeleteConfirm}`)
            .then((resp) => {
                dispatch(
                    add({
                        message: 'Ativo removido',
                        severity: 'success',
                    })
                );
                batch(() => {
                    datagridDispatch({ type: DGR_TYPES.DELETE_CONFIRM, payload: null });
                    datagridDispatch({ type: DGR_TYPES.FORCE_RELOAD });
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
                // setIsSendLoading(false);
            });
    }, [dispatch, navigate, datagridState.idRowDeleteConfirm]);

    /***********************
     * VENCIMENTOS HANDLERS
     ***********************/
    const handleVencTabControl = useCallback((event, value) => {
        setVencTaBControl(value);
    }, []);

    /****************
     * DATAGRID MISC
     ****************/
    const columns = useMemo(
        () => [
            { field: 'nome', headerName: 'Nome', flex: 1, cellClassName: styles.table_cell__nome },
            { field: 'custo', headerName: 'Custo ( Abert. + Fech.)', type: 'number', flex: 1, align: 'center', headerAlign: 'center', cellClassName: styles.table_cell__custo },
            { field: 'valor_tick', headerName: 'Valor por Tick', type: 'number', flex: 1, align: 'center', headerAlign: 'center', cellClassName: styles.table_cell__valorTick },
            { field: 'pts_tick', headerName: 'Pts por Tick', type: 'number', flex: 1, align: 'center', headerAlign: 'center', cellClassName: styles.table_cell__ptsTick },
            {
                field: 'actions',
                type: 'actions',
                width: 120,
                getActions: (params) => [
                    <GridActionsCellItem icon={<DriveFileRenameOutline />} label='Editar' onClick={handlerEditaDatagridAction(params.id)} />,
                    <GridActionsCellItem icon={<Delete />} label='Apagar' onClick={handlerDeletaDatagridAction(params.id)} />,
                ],
            },
        ],
        [handlerEditaDatagridAction, handlerDeletaDatagridAction]
    );

    /****************
     * DATAGRID LOAD
     ****************/
    useEffect(() => {
        const abortController = new AbortController();
        // Trata o state dos filtros para passar apenas os valores
        const treatedFilters = {};
        Object.keys(datagridState.filters).forEach((fName) => {
            treatedFilters[fName] = datagridState.filters[fName].map((fVal) => fVal.value);
        });
        axiosCon
            .post(
                '/ativo/list_datagrid',
                {
                    page: datagridState.page,
                    pageSize: datagridState.pageSize,
                    filters: treatedFilters,
                    sorting: datagridState.sortingModel,
                },
                { signal: abortController.signal }
            )
            .then((resp) => {
                datagridDispatch({ type: DGR_TYPES.ROWS_UPDATED, payload: resp.data.datagrid });
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
                datagridDispatch({ type: DGR_TYPES.STOP_LOADING });
            });
        return () => {
            abortController.abort();
        };
    }, [datagridState.forceReloadDatagrid, datagridState.page, datagridState.pageSize, datagridState.filters, datagridState.sortingModel, dispatch, navigate]);

    return (
        <>
            <MessageController overlay={true} />
            <ConfirmDialog open={datagridState.idRowDeleteConfirm !== null} title='Deseja apagar mesmo?' handleNo={handleDeleteConfirm_No} handleYes={handleDeleteConfirm_Yes} />
            <FilterAtivo open={datagridState.isFilterModalOpen} filterState={datagridState.filters} datagridDispatch={datagridDispatch} />
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
                                Ativos
                            </Typography>
                        </Breadcrumbs>
                        <Stack direction='row' spacing={2}>
                            <IconButton color='primary' onClick={handleFilterModalOpen}>
                                <FilterList />
                            </IconButton>
                            <Button variant='outlined' endIcon={<Add />} component={Link} to='novo' replace={true}>
                                Novo Ativo
                            </Button>
                        </Stack>
                    </div>
                    <Divider />
                    {!isObjectEmpty(datagridState.filters) ? (
                        <div className={gStyles.filter_panel}>
                            <Grid container spacing={1}>
                                <Grid item xs={12}>
                                    <Paper elevation={0} className={gStyles.filter_container} sx={{ p: 1 }}>
                                        <Stack spacing={1} direction='row'>
                                            {Object.keys(datagridState.filters).map((fName) =>
                                                datagridState.filters[fName].map((fVal, fI) => (
                                                    <Chip
                                                        key={`${fName}_${fI}`}
                                                        label={
                                                            <div className={gStyles.filter_chip}>
                                                                <div className={gStyles.filter_chip__title}>{datagridState.filters_lib[fName]}: </div>
                                                                <div className={gStyles.filter_chip__content}>{fVal.label}</div>
                                                            </div>
                                                        }
                                                        onDelete={() => {
                                                            handleFilterRemove({ filter: fName, value: fVal.value });
                                                        }}
                                                    />
                                                ))
                                            )}
                                        </Stack>
                                    </Paper>
                                </Grid>
                            </Grid>
                        </div>
                    ) : (
                        <></>
                    )}
                    <Stack direction='row' spacing={2} sx={{ flexGrow: '1' }}>
                        <Paper sx={{ flex: 1 }}>
                            <DataGrid
                                components={{
                                    LoadingOverlay: LinearProgress,
                                }}
                                sortingOrder={['asc', 'desc']}
                                disableColumnFilter
                                disableSelectionOnClick
                                rowsPerPageOptions={[datagridState.pageSize]}
                                columns={columns}
                                rows={datagridState.rows}
                                rowCount={datagridState.rowCount}
                                loading={datagridState.isLoading}
                                page={datagridState.page}
                                pageSize={datagridState.pageSize}
                                paginationMode='server'
                                onPageChange={handlePageChangeDatagrid}
                                sortingMode='server'
                                onSortModelChange={handleSortModelChangeDatagrid}
                                initialState={{
                                    sorting: {
                                        sortModel: datagridState.sortingModel,
                                    },
                                }}
                                sx={{ px: 2 }}
                            />
                        </Paper>
                        <Paper className={styles.venc_container}>
                            <Tabs
                                orientation='vertical'
                                variant='scrollable'
                                value={vencTabControl}
                                onChange={handleVencTabControl}
                                sx={{ borderRight: 1, borderColor: 'divider', overflow: 'unset' }}
                            >
                                <Tab label='WIN' />
                                <Tab label='WDO' />
                            </Tabs>
                            <div className={styles.venc_tab_container} role='tabpanel' hidden={vencTabControl !== 0}>
                                <VencTable rows={vencWinSeries} />
                            </div>
                            <div className={styles.venc_tab_container} role='tabpanel' hidden={vencTabControl !== 1}>
                                <VencTable rows={vencWdoSeries} />
                            </div>
                        </Paper>
                    </Stack>
                </Stack>
            </Box>
        </>
    );
};

export default Ativos;
