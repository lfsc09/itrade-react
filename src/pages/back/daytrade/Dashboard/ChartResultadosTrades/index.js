import { Paper, Typography } from '@mui/material';
import React, { useMemo } from 'react';
import { Area, Bar, CartesianGrid, Cell, ComposedChart, Line, ReferenceLine, ResponsiveContainer, XAxis, YAxis } from 'recharts';

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
                    results: chartData.data[i],
                    media: chartData.banda_media[i],
                    bandas: [chartData.banda_inferior[i], chartData.banda_superior[i]],
                });
            } else {
                treatedData.push({
                    label: i,
                    results: null,
                    media: null,
                    bandas: [null, null],
                });
            }
        }

        return treatedData;
    }, [statisticsChecksum]);

    return (
        <Paper sx={{ pt: 1, pr: 2, height: '100%' }}>
            <div className={styles.title}>
                <Typography variant='overline'>Trades</Typography>
            </div>
            <ResponsiveContainer width='100%' height={420}>
                <ComposedChart data={data}>
                    <XAxis dataKey='label' type='number' tickCount={8} tickMargin={5} allowDecimals={false} />
                    <YAxis type='number' tickMargin={5} />
                    <CartesianGrid stroke='#e2e2e2' vertical={false} />
                    <Bar dataKey='results' barSize={10}>
                        {data?.map((val, idx) => <Cell key={`bcell-${idx}`} fill={val.results > 0 ? '#198754' : val.results < 0 ? '#dc3545' : '#ced4da'} />) ?? <></>}
                    </Bar>
                    <Area type='monotone' dataKey='bandas' fillOpacity='0' stroke='#666' strokeDasharray='3 3' />
                    <Line type='monotone' dataKey='media' stroke='#666' strokeDasharray='3 3' dot={false} activeDot={false} />
                    {chartData.risco !== null ? <ReferenceLine y={chartData.risco} label='R' stroke='red' strokeWidth={0.5} ifOverflow='extendDomain' /> : <></>}
                </ComposedChart>
            </ResponsiveContainer>
        </Paper>
    );
};

export default ChartResultadosTrades;
