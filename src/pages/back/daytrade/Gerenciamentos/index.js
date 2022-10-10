import { Add, Delete, DriveFileRenameOutline, NavigateNext } from '@mui/icons-material';
import { Box, Breadcrumbs, Button, ButtonGroup, Divider, LinearProgress, Paper, Stack, Typography } from '@mui/material';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import { motion } from 'framer-motion';
import React, { useCallback, useEffect, useMemo, useReducer } from 'react';
import { batch, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';

import gStyles from '../../../../assets/back/scss/global.module.scss';
import ConfirmDialog from '../../../../components/ui/ConfirmDialog';
import MessageController from '../../../../components/ui/MessageController';
import { axiosCon } from '../../../../helpers/axios-con';
import { add } from '../../../../store/api-messages/api-messages-slice';
import { handleLogout } from '../../../../store/auth/auth-action';
import { reducer as datagridReducer, INI_STATE as DGR_INI_STATE, TYPES as DGR_TYPES } from './datagridReducer';
import styles from './gerenciamentos.module.scss';

const acoesCell = ({ value }) => {
    return (
        <ButtonGroup variant='contained' size='small' className={styles.btn_group}>
            {value
                .sort((a, b) => b.acao - a.acao)
                .map((gerenc, i) => (
                    <Button key={i} className={`${styles.btn} ${gerenc.acao > 0 ? styles.positive : styles.negative}`}>
                        {Math.abs(gerenc.acao)}S{gerenc.escalada !== 0 ? ` E${gerenc.escalada}` : ''}
                    </Button>
                ))}
        </ButtonGroup>
    );
};

const Gerenciamentos = () => {
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
            .delete(`/gerenciamento/deleta/${datagridState.idRowDeleteConfirm}`)
            .then((resp) => {
                dispatch(
                    add({
                        message: 'Gerenciamento removido',
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
            { field: 'nome', headerName: 'Nome', flex: 1, cellClassName: styles.table_cell__nome },
            { field: 'acoes', headerName: 'Ações', type: 'number', flex: 1, cellClassName: styles.table_cell__acoes, renderCell: acoesCell },
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
                '/gerenciamento/list_datagrid',
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
                            <Typography className={gStyles.title} variant='overline'>
                                Gerenciamentos
                            </Typography>
                        </Breadcrumbs>
                        <Stack direction='row' spacing={2}>
                            <Button variant='outlined' endIcon={<Add />} component={Link} to='novo' replace={true}>
                                Novo Gerenciamento
                            </Button>
                        </Stack>
                    </div>
                    <Divider />
                    <div className={gStyles.table_panel}>
                        <Paper className={gStyles.table_container}>
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
                    </div>
                </Stack>
            </Box>
        </>
    );
};

export default Gerenciamentos;
