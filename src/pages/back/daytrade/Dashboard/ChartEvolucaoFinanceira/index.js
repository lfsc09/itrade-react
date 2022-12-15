import { Paper, Typography } from '@mui/material';
import React, { useMemo } from 'react';
import { Area, CartesianGrid, ComposedChart, Line, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import styles from './chart-evolucao-financeira.module.scss';

const tooltip_labelDics = {
    evolucao_patr: { show: true, label: 'Evolução Patr.' },
    sma20: { show: true, label: 'SMA20' },
    bandas: { show: false, label: 'Bandas B.' },
};

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length && payload?.[0]?.payload?.evolucao_patr !== null) {
        return (
            <div className={styles.tooltip_container}>
                <div key='label_title' className={styles.tooltip_line}>
                    <div className={styles.tooltip_line__label}>
                        Trade {label}
                        <span className={styles.tooltip_line__date}>{payload?.[0]?.payload?.date ?? ''}</span>
                    </div>
                </div>
                {payload.map((p) => {
                    return tooltip_labelDics[p.dataKey].show ? (
                        <div key={p.dataKey} className={styles.tooltip_line}>
                            <div className={styles.tooltip_line__label}>
                                {tooltip_labelDics[p.dataKey].label}
                                <span className={styles.tooltip_line__date}>{`R$ ${p.value.toFixed(2)}`}</span>
                            </div>
                        </div>
                    ) : (
                        <React.Fragment key={p.dataKey}></React.Fragment>
                    );
                })}
            </div>
        );
    }
    return null;
};

const ChartEvolucaoFinanceira = ({ chartData, statisticsChecksum }) => {
    /*******
     * VARS
     *******/
    const data = useMemo(() => {
        // Faz o tratamento dos dados para o Recharts
        let treatedData = [];
        let totalLength = chartData.labels.length > 100 ? chartData.labels.length : 100 + 1;

        // Trata os dados da evolução patrimonial
        for (let i = 0; i < totalLength; i++) {
            if (i in chartData.labels) {
                treatedData.push({
                    label: chartData.labels[i],
                    evolucao_patr: chartData.data[i],
                    date: chartData.date[i],
                    sma20: chartData.sma20[i],
                    bandas: [chartData.banda_inferior[i], chartData.banda_superior[i]],
                });
            } else {
                treatedData.push({
                    label: i,
                    evolucao_patr: null,
                    date: null,
                    sma20: null,
                    bandas: [null, null],
                });
            }
        }

        return treatedData;
    }, [statisticsChecksum]);

    return (
        <Paper sx={{ pt: 1, pr: 2 }}>
            <div className={styles.title}>
                <Typography variant='overline'>Evolução Patrimonial</Typography>
            </div>
            <ResponsiveContainer width='100%' height={420}>
                <ComposedChart data={data}>
                    <XAxis dataKey='label' type='number' tickCount={8} tickMargin={5} allowDecimals={false} />
                    <YAxis type='number' tickMargin={5} />
                    <Tooltip wrapperStyle={{ outline: 'none' }} content={<CustomTooltip />} filterNull={true} />
                    <CartesianGrid stroke='#e2e2e2' vertical={false} />
                    <Line type='linear' dataKey='evolucao_patr' stroke='#0d6efd' dot={false} activeDot={false} />
                    <Line type='linear' dataKey='sma20' stroke='#0d6efd' strokeDasharray='3 3' strokeWidth={0.5} dot={false} activeDot={false} />
                    <Area type='monotone' dataKey='bandas' fill='#0d6efd1a' stroke='#0d6efd1a' />
                    <ReferenceLine y={0} stroke='red' strokeWidth={0.5} />
                </ComposedChart>
            </ResponsiveContainer>
        </Paper>
    );
};

export default ChartEvolucaoFinanceira;
