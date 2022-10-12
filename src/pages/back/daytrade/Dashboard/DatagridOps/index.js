import { Chip, Paper } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import React from 'react';
import { useCallback } from 'react';
import { useMemo } from 'react';

import gstyles from '../../../../../assets/back/scss/global.module.scss';
import { formatValue_fromRaw } from '../../../../../helpers/global';
import styles from './datagrid-ops.module.scss';

const opCell = ({ value }) => {
    // Compra
    if (value === 1) return <Chip color='success' size='small' label='C' />;
    // Venda
    if (value === 2) return <Chip color='danger' size='small' label='V' />;
    return '';
};

const custoCell = ({ value }) => {
    return <span className={gstyles.text_danger}>{value}</span>;
};

const resultCell = ({ value }) => {
    if (value > 0) return <span className={gstyles.text_success}>{value}</span>;
    else return <span className={gstyles.text_danger}>{value}</span>;
};

const dataFormatter = ({ value }) => formatValue_fromRaw({ style: 'datetime' }, value);

const DatagridOps = (props) => {
    const columns = useMemo(
        () => [
            { field: 'trade__seq', headerName: '#', width: 70, disableColumnMenu: true },
            { field: 'trade__data', headerName: 'Data', width: 70, disableColumnMenu: true, valueFormatter: dataFormatter },
            { field: 'trade__hora', headerName: 'Hora', width: 70, disableColumnMenu: true },
            { field: 'trade__cenario', headerName: 'Cenário', disableColumnMenu: true },
            { field: 'trade__op', headerName: 'Op.', width: 70, disableColumnMenu: true, renderCell: opCell },
            { field: 'trade__cts', headerName: 'Cts', width: 70, disableColumnMenu: true },
            { field: 'trade__vol', headerName: 'Vol', width: 70, disableColumnMenu: true },
            { field: 'trade__result_bruto__brl', headerName: 'Bruto BRL', width: 70, disableColumnMenu: true, renderCell: resultCell },
            { field: 'trade__custo', headerName: 'Custo', width: 70, disableColumnMenu: true, renderCell: custoCell },
            { field: 'trade__result_liquido__brl', headerName: 'Líquido BRL', width: 70, disableColumnMenu: true, renderCell: resultCell },
            { field: 'trade__observacoes', headerName: 'Obs.', width: 70, disableColumnMenu: true },
            { field: 'trade__erro', headerName: 'Erro', width: 70, disableColumnMenu: true },
        ],
        []
    );

    /***********
     * HANDLERS
     ***********/
    const getRowId = useCallback((row_data) => {
        return row_data.trade__id;
    }, []);

    return (
        <Paper className={styles.grid_wrapper}>
            <div className={styles.grid_container}>
                <DataGrid columns={columns} rows={props.rows} getRowId={getRowId} sx={{ px: 2 }} />
            </div>
        </Paper>
    );
};

export default DatagridOps;
