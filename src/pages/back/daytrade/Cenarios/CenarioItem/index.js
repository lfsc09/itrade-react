import { Add, ArrowDropDown, ArrowDropUp, Delete } from '@mui/icons-material';
import { Button, Chip, Collapse, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import cloneDeep from 'lodash.clonedeep';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { batch } from 'react-redux';

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
    const [rowData, setRowData] = useState(props.row);

    /*******
     * VARS
     *******/
    const obsChange_count = rowData.observacoes.reduce(
        (res, obs) => {
            return { added: String(obs.id).includes('new') ? res.added + 1 : res.added, deleted: obs?.delete ? res.deleted + 1 : res.deleted };
        },
        { added: 0, deleted: 0 }
    );

    /********
     * FUNCS
     ********/
    const generateChecksum = useCallback(
        (values = null) => {
            let checksum = '';
            checksum += `&id=${values?.id ?? props.row.id ?? ''}`;
            checksum += `&n=${values?.nome ?? props.row.nome ?? ''}`;
            if ((values !== null && 'deleta' in values) || 'deleta' in props.row) checksum += `&del=${values?.deleta ?? props.row?.deleta ?? ''}`;
            let obs_checksum = '';
            if (values !== null) {
                for (let obs of values.observacoes) {
                    obs_checksum += `,{`;
                    obs_checksum += `id=${obs.id}`;
                    obs_checksum += `&ref=${obs.ref}`;
                    obs_checksum += `&n=${obs.nome}`;
                    if ('deleta' in obs) obs_checksum += `&del=${obs.deleta}`;
                    obs_checksum += `}`;
                }
            } else {
                for (let obs of props.row.observacoes) {
                    obs_checksum += `,{`;
                    obs_checksum += `id=${obs.id}`;
                    obs_checksum += `&ref=${obs.ref}`;
                    obs_checksum += `&n=${obs.nome}`;
                    if ('deleta' in obs) obs_checksum += `&del=${obs.deleta}`;
                    obs_checksum += `}`;
                }
            }
            checksum += `&obs=[${obs_checksum}]`;
            return checksum;
        },
        [props.row]
    );

    /*******
     * REFS
     *******/
    const propsRow_checksum = useRef(generateChecksum());

    /***********
     * HANDLERS
     ***********/
    const handleOpenRow = useCallback(
        (e) => {
            if (e.target.nodeName === 'DIV' && !rowData?.delete) setOpenRow((prevState) => !prevState);
        },
        [rowData?.delete]
    );

    const handleNomeChange = useCallback((e) => {
        setRowData((prevState) => ({ ...prevState, nome: e.target.value }));
    }, []);
    // Propaga as mudanças para o 'Cenarios'
    const handleNomeBlur = useCallback(
        (e) => {
            if (props?.row?.nome !== e.target.value) {
                let cpyRowData = cloneDeep(rowData);
                propsRow_checksum.current = generateChecksum(cpyRowData);
                props.dataDispatch({ type: DGR_TYPES.ROW_UPDATED, payload: cpyRowData });
            }
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
    const handleObsRefBlur = useCallback(
        (id, value) => {
            // Verifica se é uma observação nova, ou se ja existe se foi mesmo alterada
            let changed = String(id).includes('new') || rowData.observacoes.reduce((res, curr) => res || (curr.id === id && curr.ref !== value), false);
            if (changed) {
                let cpyRowData = cloneDeep(rowData);
                propsRow_checksum.current = generateChecksum(cpyRowData);
                props.dataDispatch({ type: DGR_TYPES.ROW_UPDATED, payload: cpyRowData });
            }
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
    const handleObsNomeBlur = useCallback(
        (id, value) => {
            // Verifica se é uma observação nova, ou se ja existe se foi mesmo alterada
            let changed = String(id).includes('new') || rowData.observacoes.reduce((res, curr) => res || (curr.id === id && curr.nome !== value), false);
            if (changed) {
                let cpyRowData = cloneDeep(rowData);
                propsRow_checksum.current = generateChecksum(cpyRowData);
                props.dataDispatch({ type: DGR_TYPES.ROW_UPDATED, payload: cpyRowData });
            }
        },
        [rowData.observacoes]
    );

    // Remove obs e propaga as mudanças para o 'Cenarios'
    const handleObsDeleteAction = useCallback(
        (id) => {
            let cpyRowData = cloneDeep(rowData);
            // Se for nova, apenas deleta
            if (String(id).includes('new')) {
                cpyRowData.observacoes = cpyRowData.observacoes.filter((obs) => {
                    return obs.id !== id;
                });
            }
            // Se for existente, marca para apagar
            else cpyRowData.observacoes = cpyRowData.observacoes.map((obs) => (obs.id === id ? { ...obs, delete: true } : obs));
            batch(() => {
                setRowData((prevState) => cpyRowData);
                propsRow_checksum.current = generateChecksum(cpyRowData);
                props.dataDispatch({ type: DGR_TYPES.ROW_UPDATED, payload: cpyRowData });
            });
        },
        [rowData]
    );

    // Add obs e propaga as mudanças para o 'Cenarios'
    const handleObsAddAction = useCallback(() => {
        let cpyRowData = cloneDeep(rowData);
        let nextRef = parseInt(cpyRowData.observacoes?.[cpyRowData.observacoes.length - 1]?.ref ?? 0) + 1;
        cpyRowData.observacoes.push({ id: `new_${generateHash(6)}`, ref: nextRef, nome: '' });
        batch(() => {
            setOpenRow(true);
            setRowData((prevState) => cpyRowData);
            propsRow_checksum.current = generateChecksum(cpyRowData);
            props.dataDispatch({ type: DGR_TYPES.ROW_UPDATED, payload: cpyRowData });
        });
    }, [rowData]);

    // Remove o proprio cenario e propaga as mudanças para o 'Cenarios'
    const handleCenarioDeleteAction = useCallback(() => {
        // Se for novo, apenas deleta
        if (String(rowData.id).includes('new')) props.dataDispatch({ type: DGR_TYPES.ROW_DELETE, payload: rowData.id });
        else {
            let cpyRowData = cloneDeep(rowData);
            cpyRowData.delete = true;
            batch(() => {
                setOpenRow(false);
                setRowData((prevState) => cpyRowData);
                propsRow_checksum.current = generateChecksum(cpyRowData);
                props.dataDispatch({ type: DGR_TYPES.ROW_UPDATED, payload: cpyRowData });
            });
        }
    }, [rowData.id]);

    /**********************************************
     * ATUALIZA OS INPUTS, POR ALTERAÇÕES EXTERNAS
     **********************************************/
    useEffect(() => {
        if (propsRow_checksum.current !== generateChecksum()) {
            batch(() => {
                setOpenRow(false);
                setRowData((prevState) => props.row);
            });
            propsRow_checksum.current = generateChecksum();
        }
    });

    return (
        <Paper sx={{ px: 3, py: 1 }}>
            <Stack className={styles.row_container} direction='row' spacing={1} onClick={handleOpenRow}>
                <div className={styles.row_input}>
                    <Input value={rowData.nome} onChange={handleNomeChange} onBlur={handleNomeBlur} disabled={rowData?.delete ?? false} />
                </div>
                <Button size='small' startIcon={<Add />} onClick={handleObsAddAction} disabled={rowData?.delete ?? false}>
                    Observação
                </Button>
                <Chip className={styles.row_chip} label={rowData.observacoes.length} />
                {!rowData?.delete && obsChange_count.added > 0 ? (
                    <Chip variant='outlined' className={`${styles.row_chip} ${styles.row_chip__added}`} label={obsChange_count.added} icon={<ArrowDropUp />} />
                ) : (
                    <></>
                )}
                {!rowData?.delete && obsChange_count.deleted > 0 ? (
                    <Chip variant='outlined' className={`${styles.row_chip} ${styles.row_chip__deleted}`} label={obsChange_count.deleted} icon={<ArrowDropDown />} />
                ) : (
                    <></>
                )}
                <Button
                    className={styles.row_button__last}
                    size='small'
                    color='error'
                    startIcon={<Delete />}
                    onClick={handleCenarioDeleteAction}
                    disabled={rowData?.delete ?? false}
                >
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
                                                onBlur={(e) => handleObsRefBlur(obs.id, e.target.value)}
                                                disabled={obs?.delete ?? false}
                                                addedClasses={{ input: `${styles.inputCenter__input} ${styles.inputSmall__input}` }}
                                            />
                                        </TableCell>
                                        <TableCell className={styles.table_cell__nome}>
                                            <Input
                                                value={obs.nome}
                                                onChange={(e) => handleObsNomeChange(obs.id, e.target.value)}
                                                onBlur={(e) => handleObsNomeBlur(obs.id, e.target.value)}
                                                disabled={obs?.delete ?? false}
                                                addedClasses={{ input: `${styles.inputSmall__input}` }}
                                            />
                                        </TableCell>
                                        <TableCell align='center' className={styles.table_cell__delete}>
                                            <Button
                                                size='small'
                                                variant='outlined'
                                                color='error'
                                                fullWidth
                                                onClick={() => handleObsDeleteAction(obs.id)}
                                                disabled={obs?.delete ?? false}
                                            >
                                                Excluir
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <NoContent type='empty-data' empty_text='Não há observações' addedClasses={{ text: `${styles.no_content__text}` }} />
                    )}
                </div>
            </Collapse>
        </Paper>
    );
};

export default CenarioItem;
