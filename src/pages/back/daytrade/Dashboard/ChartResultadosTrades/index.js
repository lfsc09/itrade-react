import { Paper, Typography } from '@mui/material';
import React, { useMemo } from 'react';
import { Area, CartesianGrid, ComposedChart, Line, ReferenceLine, ResponsiveContainer, XAxis, YAxis } from 'recharts';

import styles from './chart-resultados-trades.module.scss';

const ChartResultadosTrades = ({ chartData, statisticsChecksum }) => {
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
                    results: [chartData.data[i] < 0 ? chartData.data[i] : 0, chartData.data[i] > 0 ? chartData.data[i] : 0],
                    media: chartData.banda_media[i],
                    bandas: [chartData.banda_inferior[i], chartData.banda_superior[i]],
                });
            } else {
                treatedData.push({
                    label: i,
                    results: [null, null],
                    media: null,
                    bandas: [null, null],
                });
            }
        }

        return treatedData;
    }, [statisticsChecksum]);

    const offset = useMemo(() => {
        const dataMax = Math.max(...chartData.data);
        const dataMin = Math.min(...chartData.data);

        if (dataMax <= 0) return 0;
        if (dataMin >= 0) return 1;
        return dataMax / (dataMax - dataMin);
    }, [statisticsChecksum]);

    return (
        <Paper sx={{ pt: 1, pr: 2 }}>
            <div className={styles.title}>
                <Typography variant='overline'>Trades</Typography>
            </div>
            <ResponsiveContainer width='100%' height={420}>
                <ComposedChart data={data}>
                    <XAxis dataKey='label' type='number' tickCount={8} tickMargin={5} allowDecimals={false} />
                    <YAxis type='number' tickMargin={5} />
                    <CartesianGrid stroke='#e2e2e2' vertical={false} />
                    <defs>
                        <linearGradient id='splitColor' x1='0' y1='0' x2='0' y2='1'>
                            <stop offset={offset} stopColor='green' stopOpacity={1} />
                            <stop offset={offset} stopColor='red' stopOpacity={1} />
                        </linearGradient>
                    </defs>
                    <Area type='step' dataKey='results' stroke='none' fill='url(#splitColor)' />
                    <Area type='monotone' dataKey='bandas' fillOpacity='0' stroke='#666' strokeDasharray='3 3' />
                    <Line type='monotone' dataKey='media' stroke='#666' dot={false} activeDot={false} />
                    {chartData.risco !== null ? <ReferenceLine y={chartData.risco} label='R' stroke='red' strokeWidth={0.5} ifOverflow='extendDomain' /> : <></>}
                </ComposedChart>
            </ResponsiveContainer>
        </Paper>
    );
};

export default ChartResultadosTrades;
