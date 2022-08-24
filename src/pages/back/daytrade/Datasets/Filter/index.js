import { Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, Grid, InputLabel, ListItemText, MenuItem, Select } from '@mui/material';
import React, { useCallback, useState } from 'react';

import styles from './datasets-filter.module.scss';
import { TYPES as DGR_TYPES } from '../datagridReducer';
import { FilterListOff } from '@mui/icons-material';

const tipos = [
    { value: 1, label: 'Live' },
    { value: 2, label: 'Replay' },
    { value: 3, label: 'Paper Trade' },
    { value: 4, label: 'Misto' },
];

const situacoes = [
    { value: 2, label: 'Pendente' },
    { value: 3, label: 'Fazendo' },
    { value: 1, label: 'Fechado' },
];

const FilterDataset = (props) => {
    /*********
     * STATES
     *********/
    const [tipo, setTipo] = useState(props.filterState?.tipo ?? []);
    const [situacao, setSituacao] = useState(props.filterState?.situacao ?? []);

    /***********
     * HANDLERS
     ***********/
    const handleSituacaoSelect = useCallback(({ target: { value: values } }) => {
        setSituacao((prevState) => values);
    }, []);

    const renderSituacaoSelect = useCallback((selected) => {
        return selected.length > 2
            ? `${selected.length} Itens selecionados`
            : situacoes.reduce((t, v) => t + (selected.includes(v.value) ? `, ${v.label}` : ''), '').replace(/^, /, '');
    }, []);

    const handleTipoSelect = useCallback(({ target: { value: values } }) => {
        setTipo((prevState) => values);
    }, []);

    const renderTipoSelect = useCallback((selected) => {
        return selected.length > 2
            ? `${selected.length} Itens selecionados`
            : tipos.reduce((t, v) => t + (selected.includes(v.value) ? `, ${v.label}` : ''), '').replace(/^, /, '');
    }, []);

    const handleClose = useCallback(() => {
        props.datagridDispatch({ type: DGR_TYPES.CHANGE_FILTER_MODAL_STATE, payload: false });
    }, [props]);

    const handleSave = useCallback(() => {
        let newFilters = {};
        if (tipo.length) newFilters['tipo'] = [...tipo].map((val) => ({ value: val, label: tipos.filter((fTipo) => fTipo.value === val)[0].label }));
        if (situacao.length) newFilters['situacao'] = [...situacao].map((val) => ({ value: val, label: situacoes.filter((fSit) => fSit.value === val)[0].label }));
        props.datagridDispatch({ type: DGR_TYPES.FILTERS_CHANGED, payload: newFilters });
    }, [tipo, situacao, props]);

    const handleClear = useCallback(() => {
        setTipo([]);
        setSituacao([]);
        props.datagridDispatch({ type: DGR_TYPES.FILTERS_CLEAR });
    }, [props]);

    return (
        <Dialog open={props.open} onClose={handleClose} maxWidth='md' fullWidth>
            <DialogTitle>Filtros</DialogTitle>
            <DialogContent dividers={true}>
                <Grid container spacing={2}>
                    <Grid item md={6} xs={12}>
                        <FormControl sx={{ width: '100%' }}>
                            <InputLabel id='situacao_select_label'>Situação</InputLabel>
                            <Select
                                multiple
                                label='Situação'
                                labelId='situacao_select_label'
                                name='situacao'
                                value={situacao}
                                onChange={handleSituacaoSelect}
                                renderValue={renderSituacaoSelect}
                            >
                                {situacoes.map((val, index) => (
                                    <MenuItem key={index} value={val.value}>
                                        <Checkbox checked={situacao.includes(val.value)} />
                                        <ListItemText primary={val.label} />
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item md={6} xs={12}>
                        <FormControl sx={{ width: '100%' }}>
                            <InputLabel id='tipo_select_label'>Tipo</InputLabel>
                            <Select multiple label='Tipo' labelId='tipo_select_label' name='tipo' value={tipo} onChange={handleTipoSelect} renderValue={renderTipoSelect}>
                                {tipos.map((val, index) => (
                                    <MenuItem key={index} value={val.value}>
                                        <Checkbox checked={tipo.includes(val.value)} />
                                        <ListItemText primary={val.label} />
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions sx={{ px: 2 }}>
                <Button onClick={handleClear} endIcon={<FilterListOff />}>
                    Limpar Tudo
                </Button>
                <Button className={styles.action_clear} onClick={handleClose}>
                    Cancelar
                </Button>
                <Button onClick={handleSave}>Aplicar</Button>
            </DialogActions>
        </Dialog>
    );
};

export default FilterDataset;
