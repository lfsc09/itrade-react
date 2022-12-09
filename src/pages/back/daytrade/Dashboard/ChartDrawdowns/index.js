import { Paper, Typography } from '@mui/material';
import React, { useMemo } from 'react';
import { CartesianGrid, ComposedChart, Line, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import styles from './chart-drawdowns.module.scss';

const tooltip_labelDics = {
    drawdowns: { show: true, label: 'Valor' },
    banda_sup1: { show: false, label: 'Bandas Sup1.' },
    banda_sup2: { show: false, label: 'Bandas Sup2.' },
};

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className={styles.tooltip_container}>
                <div key='label_title' className={styles.tooltip_line}>
                    <div className={styles.tooltip_line__label}>Drawdown {label}</div>
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

const ChartDrawdowns = ({ chartData, statisticsChecksum }) => {
    /*******
     * VARS
     *******/
    const data = useMemo(() => {
        // Faz o tratamento dos dados para o Recharts
        let treatedData = [];

        // Trata os dados da evolução patrimonial
        for (let i = 0; i < chartData.labels.length; i++) {
            treatedData.push({
                label: chartData.labels[i],
                drawdowns: chartData.data[i],
                banda_sup1: chartData.banda_superior1[i],
                banda_sup2: chartData.banda_superior2[i],
            });
        }

        return treatedData;
    }, [statisticsChecksum]);

    return (
        <Paper sx={{ pt: 1, pr: 2, height: '100%' }}>
            <div className={styles.title}>
                <Typography variant='overline'>Drawdowns</Typography>
            </div>
            <ResponsiveContainer width='100%' height={420}>
                <ComposedChart data={data}>
                    <XAxis dataKey='label' type='number' tickCount={8} tickMargin={5} allowDecimals={false} />
                    <YAxis type='number' tickMargin={5} />
                    <Tooltip wrapperStyle={{ outline: 'none' }} content={<CustomTooltip />} />
                    <CartesianGrid stroke='#e2e2e2' vertical={false} />
                    <Line type='step' dataKey='drawdowns' stroke='#0d6efd' dot={false} activeDot={false} />
                    <Line type='linear' dataKey='banda_sup1' stroke='#666' strokeDasharray='3 3' strokeWidth={0.5} dot={false} activeDot={false} />
                    <Line type='linear' dataKey='banda_sup2' stroke='#666' strokeDasharray='3 3' strokeWidth={0.5} dot={false} activeDot={false} />
                    <ReferenceLine y={0} stroke='red' strokeWidth={0.5} />
                </ComposedChart>
            </ResponsiveContainer>
        </Paper>
    );
};

export default ChartDrawdowns;
