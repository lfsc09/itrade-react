import styles from './datasets.module.scss';
import { formatValue_fromRaw } from '../../../../helpers/global';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Box, Grid, Paper, Stack, TextField, Typography, Chip, Breadcrumbs, Button, Divider, LinearProgress } from '@mui/material';
import { ThreeSixty, Check, VideoLibrary, Tv, InsertDriveFile, Add, NavigateNext, DriveFileRenameOutline, Delete } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import axiosCon from '../../../../helpers/axios-con';
import { useDispatch, useSelector } from 'react-redux/es/exports';
import { add, remove } from '../../../../store/snack-messages/snack-messages-slice';
import SnackOverlay from '../../../../components/ui/SnackOverlay';

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

    /*********
     * STATES
     *********/
    const { snacks } = useSelector((store) => store.snackMessages);
    const [dgRemoteData, setDGRemoteData] = useState({
        rows: [],
        rowCount: 0,
    });
    const [isDGLoading, setISDGLoading] = useState(true);
    const [pageInfo, setPageInfo] = useState({
        page: 0,
        pageSize: 100,
    });
    const [dgFiltros, setDGFiltros] = useState([]);
    const [dgSortingModel, setDGSortingModel] = useState([{ field: 'data_atualizacao', sort: 'desc' }]);

    /***********
     * DATAGRID
     ***********/
    const editarDataset = useCallback(
        (id) => () => {
            navigate(`editar/${id}`, { replace: true });
        },
        [navigate]
    );
    const apagarDataset = useCallback(
        (id) => () => {
            console.log(id);
        },
        []
    );

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
            { field: 'nome', headerName: 'Nome', flex: 2, cellClassName: styles.table_cell__nome },
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
                flex: 1,
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
                    <GridActionsCellItem icon={<DriveFileRenameOutline />} label='Editar' onClick={editarDataset(params.id)} />,
                    <GridActionsCellItem icon={<Delete />} label='Apagar' onClick={apagarDataset(params.id)} />,
                ],
            },
        ],
        [editarDataset, apagarDataset]
    );

    /***********
     * HANDLERS
     ***********/
    const handlePageChange = useCallback((newPage) => {
        setISDGLoading(true);
        setPageInfo((prevState) => ({ ...prevState, page: newPage }));
    }, []);

    const handleSortModelChange = useCallback((sortModel) => {
        setISDGLoading(true);
        setDGSortingModel((prevState) => sortModel);
    }, []);

    useEffect(() => {
        axiosCon
            .post('/dataset/list_datagrid', {
                ...pageInfo,
                filters: dgFiltros,
                sorting: dgSortingModel,
            })
            .then((resp) => {
                setDGRemoteData((prevState) => resp.data.datagrid);
                setISDGLoading(false);
            })
            .catch((error) => {
                if (error.response) {
                    if (error.response.status === 401)
                        dispatch(
                            add({
                                message: 'Credenciais inexistentes',
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
                setISDGLoading(false);
            });
    }, [pageInfo, dgFiltros, dgSortingModel, dispatch]);

    console.log(pageInfo, dgRemoteData);

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
                            <Typography className={styles.title} variant='overline'>
                                Datasets
                            </Typography>
                        </Breadcrumbs>
                        <Button variant='outlined' endIcon={<Add />} component={Link} to='novo' replace={true}>
                            Novo Dataset
                        </Button>
                    </div>
                    <Divider />
                    <div className={styles.filter_panel}>
                        <Grid container spacing={1}>
                            <Grid item xs={12}>
                                <Paper className={styles.filter_container} sx={{ p: 2 }}>
                                    <TextField label='Filtrar Data' variant='outlined' size='small' />
                                </Paper>
                            </Grid>
                        </Grid>
                    </div>
                    <div className={styles.table_panel}>
                        <Paper className={styles.table_container}>
                            <DataGrid
                                components={{
                                    LoadingOverlay: LinearProgress,
                                }}
                                sortingOrder={['asc', 'desc']}
                                disableColumnFilter
                                disableSelectionOnClick
                                rowsPerPageOptions={[pageInfo.pageSize]}
                                columns={columns}
                                rows={dgRemoteData.rows}
                                rowCount={dgRemoteData.rowCount}
                                loading={isDGLoading}
                                page={pageInfo.page}
                                pageSize={pageInfo.pageSize}
                                paginationMode='server'
                                onPageChange={handlePageChange}
                                sortingMode='server'
                                onSortModelChange={handleSortModelChange}
                                initialState={{
                                    sorting: {
                                        sortModel: dgSortingModel,
                                    },
                                }}
                            />
                        </Paper>
                    </div>
                </Stack>
            </Box>
        </>
    );
};

export default Datasets;
