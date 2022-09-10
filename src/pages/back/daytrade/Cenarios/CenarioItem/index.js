import { Add, Delete } from '@mui/icons-material';
import { Button, Chip, Collapse, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField } from '@mui/material';
import cloneDeep from 'lodash.clonedeep';
import React, { useCallback, useState } from 'react';

import Input from '../../../../../components/ui/Input';
import NoContent from '../../../../../components/ui/NoContent';
import { generateHash } from '../../../../../helpers/global';
import { TYPES as DGR_TYPES } from '../dataReducer';
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

    // Propaga as mudanças para o 'Cenarios'
    const handleNomeChange_Blur = useCallback(
        (e) => {
            if (props?.row?.nome !== e.target.value) props.dataDispatch({ type: DGR_TYPES.ROW_UPDATED, payload: cloneDeep(rowData) });
        },
        [rowData.nome]
    );

    const handleObsRefChange = useCallback(
        (id, value) => {
            let changedObs = rowData.observacoes
                .map((obs) => {
                    if (obs.id === id) return { ...obs, ref: value };
                    return obs;
                })
                .sort((a, b) => a.ref - b.ref);
            setRowData((prevState) => ({ ...prevState, observacoes: changedObs }));
        },
        [rowData.observacoes]
    );

    // Propaga as mudanças para o 'Cenarios'
    const handleObsRefChange_Blur = useCallback(
        (id, value) => {
            // Verifica se é uma observação nova, ou se ja existe se foi mesmo alterada
            let changed = String(id).includes('new') || rowData.observacoes.reduce((res, curr) => res || (curr.id === id && curr.ref !== value), false);
            if (changed) props.dataDispatch({ type: DGR_TYPES.ROW_UPDATED, payload: cloneDeep(rowData) });
        },
        [rowData.observacoes]
    );

    const handleObsNomeChange = useCallback(
        (id, value) => {
            let changedObs = rowData.observacoes.map((obs) => {
                if (obs.id === id) return { ...obs, nome: value };
                return obs;
            });
            setRowData((prevState) => ({ ...prevState, observacoes: changedObs }));
        },
        [rowData.observacoes]
    );

    // Propaga as mudanças para o 'Cenarios'
    const handleObsNomeChange_Blur = useCallback(
        (id, value) => {
            // Verifica se é uma observação nova, ou se ja existe se foi mesmo alterada
            let changed = String(id).includes('new') || rowData.observacoes.reduce((res, curr) => res || (curr.id === id && curr.nome !== value), false);
            if (changed) props.dataDispatch({ type: DGR_TYPES.ROW_UPDATED, payload: cloneDeep(rowData) });
        },
        [rowData.observacoes]
    );

    // Propaga as mudanças para o 'Cenarios'
    const handleObsDeleteAction = useCallback(
        (id) => {
            let changedObs = [];
            // Se for nova, apenas deleta
            if (String(id).includes('new')) {
                changedObs = rowData.observacoes.filter((obs) => {
                    return obs.id !== id;
                });
            }
            // Se for existente, marca para apagar
            else changedObs = rowData.observacoes.map((obs) => (obs.id === id ? { ...obs, remove: true } : obs));
            setRowData((prevState) => ({ ...prevState, observacoes: changedObs }));
        },
        [rowData.observacoes]
    );

    const handleObsAddAction = useCallback(() => {
        let newObs = [...rowData.observacoes],
            newHash = generateHash(6),
            nextRef = parseInt(newObs?.[newObs.length - 1]?.ref ?? 0) + 1;
        newObs.push({ id: `new_${newHash}`, ref: nextRef, nome: '', new: 1 });
        setRowData((prevState) => ({ ...prevState, observacoes: newObs }));
    }, [rowData]);

    const handleCenarioDeleteAction = useCallback(() => {
        // Se for novo, apenas deleta
        if (String(rowData.id).includes('new')) props.dataDispatch({ type: DGR_TYPES.ROW_UPDATED, payload: rowData.id });
        else {
            let changedRow = cloneDeep(rowData);
            changedRow.delete = true;
            setRowData((prevState) => {
                props.dataDispatch({ type: DGR_TYPES.ROW_DELETE, payload: changedRow });
                return changedRow;
            });
        }
    }, [rowData.id]);

    return (
        <Paper sx={{ px: 3, py: 1 }}>
            <Stack className={styles.row_container} direction='row' spacing={1} onClick={handleOpenRow}>
                <TextField className={styles.row_input} size='small' value={rowData.nome} onChange={handleNomeChange} onBlur={handleNomeChange_Blur} />
                <Button size='small' startIcon={<Add />} onClick={handleObsAddAction}>
                    Observação
                </Button>
                <Chip className={styles.row_chip} label={rowData.observacoes.length} />
                <Button className={styles.row_button__last} size='small' color='error' startIcon={<Delete />} onClick={handleCenarioDeleteAction}>
                    Remover Cenário
                </Button>
            </Stack>
            <Collapse in={openRow} timeout='auto' unmountOnExit>
                <div className={styles.collapsed_container}>
                    {rowData.observacoes.length > 0 ? (
                        <Table size='small'>
                            <TableHead>
                                <TableRow>
                                    <TableCell align='center'>Ref</TableCell>
                                    <TableCell>Observação</TableCell>
                                    <TableCell align='center'></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {rowData.observacoes.map((obs) => (
                                    <TableRow key={obs.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                        <TableCell className={styles.table_cell__ref}>
                                            <Input
                                                value={obs.ref}
                                                onChange={(e) => handleObsRefChange(obs.id, e.target.value)}
                                                onBlur={(e) => handleObsRefChange_Blur(obs.id, e.target.value)}
                                                disabled={obs?.remove ?? false}
                                                extraClasses={['textAlign__center']}
                                            />
                                        </TableCell>
                                        <TableCell className={styles.table_cell__nome}>
                                            <Input
                                                value={obs.nome}
                                                onChange={(e) => handleObsNomeChange(obs.id, e.target.value)}
                                                onBlur={(e) => handleObsNomeChange_Blur(obs.id, e.target.value)}
                                                disabled={obs?.remove ?? false}
                                            />
                                        </TableCell>
                                        <TableCell align='center' className={styles.table_cell__delete}>
                                            <Button
                                                size='small'
                                                variant='outlined'
                                                color='error'
                                                fullWidth
                                                onClick={() => handleObsDeleteAction(obs.id)}
                                                disabled={obs?.remove ?? false}
                                            >
                                                Excluir
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <NoContent type='empty-data' text_size='small' text_padding='2' empty_text='Não há observações' />
                    )}
                </div>
            </Collapse>
        </Paper>
    );
};

export default CenarioItem;
