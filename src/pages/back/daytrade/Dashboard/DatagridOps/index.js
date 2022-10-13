import { ArrowDropDown, ArrowDropUp, ReportProblem } from '@mui/icons-material';
import { Paper } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import React from 'react';
import { useCallback } from 'react';
import { useMemo } from 'react';

import gstyles from '../../../../../assets/back/scss/global.module.scss';
import { formatValue_fromRaw } from '../../../../../helpers/global';
import styles from './datagrid-ops.module.scss';

const opCell = ({ value }) => {
    // Compra
    if (value === 1) return <ArrowDropUp color='success' />;
    // Venda
    if (value === 2) return <ArrowDropDown color='error' />;
    return '';
};

const custoCell = ({ value }) => {
    return <span className={`${gstyles.text_bold} ${gstyles.text_danger}`}>{`R$ ${value.toFixed(2)}`}</span>;
};

const resultCell = ({ value }) => {
    if (value > 0) return <span className={`${gstyles.text_bold} ${gstyles.text_success}`}>{`R$ ${value.toFixed(2)}`}</span>;
    else if (value < 0) return <span className={`${gstyles.text_bold} ${gstyles.text_danger}`}>{`R$ ${value.toFixed(2)}`}</span>;
    else return <span className={`${gstyles.text_bold} ${gstyles.text_muted}`}>{`R$ ${value.toFixed(2)}`}</span>;
};

const erroCell = ({ value }) => {
    if (value === 1) return <ReportProblem color='error' fontSize='small' />;
    return '';
};

const dataFormatter = ({ value }) => formatValue_fromRaw({ style: 'date' }, value);

const DatagridOps = (props) => {
    const dg_options = useMemo(
        () => ({
            columns: [
                { field: 'trade__seq', headerName: '#', width: 70, disableColumnMenu: true, cellClassName: `${gstyles.text_bold} ${gstyles.text_muted}` },
                {
                    field: 'trade__data',
                    headerName: 'Data',
                    flex: 1,
                    disableColumnMenu: true,
                    valueFormatter: dataFormatter,
                    cellClassName: `${gstyles.text_muted} ${gstyles.text_bold}`,
                },
                { field: 'trade__hora', headerName: 'Hora', flex: 1, disableColumnMenu: true, cellClassName: `${gstyles.text_muted} ${gstyles.text_bold}` },
                { field: 'trade__cenario', headerName: 'Cenário', flex: 2, disableColumnMenu: true, cellClassName: `${gstyles.text_bold}` },
                { field: 'trade__op', headerName: 'Op.', width: 70, disableColumnMenu: true, renderCell: opCell, align: 'center', headerAlign: 'center', sortable: false },
                { field: 'trade__cts', headerName: 'Cts', width: 70, disableColumnMenu: true, align: 'center', headerAlign: 'center', cellClassName: `${gstyles.text_bold}` },
                { field: 'trade__vol', headerName: 'Vol', width: 70, disableColumnMenu: true, align: 'center', headerAlign: 'center', cellClassName: `${gstyles.text_bold}` },
                { field: 'trade__result_bruto__brl', headerName: 'Bruto BRL', flex: 1, disableColumnMenu: true, renderCell: resultCell },
                { field: 'trade__custo', headerName: 'Custo', flex: 1, disableColumnMenu: true, renderCell: custoCell },
                {
                    field: 'trade__result_liquido__brl',
                    headerName: 'Líquido BRL',
                    flex: 1,
                    disableColumnMenu: true,
                    renderCell: resultCell,
                },
                { field: 'trade__observacoes', headerName: 'Obs.', flex: 3, disableColumnMenu: true, sortable: false },
                { field: 'trade__erro', headerName: 'Erro', width: 70, disableColumnMenu: true, align: 'center', headerAlign: 'center', renderCell: erroCell },
            ],
            rowsPerPage: [11],
            sortingModel: [{ field: 'trade__seq', sort: 'desc' }],
        }),
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
                <DataGrid
                    sortingOrder={['asc', 'desc']}
                    disableSelectionOnClick
                    rowsPerPageOptions={dg_options.rowsPerPage}
                    pageSize={11}
                    density='compact'
                    columns={dg_options.columns}
                    rows={props.rows}
                    getRowId={getRowId}
                    initialState={{
                        sorting: {
                            sortModel: dg_options.sortingModel,
                        },
                    }}
                    sx={{ px: 2 }}
                    componentsProps={{ cellContent: { className: `${gstyles.text_small}` } }}
                />
            </div>
        </Paper>
    );
};

export default DatagridOps;
