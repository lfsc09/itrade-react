import { Paper, Typography } from '@mui/material';
import React, { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import styles from './chart-resultados-hora.module.scss';

const labelsList = {
    1: ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'],
    2: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
    3: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
};

const tooltip_labelDics = {
    data_result: { show: true, label: 'Resultado', prefix: 'R$ ' },
    data_qtd: { show: true, label: 'Quantidade', prefix: '' },
};

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className={styles.tooltip_container}>
                <div key='label_title' className={styles.tooltip_line}>
                    <div className={styles.tooltip_line__label}>{label}</div>
                </div>
                {payload.map((p) => (
                    <div key={p.dataKey} className={styles.tooltip_line}>
                        <div className={styles.tooltip_line__label}>
                            {tooltip_labelDics[p.dataKey].label}
                            <span className={styles.tooltip_line__date}>{`${tooltip_labelDics[p.dataKey].prefix}${p.value.toFixed(2)}`}</span>
                        </div>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

const ChartResultadosHora = ({ chartData, statisticsChecksum, periodoCalc }) => {
    /*******
     * VARS
     *******/
    const data = useMemo(() => {
        // Faz o tratamento dos dados para o Recharts
        let treatedData = [];

        // Trata os dados da evolução patrimonial
        for (let i = 0; i < labelsList[periodoCalc].length; i++) {
            let fIndex = chartData.labels.findIndex((el) => el === labelsList[periodoCalc][i]);
            if (fIndex !== -1) {
                treatedData.push({
                    label: labelsList[periodoCalc][i],
                    data_result: chartData.data_result[fIndex],
                    data_qtd: chartData.data_qtd[fIndex],
                });
            } else {
                treatedData.push({
                    label: labelsList[periodoCalc][i],
                    data_result: null,
                    data_qtd: null,
                });
            }
        }

        return treatedData;
    }, [statisticsChecksum]);

    return (
        <Paper sx={{ pt: 1, pr: 2, height: '100%' }}>
            <div className={styles.title}>
                <Typography variant='overline'>Resutlados por Hora</Typography>
            </div>
            <ResponsiveContainer width='100%' height={420}>
                <BarChart data={data} stackOffset='sign'>
                    <XAxis dataKey='label' tickMargin={5} />
                    <YAxis type='number' tickMargin={5} />
                    <Tooltip wrapperStyle={{ outline: 'none' }} content={<CustomTooltip />} />
                    <CartesianGrid stroke='#e2e2e2' vertical={false} />
                    <Bar dataKey='data_result' stackId='a' fill='#0d6efd' barSize={20} />
                    <Bar dataKey='data_qtd' stackId='a' fill='#6c757d' barSize={20} />
                    <ReferenceLine y={0} stroke='red' strokeWidth={0.5} />
                </BarChart>
            </ResponsiveContainer>
        </Paper>
    );
};

export default ChartResultadosHora;
