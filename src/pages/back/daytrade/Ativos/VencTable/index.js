import { Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import React from 'react';

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
                        <TableCell component='th' scope='row'>
                            {row.period}
                        </TableCell>
                        <TableCell align='center'>{row.serie}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};

export default VencTable;
