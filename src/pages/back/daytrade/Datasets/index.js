import { Add, Check, Delete, DriveFileRenameOutline, FilterList, InsertDriveFile, NavigateNext, ThreeSixty, Tv, VideoLibrary } from '@mui/icons-material';
import { Box, Breadcrumbs, Button, Chip, Divider, Grid, IconButton, LinearProgress, Paper, Stack, Typography } from '@mui/material';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import { motion } from 'framer-motion';
import React, { useCallback, useEffect, useMemo, useReducer } from 'react';
import { batch, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';

import gStyles from '../../../../assets/back/scss/global.module.scss';
import ConfirmDialog from '../../../../components/ui/ConfirmDialog';
import MessageController from '../../../../components/ui/MessageController';
import { axiosCon } from '../../../../helpers/axios-con';
import { formatValue_fromRaw, isObjectEmpty } from '../../../../helpers/global';
import { add } from '../../../../store/api-messages/api-messages-slice';
import { handleLogout } from '../../../../store/auth/auth-action';
import { reducer as datagridReducer, INI_STATE as DGR_INI_STATE, TYPES as DGR_TYPES } from './datagridReducer';
import styles from './datasets.module.scss';
import FilterDataset from './Filter';

const situacaoCell = ({ value }) => {
    // Fechado
    if (value === 1) return <Check color='success' fontSize='small' />;
    // Pendente
    if (value === 2) return '';
    // Fazendo
    if (value === 3) return <ThreeSixty color='primary' fontSize='small' />;
};

const tipoCell = ({ value }) => {
    // Live
    if (value === 1) return <Tv color='error' fontSize='small' />;
    // Replay
    if (value === 2) return <VideoLibrary fontSize='small' />;
    // Paper Trade
    if (value === 3) return <InsertDriveFile fontSize='small' />;
    // Misto
    if (value === 4) return;
};

const usuariosCell = ({ value }) => {
    return (
        <Stack direction='row' spacing={0.5}>
            {value
                .sort((a, b) => b.criador - a.criador)
                .map((usuario, i) => (
                    <Chip key={i} label={usuario.usuario} color={usuario.criador === 1 ? 'primary' : 'default'} size='small' />
                ))}
        </Stack>
    );
};

const dataAtualizacaoFormatter = ({ value }) => formatValue_fromRaw({ style: 'datetime' }, value);
const dataCriacaoFormatter = ({ value }) => formatValue_fromRaw({ style: 'date' }, value);

const Datasets = () => {
    /***********
     * DISPATCH
     ***********/
    const dispatch = useDispatch();

    /***********
     * NAVIGATE
     ***********/
    const navigate = useNavigate();

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
            .delete(`/dataset/deleta/${datagridState.idRowDeleteConfirm}`)
            .then((resp) => {
                dispatch(
                    add({
                        message: 'Dataset removido',
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

    /****************
     * DATAGRID MISC
     ****************/
    const columns = useMemo(
        () => [
            { field: 'situacao', headerName: 'Sit.', width: 70, disableColumnMenu: true, renderCell: situacaoCell, align: 'center', headerAlign: 'center' },
            {
                field: 'tipo',
                headerName: 'Tipo',
                width: 70,
                disableColumnMenu: true,
                sortable: false,
                renderCell: tipoCell,
                align: 'center',
                headerAlign: 'center',
            },
            { field: 'nome', headerName: 'Nome', flex: 3, cellClassName: styles.table_cell__nome },
            {
                field: 'data_criacao',
                headerName: 'Criado Em',
                type: 'date',
                flex: 1,
                cellClassName: styles.table_cell__dataCriacao,
                valueFormatter: dataCriacaoFormatter,
            },
            {
                field: 'data_atualizacao',
                headerName: 'Atualizado',
                type: 'dateTime',
                flex: 2,
                cellClassName: styles.table_cell__dataAtualizacao,
                valueFormatter: dataAtualizacaoFormatter,
            },
            { field: 'qtd_ops', headerName: 'Trades', type: 'number', flex: 1, cellClassName: styles.table_cell__qtdOps },
            { field: 'usuarios', headerName: 'Usuários', flex: 2, align: 'right', headerAlign: 'right', renderCell: usuariosCell },
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
                '/dataset/list_datagrid',
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
            <ConfirmDialog
                open={datagridState.idRowDeleteConfirm !== null}
                title='Deseja apagar mesmo?'
                content='Todas as operações deste Dataset serão removidas.'
                handleNo={handleDeleteConfirm_No}
                handleYes={handleDeleteConfirm_Yes}
            />
            <FilterDataset open={datagridState.isFilterModalOpen} filterState={datagridState.filters} datagridDispatch={datagridDispatch} />
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
                                Datasets
                            </Typography>
                        </Breadcrumbs>
                        <Stack direction='row' spacing={2}>
                            <IconButton color='primary' onClick={handleFilterModalOpen}>
                                <FilterList />
                            </IconButton>
                            <Button variant='outlined' endIcon={<Add />} component={Link} to='novo' replace={true}>
                                Novo Dataset
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
                                sx={{ px: 2, height: '100%' }}
                            />
                        </Paper>
                    </Stack>
                </Stack>
            </Box>
        </>
    );
};

export default Datasets;
