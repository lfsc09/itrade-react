import styles from './datasets.module.scss';
import { formatValue_fromRaw } from '../../../../helpers/global';
import React from 'react';
import { motion } from 'framer-motion';
import { Box, Grid, Paper, Stack, TextField, Typography, Chip, Breadcrumbs, Button, Divider } from '@mui/material';
import { ThreeSixty, Check, VideoLibrary, Tv, InsertDriveFile, Add, NavigateNext } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { DataGrid } from '@mui/x-data-grid';
import { DUMMY_DATASETS } from './dummy-data';

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
    return value
        .sort((a, b) => b.criador - a.criador)
        .map((usuario, i) => <Chip key={i} label={usuario.usuario} color={usuario.criador === 1 ? 'primary' : 'default'} size='small' />);
};

const Datasets = () => {
    return (
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
                            columns={[
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
                                    valueFormatter: ({ value }) => formatValue_fromRaw({ style: 'date' }, value),
                                },
                                {
                                    field: 'data_atualizacao',
                                    headerName: 'Atualizado',
                                    type: 'dateTime',
                                    flex: 1,
                                    cellClassName: styles.table_cell__dataAtualizacao,
                                    valueFormatter: ({ value }) => formatValue_fromRaw({ style: 'datetime' }, value),
                                },
                                { field: 'qtd_ops', headerName: 'Trades', type: 'number', flex: 1, cellClassName: styles.table_cell__qtdOps },
                                { field: 'usuarios', headerName: 'Usuários', flex: 2, align: 'right', headerAlign: 'right', renderCell: usuariosCell },
                            ]}
                            rows={DUMMY_DATASETS}
                        />
                    </Paper>
                </div>
            </Stack>
        </Box>
    );
};

export default Datasets;
