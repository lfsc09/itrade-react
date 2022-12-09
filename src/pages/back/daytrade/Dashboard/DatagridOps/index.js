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

const creditoCell = ({ value }) => {
    return <span className={`${gstyles.text_bold} ${gstyles.text_success} ${gstyles.text_small}`}>{`R$ ${value.toFixed(2)}`}</span>;
};

const debitoCell = ({ value }) => {
    return <span className={`${gstyles.text_bold} ${gstyles.text_danger} ${gstyles.text_small}`}>{`R$ ${value.toFixed(2)}`}</span>;
};

const resultCell_BRL = ({ value }) => {
    if (value > 0) return <span className={`${gstyles.text_bold} ${gstyles.text_success} ${gstyles.text_small}`}>{`R$ ${value.toFixed(2)}`}</span>;
    else if (value < 0) return <span className={`${gstyles.text_bold} ${gstyles.text_danger} ${gstyles.text_small}`}>{`R$ ${value.toFixed(2)}`}</span>;
    else return <span className={`${gstyles.text_bold} ${gstyles.text_muted} ${gstyles.text_small}`}>{`R$ ${value.toFixed(2)}`}</span>;
};
const resultCell_S = ({ value }) => {
    if (value > 0) return <span className={`${gstyles.text_bold} ${gstyles.text_success} ${gstyles.text_small}`}>{`${value.toFixed(1)}S`}</span>;
    else if (value < 0) return <span className={`${gstyles.text_bold} ${gstyles.text_danger} ${gstyles.text_small}`}>{`R$ ${value.toFixed(1)}S`}</span>;
    else return <span className={`${gstyles.text_bold} ${gstyles.text_muted} ${gstyles.text_small}`}>{`R$ ${value.toFixed(1)}S`}</span>;
};

const erroCell = ({ value }) => {
    if (value === 1) return <ReportProblem color='error' fontSize='small' />;
    return '';
};

const dataFormatter = ({ value }) => formatValue_fromRaw({ style: 'date' }, value);
const mesFormatter = ({ value }) => formatValue_fromRaw({ style: 'date', options: { month: 'short', year: 'numeric', timeZone: 'UTC' } }, value);
const rrMedioFormatter = ({ value }) => value.toFixed(2);

const DatagridOps = (props) => {
    const dg_options = useMemo(() => {
        if (props.periodoCalc === 1) {
            return {
                columns: [
                    {
                        field: 'trade__seq',
                        headerName: '#',
                        width: 50,
                        disableColumnMenu: true,
                        align: 'center',
                        headerAlign: 'center',
                        cellClassName: `${gstyles.text_bold} ${gstyles.text_muted} ${styles.dg_cell__small}`,
                    },
                    {
                        field: 'trade__data',
                        headerName: 'Data',
                        flex: 1,
                        disableColumnMenu: true,
                        sortable: false,
                        align: 'center',
                        headerAlign: 'center',
                        valueFormatter: dataFormatter,
                        cellClassName: `${gstyles.text_muted} ${gstyles.text_bold} ${styles.dg_cell__small}`,
                    },
                    {
                        field: 'trade__hora',
                        headerName: 'Hora',
                        flex: 1,
                        disableColumnMenu: true,
                        align: 'center',
                        headerAlign: 'center',
                        cellClassName: `${gstyles.text_muted} ${gstyles.text_bold} ${styles.dg_cell__small}`,
                    },
                    { field: 'trade__cenario', headerName: 'Cenário', flex: 1.8, disableColumnMenu: true, cellClassName: `${gstyles.text_bold} ${styles.dg_cell__small}` },
                    { field: 'trade__op', headerName: 'Op.', width: 70, disableColumnMenu: true, renderCell: opCell, align: 'center', headerAlign: 'center', sortable: false },
                    {
                        field: 'trade__cts',
                        headerName: 'Cts',
                        width: 70,
                        disableColumnMenu: true,
                        align: 'center',
                        headerAlign: 'center',
                        cellClassName: `${gstyles.text_bold} ${styles.dg_cell__small}`,
                    },
                    {
                        field: 'trade__retornoRisco',
                        headerName: 'Retorno x Risco',
                        flex: 1.5,
                        disableColumnMenu: true,
                        align: 'center',
                        headerAlign: 'center',
                        valueFormatter: rrMedioFormatter,
                        cellClassName: `${gstyles.text_bold} ${styles.dg_cell__small}`,
                    },
                    {
                        field: 'trade__result_bruto__brl',
                        headerName: 'Bruto BRL',
                        flex: 1,
                        disableColumnMenu: true,
                        align: 'center',
                        headerAlign: 'center',
                        renderCell: resultCell_BRL,
                    },
                    { field: 'trade__custo', headerName: 'Custo', flex: 1, disableColumnMenu: true, align: 'center', headerAlign: 'center', renderCell: debitoCell },
                    {
                        field: 'trade__result_liquido__brl',
                        headerName: 'Líquido BRL',
                        flex: 1,
                        disableColumnMenu: true,
                        align: 'center',
                        headerAlign: 'center',
                        renderCell: resultCell_BRL,
                    },
                    {
                        field: 'trade__observacoes',
                        headerName: 'Obs.',
                        flex: 2.5,
                        disableColumnMenu: true,
                        sortable: false,
                        cellClassName: `${gstyles.text_bold} ${gstyles.text_muted} ${styles.dg_cell__small}`,
                    },
                    { field: 'trade__erro', headerName: 'Erro', width: 70, disableColumnMenu: true, align: 'center', headerAlign: 'center', renderCell: erroCell },
                ],
                rowsPerPage: [11],
                sortingModel: [{ field: 'trade__seq', sort: 'desc' }],
            };
        } else if (props.periodoCalc === 2) {
            return {
                columns: [
                    {
                        field: 'dia__seq',
                        headerName: '#',
                        width: 50,
                        disableColumnMenu: true,
                        align: 'center',
                        headerAlign: 'center',
                        cellClassName: `${gstyles.text_bold} ${gstyles.text_muted} ${styles.dg_cell__small}`,
                    },
                    {
                        field: 'dia__data',
                        headerName: 'Data',
                        flex: 1,
                        disableColumnMenu: true,
                        sortable: false,
                        align: 'center',
                        headerAlign: 'center',
                        valueFormatter: dataFormatter,
                        cellClassName: `${gstyles.text_muted} ${gstyles.text_bold} ${styles.dg_cell__small}`,
                    },
                    {
                        field: 'dia__qtd_trades',
                        headerName: 'Ops',
                        width: 70,
                        disableColumnMenu: true,
                        align: 'center',
                        headerAlign: 'center',
                        cellClassName: `${gstyles.text_bold} ${styles.dg_cell__small}`,
                    },
                    {
                        field: 'dia__cts',
                        headerName: 'Cts',
                        width: 70,
                        disableColumnMenu: true,
                        align: 'center',
                        headerAlign: 'center',
                        cellClassName: `${gstyles.text_bold} ${styles.dg_cell__small}`,
                    },
                    {
                        field: 'dia__retornoRisco_medio',
                        headerName: 'Retorno x Risco M.',
                        flex: 1.5,
                        disableColumnMenu: true,
                        align: 'center',
                        headerAlign: 'center',
                        valueFormatter: rrMedioFormatter,
                        cellClassName: `${gstyles.text_bold} ${styles.dg_cell__small}`,
                    },
                    { field: 'dia__lucro_bruto__brl', headerName: 'L. Bruto', flex: 1, disableColumnMenu: true, align: 'center', headerAlign: 'center', renderCell: creditoCell },
                    { field: 'dia__prejuizo_bruto__brl', headerName: 'P. Bruto', flex: 1, disableColumnMenu: true, align: 'center', headerAlign: 'center', renderCell: debitoCell },
                    {
                        field: 'dia__result_bruto__brl',
                        headerName: 'Bruto BRL',
                        flex: 1,
                        disableColumnMenu: true,
                        align: 'center',
                        headerAlign: 'center',
                        renderCell: resultCell_BRL,
                    },
                    { field: 'dia__custo', headerName: 'Custos', flex: 1, disableColumnMenu: true, align: 'center', headerAlign: 'center', renderCell: debitoCell },
                    {
                        field: 'dia__result_liquido__brl',
                        headerName: 'Líquido BRL',
                        flex: 1,
                        disableColumnMenu: true,
                        align: 'center',
                        headerAlign: 'center',
                        renderCell: resultCell_BRL,
                    },
                    { field: 'dia__erro', headerName: 'Erro', width: 70, disableColumnMenu: true, align: 'center', headerAlign: 'center', renderCell: erroCell },
                ],
                rowsPerPage: [11],
                sortingModel: [{ field: 'dia__seq', sort: 'desc' }],
            };
        } else if (props.periodoCalc === 3) {
            return {
                columns: [
                    {
                        field: 'mes__seq',
                        headerName: '#',
                        width: 50,
                        disableColumnMenu: true,
                        align: 'center',
                        headerAlign: 'center',
                        cellClassName: `${gstyles.text_bold} ${gstyles.text_muted} ${styles.dg_cell__small}`,
                    },
                    {
                        field: 'mes__data',
                        headerName: 'Data',
                        flex: 1,
                        disableColumnMenu: true,
                        sortable: false,
                        align: 'center',
                        headerAlign: 'center',
                        valueFormatter: mesFormatter,
                        cellClassName: `${gstyles.text_muted} ${gstyles.text_bold} ${styles.dg_cell__small}`,
                    },
                    {
                        field: 'mes__qtd_trades',
                        headerName: 'Ops',
                        width: 70,
                        disableColumnMenu: true,
                        align: 'center',
                        headerAlign: 'center',
                        cellClassName: `${gstyles.text_bold} ${styles.dg_cell__small}`,
                    },
                    {
                        field: 'mes__cts',
                        headerName: 'Cts',
                        width: 70,
                        disableColumnMenu: true,
                        align: 'center',
                        headerAlign: 'center',
                        cellClassName: `${gstyles.text_bold} ${styles.dg_cell__small}`,
                    },
                    {
                        field: 'mes__retornoRisco_medio',
                        headerName: 'Retorno x Risco M.',
                        flex: 1.5,
                        disableColumnMenu: true,
                        align: 'center',
                        headerAlign: 'center',
                        valueFormatter: rrMedioFormatter,
                        cellClassName: `${gstyles.text_bold} ${styles.dg_cell__small}`,
                    },
                    { field: 'mes__lucro_bruto__brl', headerName: 'L. Bruto', flex: 1, disableColumnMenu: true, align: 'center', headerAlign: 'center', renderCell: creditoCell },
                    { field: 'mes__prejuizo_bruto__brl', headerName: 'P. Bruto', flex: 1, disableColumnMenu: true, align: 'center', headerAlign: 'center', renderCell: debitoCell },
                    {
                        field: 'mes__result_bruto__brl',
                        headerName: 'Bruto BRL',
                        flex: 1,
                        disableColumnMenu: true,
                        align: 'center',
                        headerAlign: 'center',
                        renderCell: resultCell_BRL,
                    },
                    { field: 'mes__custo', headerName: 'Custos', flex: 1, disableColumnMenu: true, align: 'center', headerAlign: 'center', renderCell: debitoCell },
                    {
                        field: 'mes__result_liquido__brl',
                        headerName: 'Líquido BRL',
                        flex: 1,
                        disableColumnMenu: true,
                        align: 'center',
                        headerAlign: 'center',
                        renderCell: resultCell_BRL,
                    },
                    { field: 'mes__erro', headerName: 'Erro', width: 70, disableColumnMenu: true, align: 'center', headerAlign: 'center', renderCell: erroCell },
                ],
                rowsPerPage: [11],
                sortingModel: [{ field: 'mes__seq', sort: 'desc' }],
            };
        }
        return {};
    }, [props.periodoCalc]);

    /***********
     * HANDLERS
     ***********/
    const getRowId = useCallback(
        (row_data) => {
            if (props.periodoCalc === 1) return row_data.trade__id;
            else if (props.periodoCalc === 2) return row_data.dia__seq;
            else if (props.periodoCalc === 3) return row_data.mes__seq;
        },
        [props.periodoCalc]
    );

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
