import { Add, Delete } from '@mui/icons-material';
import { Button, Chip, Collapse, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField } from '@mui/material';
import React, { useCallback, useState } from 'react';

import Input from '../../../../../components/ui/Input';
import { generateHash } from '../../../../../helpers/global';
import styles from './cenario-item.module.scss';

const CenarioItem = (props) => {
    /*********
     * STATES
     *********/
    const [openRow, setOpenRow] = useState(false);
    const [rowData, setRowData] = useState(props?.row ?? { nome: '', observacoes: [] });

    /***********
     * HANDLERS
     ***********/
    const handleOpenRow = useCallback((e) => {
        if (e.target.nodeName === 'DIV') setOpenRow((prevState) => !prevState);
    }, []);

    const handleNomeChange = useCallback((e) => {
        setRowData((prevState) => ({ ...prevState, nome: e.target.value }));
    }, []);

    const handleObsChange = useCallback(
        (id, colName, value) => {
            let newObs = [];
            // Em aterações
            if (colName !== null) {
                newObs = rowData.observacoes.map((obs) => {
                    if (obs.id === id) return { ...obs, [colName]: value };
                    return obs;
                });
                if (colName === 'ref') newObs.sort((a, b) => a.ref - b.ref);
            }
            // Em remoções
            else {
                newObs = rowData.observacoes.filter((obs) => {
                    return obs.id !== id;
                });
            }
            setRowData((prevState) => ({ ...prevState, observacoes: newObs }));
        },
        [rowData]
    );

    const handleObsAdd = useCallback(() => {
        let newObs = [...rowData.observacoes],
            newHash = generateHash(6),
            nextRef = (parseInt(newObs[newObs.length - 1]?.ref) ?? 1) + 1;
        newObs.push({ id: `new_${newHash}`, ref: nextRef, nome: '', new: 1 });
        setRowData((prevState) => ({ ...prevState, observacoes: newObs }));
    }, [rowData]);

    return (
        <Paper sx={{ px: 3, py: 1 }}>
            <Stack className={styles.row_container} direction='row' spacing={1} onClick={handleOpenRow}>
                <TextField className={styles.row_input} size='small' value={rowData.nome} onChange={handleNomeChange} />
                <Button size='small' startIcon={<Add />} onClick={handleObsAdd}>
                    Observação
                </Button>
                <Chip className={styles.row_chip} label={rowData.observacoes.length} />
                <Button className={styles.row_button__last} size='small' color='error' startIcon={<Delete />}>
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
                            {rowData.observacoes.map((obs) => (
                                <TableRow key={obs.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                    <TableCell className={styles.table_cell__ref}>
                                        <Input value={obs.ref} onChange={(e) => handleObsChange(obs.id, 'ref', e.target.value)} />
                                    </TableCell>
                                    <TableCell className={styles.table_cell__nome}>
                                        <Input value={obs.nome} onChange={(e) => handleObsChange(obs.id, 'nome', e.target.value)} />
                                    </TableCell>
                                    <TableCell align='center' className={styles.table_cell__delete}>
                                        <Button size='small' variant='outlined' color='error' fullWidth onClick={() => handleObsChange(obs.id, null)}>
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
