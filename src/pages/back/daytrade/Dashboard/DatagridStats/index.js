import { Paper, Tab, Table, TableBody, TableCell, TableFooter, TableHead, TableRow, Tabs } from '@mui/material';
import React, { useCallback, useMemo, useState } from 'react';

import styles from './datagrid-stats.module.scss';

const DatagridStats = (props) => {
    /*******
     * VARS
     *******/
    const dd_periodo_label = useMemo(() => {
        if (props.periodoCalc === 1) return 'trades';
        if (props.periodoCalc === 2) return 'dias';
        if (props.periodoCalc === 3) return 'meses';
        return '??';
    }, [props.periodoCalc]);

    /*********
     * STATES
     *********/
    const [showGrid, setShowGrid] = useState(0);

    /***********
     * HANDLERS
     ***********/
    const handlerChangeGrid = useCallback(() => {
        setShowGrid((prevState) => (showGrid + 1) % 2);
    }, [showGrid]);

    return (
        <Paper sx={{ px: 2, pb: 2 }}>
            <Tabs value={showGrid} onChange={handlerChangeGrid} TabIndicatorProps={{ root: { minHeight: '16px', padding: '8px 16px' } }} sx={{ py: 1, minHeight: '16px' }}>
                <Tab label='Acert.' />
                <Tab label='R:G' />
            </Tabs>
            {showGrid === 0 ? (
                <Table size='small'>
                    <TableHead>
                        <TableRow>
                            <TableCell className={`${styles.dg_header} ${styles.col_subheader}`} align='left' colSpan={2}>
                                Cenário
                            </TableCell>
                            <TableCell className={`${styles.dg_header} ${styles.col_subheader}`} align='center'>
                                N° Total
                            </TableCell>
                            <TableCell className={`${styles.dg_header} ${styles.col_subheader}`} align='center'>
                                Gain
                            </TableCell>
                            <TableCell className={`${styles.dg_header} ${styles.col_subheader}`} align='center'>
                                Loss
                            </TableCell>
                            <TableCell className={`${styles.dg_header} ${styles.col_subheader}`} align='center'>
                                0x0
                            </TableCell>
                            <TableCell className={`${styles.dg_header} ${styles.col_subheader}`} align='center'>
                                Erro
                            </TableCell>
                            <TableCell className={`${styles.dg_header} ${styles.col_subheader}`} align='center' colSpan={3}>
                                Result.
                            </TableCell>
                            <TableCell className={`${styles.dg_header} ${styles.col_subheader}`} align='center'>
                                Edge
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {Object.entries(props.stats.dashboard_ops__table_stats__byCenario).map(([c_name, c]) => (
                            <TableRow key={`dg_cenario_row_${c_name}`}>
                                <TableCell align='left'>
                                    {/* prettier-ignore */}
                                    <span className={`${styles.trades__total_perc} ${styles.text_muted} ${styles.text_tiny}`}>{`(${c.trades__total_perc.toFixed(2)}%)`}</span>
                                </TableCell>
                                <TableCell align='left'>
                                    {/* prettier-ignore */}
                                    <span className={`${styles.cenario} ${styles.text_bold}`}>{c_name}</span>
                                </TableCell>
                                {/*
                                    N° TRADES 
                                */}
                                <TableCell className={`${styles.col_divider}`} align='center'>
                                    {/* prettier-ignore */}
                                    <span className={`${styles.trades__total} ${styles.text_small}`}>{c.trades__total}</span>
                                </TableCell>
                                <TableCell align='center'>
                                    {/* prettier-ignore */}
                                    <span className={`${styles.trades__positivo} ${styles.text_small} ${styles.text_success}`}>{c.trades__positivo}</span>
                                    {/* prettier-ignore */}
                                    <span className={`${styles.trades__positivo_perc} ${styles.text_margin_left} ${styles.text_tiny} ${styles.text_success}`}>{`(${c.trades__positivo_perc.toFixed(2)}%)`}</span>
                                </TableCell>
                                <TableCell align='center'>
                                    {/* prettier-ignore */}
                                    <span className={`${styles.trades__negativo} ${styles.text_small} ${styles.text_danger}`}>{c.trades__negativo}</span>
                                    {/* prettier-ignore */}
                                    <span className={`${styles.trades__negativo_perc} ${styles.text_margin_left} ${styles.text_tiny} ${styles.text_danger}`}>{`(${c.trades__negativo_perc.toFixed(2)}%)`}</span>
                                </TableCell>
                                <TableCell align='center'>
                                    {/* prettier-ignore */}
                                    <span className={`${styles.trades__empate} ${styles.text_small}`}>{c.trades__empate}</span>
                                    {/* prettier-ignore */}
                                    <span className={`${styles.trades__empate_perc} ${styles.text_margin_left} ${styles.text_tiny}`}>{`(${c.trades__empate_perc.toFixed(2)}%)`}</span>
                                </TableCell>
                                <TableCell align='center'>
                                    {/* prettier-ignore */}
                                    <span className={`${styles.trades__erro} ${styles.text_small} ${styles.text_primary}`}>{c.trades__erro}</span>
                                    {/* prettier-ignore */}
                                    <span className={`${styles.trades__erro_perc} ${styles.text_margin_left} ${styles.text_tiny} ${styles.text_primary}`}>{`(${c.trades__erro_perc !== '--' ? `${c.trades__erro_perc.toFixed(2)}%` : '--'})`}</span>
                                </TableCell>
                                {/*
                                    RESULT.
                                */}
                                <TableCell className={`${styles.col_divider}`} align='center'>
                                    {/* prettier-ignore */}
                                    <span className={`${styles.result__lucro_brl} ${styles.text_small}`}>{`R$ ${c.result__lucro_brl.toFixed(2)}`}</span>
                                    {/* prettier-ignore */}
                                    <span className={`${styles.result__lucro_S} ${styles.text_margin_left} ${styles.text_tiny}`}>{`${c.result__lucro_S.toFixed(1).replace(/[.]0+$/, '')}S`}</span>
                                </TableCell>
                                <TableCell align='center'>
                                    {/* prettier-ignore */}
                                    <span className={`${styles.result__lucro_R} ${styles.text_small}`}>{c.result__lucro_R !== '--' ? `${c.result__lucro_R.toFixed(3)}R` : c.result__lucro_R}</span>
                                </TableCell>
                                <TableCell align='center'>
                                    {/* prettier-ignore */}
                                    <span className={`${styles.result__lucro_perc} ${styles.text_small}`}>{c.result__lucro_perc !== '--' ? `${c.result__lucro_perc.toFixed(2)}%` : c.result__lucro_perc}</span>
                                </TableCell>
                                {/*
                                    EDGE
                                */}
                                <TableCell className={`${styles.col_divider}`} align='center'>
                                    {/* prettier-ignore */}
                                    <span className={`${styles.stats__edge} ${styles.text_small}`}>{`${c.stats__edge.toFixed(2)}%`}</span>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                    <TableFooter>
                        <TableRow>
                            <TableCell></TableCell>
                            <TableCell variant='body'>
                                {/* prettier-ignore */}
                                <span className={`${styles.text_bold}`}>Total</span>
                            </TableCell>
                            {/*
                                N° TRADES 
                            */}
                            <TableCell className={`${styles.col_divider}`} variant='body' align='center'>
                                {/* prettier-ignore */}
                                <span className={`${styles.trades__total} ${styles.text_small}`}>{props.stats.dashboard_ops__table_stats.trades__total}</span>
                            </TableCell>
                            <TableCell variant='body' align='center'>
                                {/* prettier-ignore */}
                                <span className={`${styles.trades__positivo} ${styles.text_small} ${styles.text_success}`}>{props.stats.dashboard_ops__table_stats.trades__positivo}</span>
                                {/* prettier-ignore */}
                                <span className={`${styles.trades__positivo_perc} ${styles.text_margin_left} ${styles.text_tiny} ${styles.text_success}`}>{`(${props.stats.dashboard_ops__table_stats.trades__positivo_perc.toFixed(2)}%)`}</span>
                            </TableCell>
                            <TableCell variant='body' align='center'>
                                {/* prettier-ignore */}
                                <span className={`${styles.trades__negativo} ${styles.text_small} ${styles.text_danger}`}>{props.stats.dashboard_ops__table_stats.trades__negativo}</span>
                                {/* prettier-ignore */}
                                <span className={`${styles.trades__negativo_perc} ${styles.text_margin_left} ${styles.text_tiny} ${styles.text_danger}`}>{`(${props.stats.dashboard_ops__table_stats.trades__negativo_perc.toFixed(2)}%)`}</span>
                            </TableCell>
                            <TableCell variant='body' align='center'>
                                {/* prettier-ignore */}
                                <span className={`${styles.trades__empate} ${styles.text_small}`}>{props.stats.dashboard_ops__table_stats.trades__empate}</span>
                                {/* prettier-ignore */}
                                <span className={`${styles.trades__empate_perc} ${styles.text_margin_left} ${styles.text_tiny}`}>{`(${props.stats.dashboard_ops__table_stats.trades__empate_perc.toFixed(2)}%)`}</span>
                            </TableCell>
                            <TableCell variant='body' align='center'>
                                {/* prettier-ignore */}
                                <span className={`${styles.trades__erro} ${styles.text_small} ${styles.text_primary}`}>{props.stats.dashboard_ops__table_stats.trades__erro}</span>
                                {/* prettier-ignore */}
                                <span className={`${styles.trades__erro_perc} ${styles.text_margin_left} ${styles.text_tiny} ${styles.text_primary}`}>{`(${props.stats.dashboard_ops__table_stats.trades__erro_perc !== '--' ? `${props.stats.dashboard_ops__table_stats.trades__erro_perc.toFixed(2)}%` : '--' })`}</span>
                            </TableCell>
                            {/*
                                RESULT.
                            */}
                            <TableCell className={`${styles.col_divider}`} variant='body' align='center'>
                                {/* prettier-ignore */}
                                <span className={`${styles.result__lucro_brl} ${styles.text_small}`}>{`R$ ${props.stats.dashboard_ops__table_stats.result__lucro_brl.toFixed(2)}`}</span>
                                {/* prettier-ignore */}
                                <span className={`${styles.result__lucro_S} ${styles.text_margin_left} ${styles.text_tiny}`}>{`${props.stats.dashboard_ops__table_stats.result__lucro_S.toFixed(1).replace(/[.]0+$/, '')}S`}</span>
                            </TableCell>
                            <TableCell variant='body' align='center'>
                                {/* prettier-ignore */}
                                <span className={`${styles.result__lucro_R} ${styles.text_small}`}>{props.stats.dashboard_ops__table_stats.result__lucro_R !== '--' ? `${props.stats.dashboard_ops__table_stats.result__lucro_R.toFixed(3)}R` : props.stats.dashboard_ops__table_stats.result__lucro_R}</span>
                            </TableCell>
                            <TableCell variant='body' align='center'>
                                {/* prettier-ignore */}
                                <span className={`${styles.result__lucro_perc} ${styles.text_small}`}>{props.stats.dashboard_ops__table_stats.result__lucro_perc !== '--' ? `${props.stats.dashboard_ops__table_stats.result__lucro_perc.toFixed(2)}%` : props.stats.dashboard_ops__table_stats.result__lucro_perc}</span>
                            </TableCell>
                            {/*
                                EDGE
                            */}
                            <TableCell className={`${styles.col_divider}`} variant='body' align='center'>
                                {/* prettier-ignore */}
                                <span className={`${styles.stats__edge} ${styles.text_small}`}>{`${props.stats.dashboard_ops__table_stats.stats__edge.toFixed(2)}%`}</span>
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell></TableCell>
                            <TableCell></TableCell>
                            <TableCell></TableCell>
                            <TableCell className={`${styles.dg_header} ${styles.col_subheader}`} variant='head' colSpan={2} align='center'>
                                Seq. Máxima
                            </TableCell>
                            <TableCell className={`${styles.dg_header} ${styles.col_subheader}`} variant='head' colSpan={2} align='center'>
                                Vol. Média
                            </TableCell>
                            <TableCell className={`${styles.dg_header} ${styles.col_subheader}`} variant='head' colSpan={3} align='center'>
                                Result. Médio p/ Mês
                            </TableCell>
                            <TableCell></TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell></TableCell>
                            <TableCell></TableCell>
                            <TableCell></TableCell>
                            {/*
                                Seq. Máx e Média de trades
                            */}
                            <TableCell variant='body' align='center'>
                                {/* prettier-ignore */}
                                <span className={`${styles.trades__max_seq_positivo} ${styles.text_small} ${styles.text_success}`}>{props.stats.dashboard_ops__table_stats.trades__max_seq_positivo}</span>
                                {/* prettier-ignore */}
                                <span className={`${styles.trades__max_seq_positivo_medio} ${styles.text_margin_left} ${styles.text_tiny} ${styles.text_success}`}>{`(~${props.stats.dashboard_ops__table_stats.trades__max_seq_positivo_medio.toFixed(2)})`}</span>
                            </TableCell>
                            <TableCell variant='body' align='center'>
                                {/* prettier-ignore */}
                                <span className={`${styles.trades__max_seq_negativo} ${styles.text_small} ${styles.text_danger}`}>{props.stats.dashboard_ops__table_stats.trades__max_seq_negativo}</span>
                                {/* prettier-ignore */}
                                <span className={`${styles.trades__max_seq_negativo_medio} ${styles.text_margin_left} ${styles.text_tiny} ${styles.text_danger}`}>{`(~${props.stats.dashboard_ops__table_stats.trades__max_seq_negativo_medio.toFixed(2)})`}</span>
                            </TableCell>
                            <TableCell variant='body' align='center' colSpan={2}>
                                {/* prettier-ignore */}
                                <span className={`${styles.stats__media_vol} ${styles.text_small}`}>{props.stats.dashboard_ops__table_stats.stats__media_vol !== '--' ? props.stats.dashboard_ops__table_stats.stats__media_vol.toFixed(2) : props.stats.dashboard_ops__table_stats.stats__media_vol}</span>
                            </TableCell>
                            {/*
                                Média Lucro por Período
                            */}
                            <TableCell variant='body' align='center'>
                                {/* prettier-ignore */}
                                <span className={`${styles.result__lucro_medio_brl} ${styles.text_small}`}>{`R$ ${props.stats.dashboard_ops__table_stats.result__lucro_medio_brl.toFixed(2)}`}</span>
                            </TableCell>
                            <TableCell variant='body' align='center'>
                                {/* prettier-ignore */}
                                <span className={`${styles.result__lucro_medio_R } ${styles.text_small}`}>{props.stats.dashboard_ops__table_stats.result__lucro_medio_R  !== '--' ? `${props.stats.dashboard_ops__table_stats.result__lucro_medio_R .toFixed(3)}R` : props.stats.dashboard_ops__table_stats.result__lucro_medio_R }</span>
                            </TableCell>
                            <TableCell variant='body' align='center'>
                                {/* prettier-ignore */}
                                <span className={`${styles.result__lucro_medio_perc } ${styles.text_small}`}>{props.stats.dashboard_ops__table_stats.result__lucro_medio_perc  !== '--' ? `${props.stats.dashboard_ops__table_stats.result__lucro_medio_perc .toFixed(2)}%` : props.stats.dashboard_ops__table_stats.result__lucro_medio_perc }</span>
                            </TableCell>
                            <TableCell></TableCell>
                        </TableRow>
                    </TableFooter>
                </Table>
            ) : (
                <Table size='small'>
                    <TableHead>
                        <TableRow>
                            <TableCell className={`${styles.dg_header} ${styles.col_subheader}`} align='left' colSpan={2}>
                                Cenário
                            </TableCell>
                            <TableCell className={`${styles.dg_header} ${styles.col_subheader}`} align='center'>
                                R:G
                            </TableCell>
                            <TableCell className={`${styles.dg_header} ${styles.col_subheader}`} align='center'>
                                Gain Médio
                            </TableCell>
                            <TableCell className={`${styles.dg_header} ${styles.col_subheader}`} align='center'>
                                Loss Médio
                            </TableCell>
                            <TableCell className={`${styles.dg_header} ${styles.col_subheader}`} align='center'>
                                Expect.
                            </TableCell>
                            <TableCell className={`${styles.dg_header} ${styles.col_subheader}`} align='center'>
                                DP
                            </TableCell>
                            <TableCell className={`${styles.dg_header} ${styles.col_subheader}`} align='center'>
                                FL
                            </TableCell>
                            <TableCell className={`${styles.dg_header} ${styles.col_subheader}`} align='center' colSpan={2}>
                                Edge
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {Object.entries(props.stats.dashboard_ops__table_stats__byCenario).map(([c_name, c]) => (
                            <TableRow key={`dg2_cenario_row_${c_name}`}>
                                <TableCell align='left'>
                                    {/* prettier-ignore */}
                                    <span className={`${styles.trades__total_perc} ${styles.text_muted} ${styles.text_tiny}`}>{`(${c.trades__total_perc.toFixed(2)}%)`}</span>
                                </TableCell>
                                <TableCell align='left'>
                                    {/* prettier-ignore */}
                                    <span className={`${styles.cenario} ${styles.text_bold}`}>{c_name}</span>
                                </TableCell>
                                {/*
                                    R:G 
                                */}
                                <TableCell className={`${styles.col_divider}`} align='center'>
                                    {/* prettier-ignore */}
                                    <span className={`${styles.stats__rrMedio} ${styles.text_small}`}>{c.stats__rrMedio.toFixed(2)}</span>
                                </TableCell>
                                <TableCell align='center'>
                                    {/* prettier-ignore */}
                                    <span className={`${styles.result__mediaGain_R} ${styles.text_tiny} ${styles.text_success}`}>{c.result__mediaGain_R !== '--' ? `${c.result__mediaGain_R.toFixed(3)}R` : c.result__mediaGain_R}</span>
                                    {/* prettier-ignore */}
                                    <span className={`${styles.result__mediaGain_brl} ${styles.text_margin_left} ${styles.text_small} ${styles.text_success}`}>{`R$ ${c.result__mediaGain_brl.toFixed(2)}`}</span>
                                    {/* prettier-ignore */}
                                    <span className={`${styles.result__mediaGain_perc} ${styles.text_margin_left} ${styles.text_tiny} ${styles.text_success}`}>{c.result__mediaGain_perc !== '--' ? `${c.result__mediaGain_perc.toFixed(2)}%` : c.result__mediaGain_perc}</span>
                                </TableCell>
                                <TableCell align='center'>
                                    {/* prettier-ignore */}
                                    <span className={`${styles.result__mediaLoss_R} ${styles.text_tiny} ${styles.text_danger}`}>{c.result__mediaLoss_R !== '--' ? `${c.result__mediaLoss_R.toFixed(3)}R` : c.result__mediaLoss_R}</span>
                                    {/* prettier-ignore */}
                                    <span className={`${styles.result__mediaLoss_brl} ${styles.text_margin_left} ${styles.text_small} ${styles.text_danger}`}>{`R$ ${c.result__mediaLoss_brl.toFixed(2)}`}</span>
                                    {/* prettier-ignore */}
                                    <span className={`${styles.result__mediaLoss_perc} ${styles.text_margin_left} ${styles.text_tiny} ${styles.text_danger}`}>{c.result__mediaLoss_perc !== '--' ? `${c.result__mediaLoss_perc.toFixed(2)}%` : c.result__mediaLoss_perc}</span>
                                </TableCell>
                                {/*
                                    EXPECT.
                                */}
                                <TableCell className={`${styles.col_divider}`} align='center'>
                                    {/* prettier-ignore */}
                                    <span className={`${styles.stats__expect_R} ${styles.text_tiny}`}>{c.stats__expect_R !== '--' ? `${c.stats__expect_R.toFixed(3)}R` : c.stats__expect_R}</span>
                                    {/* prettier-ignore */}
                                    <span className={`${styles.stats__expect_brl} ${styles.text_margin_left} ${styles.text_small}`}>{`R$ ${c.stats__expect_brl.toFixed(2)}`}</span>
                                    {/* prettier-ignore */}
                                    <span className={`${styles.stats__expect_perc} ${styles.text_margin_left} ${styles.text_tiny}`}>{c.stats__expect_perc !== '--' ? `${c.stats__expect_perc.toFixed(2)}%` : c.stats__expect_perc}</span>
                                </TableCell>
                                {/*
                                    DP
                                */}
                                <TableCell align='center'>
                                    {/* prettier-ignore */}
                                    <span className={`${styles.stats__dp_R} ${styles.text_tiny}`}>{c.stats__dp_R !== '--' ? `${c.stats__dp_R.toFixed(3)}R` : c.stats__dp_R}</span>
                                    {/* prettier-ignore */}
                                    <span className={`${styles.stats__dp_brl} ${styles.text_margin_left} ${styles.text_small}`}>{`R$ ${c.stats__dp_brl.toFixed(2)}`}</span>
                                    {/* prettier-ignore */}
                                    <span className={`${styles.stats__dp_perc} ${styles.text_margin_left} ${styles.text_tiny}`}>{c.stats__dp_perc !== '--' ? `${c.stats__dp_perc.toFixed(2)}%` : c.stats__dp_perc}</span>
                                </TableCell>
                                {/*
                                    FL
                                */}
                                <TableCell align='center'>
                                    {/* prettier-ignore */}
                                    <span className={`${styles.stats__fatorLucro} ${styles.text_small}`}>{c.stats__fatorLucro.toFixed(2)}</span>
                                </TableCell>
                                {/*
                                    EDGE + BREAKEVEN
                                */}
                                <TableCell align='center'>
                                    {/* prettier-ignore */}
                                    <span className={`${styles.stats__breakeven} ${styles.text_tiny} ${styles.text_muted}`}>{`${c.stats__breakeven.toFixed(2)}%`}</span>
                                </TableCell>
                                <TableCell align='center'>
                                    {/* prettier-ignore */}
                                    <span className={`${styles.stats__edge} ${styles.text_small}`}>{`${c.stats__edge.toFixed(2)}%`}</span>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                    <TableFooter>
                        <TableRow>
                            <TableCell></TableCell>
                            <TableCell variant='body'>
                                {/* prettier-ignore */}
                                <span className={`${styles.text_bold}`}>Total</span>
                            </TableCell>
                            {/*
                                R:G 
                            */}
                            <TableCell className={`${styles.col_divider}`} variant='body' align='center'>
                                {/* prettier-ignore */}
                                <span className={`${styles.stats__rrMedio} ${styles.text_small}`}>{props.stats.dashboard_ops__table_stats.stats__rrMedio.toFixed(2)}</span>
                            </TableCell>
                            <TableCell variant='body' align='center'>
                                {/* prettier-ignore */}
                                <span className={`${styles.result__mediaGain_R} ${styles.text_tiny} ${styles.text_success}`}>{props.stats.dashboard_ops__table_stats.result__mediaGain_R !== '--' ? `${props.stats.dashboard_ops__table_stats.result__mediaGain_R.toFixed(3)}R` : props.stats.dashboard_ops__table_stats.result__mediaGain_R}</span>
                                {/* prettier-ignore */}
                                <span className={`${styles.result__mediaGain_brl} ${styles.text_margin_left} ${styles.text_small} ${styles.text_success}`}>{`R$ ${props.stats.dashboard_ops__table_stats.result__mediaGain_brl.toFixed(2)}`}</span>
                                {/* prettier-ignore */}
                                <span className={`${styles.result__mediaGain_perc} ${styles.text_margin_left} ${styles.text_tiny} ${styles.text_success}`}>{props.stats.dashboard_ops__table_stats.result__mediaGain_perc !== '--' ? `${props.stats.dashboard_ops__table_stats.result__mediaGain_perc.toFixed(2)}%` : props.stats.dashboard_ops__table_stats.result__mediaGain_perc}</span>
                            </TableCell>
                            <TableCell variant='body' align='center'>
                                {/* prettier-ignore */}
                                <span className={`${styles.result__mediaLoss_R} ${styles.text_tiny} ${styles.text_danger}`}>{props.stats.dashboard_ops__table_stats.result__mediaLoss_R !== '--' ? `${props.stats.dashboard_ops__table_stats.result__mediaLoss_R.toFixed(3)}R` : props.stats.dashboard_ops__table_stats.result__mediaLoss_R}</span>
                                {/* prettier-ignore */}
                                <span className={`${styles.result__mediaLoss_brl} ${styles.text_margin_left} ${styles.text_small} ${styles.text_danger}`}>{`R$ ${props.stats.dashboard_ops__table_stats.result__mediaLoss_brl.toFixed(2)}`}</span>
                                {/* prettier-ignore */}
                                <span className={`${styles.result__mediaLoss_perc} ${styles.text_margin_left} ${styles.text_tiny} ${styles.text_danger}`}>{props.stats.dashboard_ops__table_stats.result__mediaLoss_perc !== '--' ? `${props.stats.dashboard_ops__table_stats.result__mediaLoss_perc.toFixed(2)}%` : props.stats.dashboard_ops__table_stats.result__mediaLoss_perc}</span>
                            </TableCell>
                            {/*
                                EXPECT.
                            */}
                            <TableCell className={`${styles.col_divider}`} variant='body' align='center'>
                                {/* prettier-ignore */}
                                <span className={`${styles.stats__expect_R} ${styles.text_tiny}`}>{props.stats.dashboard_ops__table_stats.stats__expect_R !== '--' ? `${props.stats.dashboard_ops__table_stats.stats__expect_R.toFixed(3)}R` : props.stats.dashboard_ops__table_stats.stats__expect_R}</span>
                                {/* prettier-ignore */}
                                <span className={`${styles.stats__expect_brl} ${styles.text_margin_left} ${styles.text_small}`}>{`R$ ${props.stats.dashboard_ops__table_stats.stats__expect_brl.toFixed(2)}`}</span>
                                {/* prettier-ignore */}
                                <span className={`${styles.stats__expect_perc} ${styles.text_margin_left} ${styles.text_tiny}`}>{props.stats.dashboard_ops__table_stats.stats__expect_perc !== '--' ? `${props.stats.dashboard_ops__table_stats.stats__expect_perc.toFixed(2)}%` : props.stats.dashboard_ops__table_stats.stats__expect_perc}</span>
                            </TableCell>
                            {/*
                                DP
                            */}
                            <TableCell variant='body' align='center'>
                                {/* prettier-ignore */}
                                <span className={`${styles.stats__dp_R} ${styles.text_tiny}`}>{props.stats.dashboard_ops__table_stats.stats__dp_R !== '--' ? `${props.stats.dashboard_ops__table_stats.stats__dp_R.toFixed(3)}R` : props.stats.dashboard_ops__table_stats.stats__dp_R}</span>
                                {/* prettier-ignore */}
                                <span className={`${styles.stats__dp_brl} ${styles.text_margin_left} ${styles.text_small}`}>{`R$ ${props.stats.dashboard_ops__table_stats.stats__dp_brl.toFixed(2)}`}</span>
                                {/* prettier-ignore */}
                                <span className={`${styles.stats__dp_perc} ${styles.text_margin_left} ${styles.text_tiny}`}>{props.stats.dashboard_ops__table_stats.stats__dp_perc !== '--' ? `${props.stats.dashboard_ops__table_stats.stats__dp_perc.toFixed(2)}%` : props.stats.dashboard_ops__table_stats.stats__dp_perc}</span>
                            </TableCell>
                            {/*
                                FL
                            */}
                            <TableCell variant='body' align='center'>
                                {/* prettier-ignore */}
                                <span className={`${styles.stats__fatorLucro} ${styles.text_small}`}>{props.stats.dashboard_ops__table_stats.stats__fatorLucro.toFixed(2)}</span>
                            </TableCell>
                            {/*
                                EDGE + BREAKEVEN
                            */}
                            <TableCell variant='body' align='center'>
                                {/* prettier-ignore */}
                                <span className={`${styles.stats__breakeven} ${styles.text_tiny} ${styles.text_muted}`}>{`${props.stats.dashboard_ops__table_stats.stats__breakeven.toFixed(2)}%`}</span>
                            </TableCell>
                            <TableCell variant='body' align='center'>
                                {/* prettier-ignore */}
                                <span className={`${styles.stats__edge} ${styles.text_small}`}>{`${props.stats.dashboard_ops__table_stats.stats__edge.toFixed(2)}%`}</span>
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell></TableCell>
                            <TableCell></TableCell>
                            <TableCell className={`${styles.dg_header} ${styles.col_subheader}`} variant='head' align='center'>
                                Total DD
                            </TableCell>
                            <TableCell className={`${styles.dg_header} ${styles.col_subheader}`} variant='head' align='center'>
                                DD Curr.
                            </TableCell>
                            <TableCell className={`${styles.dg_header} ${styles.col_subheader}`} variant='head' align='center'>
                                DD Máx.
                            </TableCell>
                            <TableCell className={`${styles.dg_header} ${styles.col_subheader}`} variant='head' align='center'>
                                Topo Hist.
                            </TableCell>
                            <TableCell className={`${styles.dg_header} ${styles.col_subheader}`} variant='head' align='center'>
                                Capital Corr.
                            </TableCell>
                            <TableCell className={`${styles.dg_header} ${styles.col_subheader}`} variant='head' align='center'>
                                Stops até Ruína.
                            </TableCell>
                            <TableCell></TableCell>
                            <TableCell></TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell></TableCell>
                            <TableCell></TableCell>
                            {/*
                                Drawdown
                            */}
                            <TableCell variant='body' align='center'>
                                {/* prettier-ignore */}
                                <span className={`${styles.stats__drawdown_qtd} ${styles.text_small}`}>{props.stats.dashboard_ops__table_stats.stats__drawdown_qtd}</span>
                            </TableCell>
                            <TableCell variant='body' align='center'>
                                {/* prettier-ignore */}
                                <span className={`${styles.stats__drawdown} ${styles.text_small}`}>{`R$ ${props.stats.dashboard_ops__table_stats.stats__drawdown.toFixed(2)}`}</span>
                                {/* prettier-ignore */}
                                <span className={`${styles.stats__drawdown_periodo} ${styles.text_margin_left} ${styles.text_tiny}`}>{`${props.stats.dashboard_ops__table_stats.stats__drawdown_periodo} ${dd_periodo_label}`}</span>
                            </TableCell>
                            <TableCell variant='body' align='center'>
                                {/* prettier-ignore */}
                                <span className={`${styles.stats__drawdown_max} ${styles.text_small}`}>{`R$ ${props.stats.dashboard_ops__table_stats.stats__drawdown_max.toFixed(2)}`}</span>
                                {/* prettier-ignore */}
                                <span className={`${styles.stats__drawdown_max_periodo} ${styles.text_margin_left} ${styles.text_tiny}`}>{`${props.stats.dashboard_ops__table_stats.stats__drawdown_max_periodo} ${dd_periodo_label}`}</span>
                            </TableCell>
                            {/*
                                Topo Histórico
                            */}
                            <TableCell variant='body' align='center'>
                                {/* prettier-ignore */}
                                <span className={`${styles.stats__drawdown_topoHistorico } ${styles.text_small}`}>{`R$ ${props.stats.dashboard_ops__table_stats.stats__drawdown_topoHistorico.toFixed(2)}`}</span>
                            </TableCell>
                            {/*
                                Capital Corrente
                            */}
                            <TableCell variant='body' align='center'>
                                {/* prettier-ignore */}
                                <span className={`${styles.stats__valorInicial_com_lucro } ${styles.text_small}`}>{props.stats.dashboard_ops__table_stats.stats__valorInicial_com_lucro  !== '--' ? `R$ ${props.stats.dashboard_ops__table_stats.stats__valorInicial_com_lucro.toFixed(2)}` : props.stats.dashboard_ops__table_stats.stats__valorInicial_com_lucro }</span>
                            </TableCell>
                            {/*
                                Stops até Ruína
                            */}
                            <TableCell variant='body' align='center'>
                                {/* prettier-ignore */}
                                <span className={`${styles.stats__stops_ruina} ${styles.text_tiny}`}>{props.stats.dashboard_ops__table_stats.stats__stops_ruina !== '--' ? `${props.stats.dashboard_ops__table_stats.stats__stops_ruina.toFixed(0)}R` : props.stats.dashboard_ops__table_stats.stats__stops_ruina}</span>
                            </TableCell>
                            <TableCell></TableCell>
                            <TableCell></TableCell>
                        </TableRow>
                    </TableFooter>
                </Table>
            )}
        </Paper>
    );
};

export default DatagridStats;
