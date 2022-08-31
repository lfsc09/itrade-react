import { Chip, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import React from 'react';

import styles from './venc-table.module.scss';

const VencTable = (props) => {
    return (
        <Table sx={{ width: '100%' }}>
            <TableHead>
                <TableRow>
                    <TableCell>Data</TableCell>
                    <TableCell align='center'>Série</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {props.rows.map((row, i) => (
                    <TableRow key={i} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                        <TableCell scope='row'>
                            <span className={styles.date}>
                                {row.start.m}
                                <span className={styles.daylish}>{row.start.d}</span>
                            </span>
                            <span className={styles.separator}>-</span>
                            <span className={styles.date}>
                                {row.end.m}
                                <span className={styles.daylish}>{row.end.d}</span>
                            </span>
                        </TableCell>
                        <TableCell align='center' color='success'>
                            {row.isCurrent ? <Chip className={styles.letter} color='primary' label={row.letter} /> : <span className={styles.letter}>{row.letter}</span>}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};

export default VencTable;
