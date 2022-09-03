import { Add, Delete } from '@mui/icons-material';
import { Button, Chip, Collapse, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField } from '@mui/material';
import React, { useCallback, useState } from 'react';

import Input from '../../../../../components/ui/Input';
import styles from './cenario-item.module.scss';

const CenarioItem = (props) => {
    const { row } = props;

    /*********
     * STATES
     *********/
    const [openRow, setOpenRow] = useState(false);

    /***********
     * HANDLERS
     ***********/
    const handleOpenRow = useCallback(() => {
        setOpenRow((prevState) => !prevState);
    }, []);

    return (
        <Paper sx={{ px: 3, py: 1 }}>
            <Stack className={styles.row_container} direction='row' spacing={1} onClick={handleOpenRow}>
                <TextField size='small' value={row.nome} sx={{ width: '25%' }} />
                <Button size='small' startIcon={<Add />}>
                    Observação
                </Button>
                <Chip label={row.observacoes.length} />
                <Button size='small' color='error' sx={{ marginLeft: 'auto !important' }} startIcon={<Delete />}>
                    Remover Cenário
                </Button>
            </Stack>
            <Collapse in={openRow} timeout='auto' unmountOnExit>
                <div className={styles.collapsed_container}>
                    <Table size='small'>
                        <TableHead>
                            <TableRow>
                                <TableCell>Ref</TableCell>
                                <TableCell>Observação</TableCell>
                                <TableCell align='center'></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {row.observacoes.map((obs) => (
                                <TableRow key={obs.id}>
                                    <TableCell className={styles.table_cell__ref}>
                                        <Input size='small' value={obs.ref} />
                                    </TableCell>
                                    <TableCell className={styles.table_cell__nome}>
                                        <Input size='small' value={obs.nome} />
                                    </TableCell>
                                    <TableCell align='center' className={styles.table_cell__delete}>
                                        <Button size='small' variant='outlined' color='error' fullWidth>
                                            Excluir
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </Collapse>
        </Paper>
    );
};

export default CenarioItem;
