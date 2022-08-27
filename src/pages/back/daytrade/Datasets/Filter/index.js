import { CheckBox, CheckBoxOutlineBlank, FilterListOff } from '@mui/icons-material';
import { Autocomplete, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, Grid, ListItemText, TextField } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';

import { TYPES as DGR_TYPES } from '../datagridReducer';
import styles from './datasets-filter.module.scss';

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
    const handleSituacaoAutocomplete = useCallback((e, values) => {
        setSituacao((prevState) => values);
    }, []);

    const handleTipoAutocomplete = useCallback((e, values) => {
        setTipo((prevState) => values);
    }, []);

    const handleClose = useCallback(() => {
        props.datagridDispatch({ type: DGR_TYPES.CHANGE_FILTER_MODAL_STATE, payload: false });
    }, [props]);

    const handleSave = useCallback(() => {
        let newFilters = {};
        if (tipo.length) newFilters['tipo'] = [...tipo];
        if (situacao.length) newFilters['situacao'] = [...situacao];
        props.datagridDispatch({ type: DGR_TYPES.FILTERS_CHANGED, payload: newFilters });
    }, [tipo, situacao, props]);

    const handleClear = useCallback(() => {
        setTipo([]);
        setSituacao([]);
        props.datagridDispatch({ type: DGR_TYPES.FILTERS_CLEAR });
    }, [props]);

    /***************
     * RESET INPUTS
     ***************/
    useEffect(() => {
        if (props.open) {
            setSituacao((prevState) => props.filterState?.situacao ?? []);
            setTipo((prevState) => props.filterState?.tipo ?? []);
        }
    }, [props.open]);

    return (
        <Dialog open={props.open} onClose={handleClose} maxWidth='md' fullWidth>
            <DialogTitle>Filtros</DialogTitle>
            <DialogContent dividers={true}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Autocomplete
                            multiple
                            name='situacao'
                            options={situacoes}
                            value={situacao}
                            onChange={handleSituacaoAutocomplete}
                            disableCloseOnSelect
                            isOptionEqualToValue={(option, value) => option.value === value.value}
                            getOptionLabel={(option) => option.label}
                            renderOption={(props, option, { selected }) => (
                                <li {...props}>
                                    <Checkbox
                                        icon={<CheckBoxOutlineBlank fontSize='small' />}
                                        checkedIcon={<CheckBox fontSize='small' />}
                                        style={{ marginRight: 8 }}
                                        checked={selected}
                                    />
                                    <ListItemText primary={option.label} />
                                </li>
                            )}
                            style={{ width: '100%' }}
                            renderInput={(params) => <TextField {...params} label='Situação' placeholder='' />}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Autocomplete
                            multiple
                            name='tipo'
                            options={tipos}
                            value={tipo}
                            onChange={handleTipoAutocomplete}
                            disableCloseOnSelect
                            isOptionEqualToValue={(option, value) => option.value === value.value}
                            getOptionLabel={(option) => option.label}
                            renderOption={(props, option, { selected }) => (
                                <li {...props}>
                                    <Checkbox
                                        icon={<CheckBoxOutlineBlank fontSize='small' />}
                                        checkedIcon={<CheckBox fontSize='small' />}
                                        style={{ marginRight: 8 }}
                                        checked={selected}
                                    />
                                    <ListItemText primary={option.label} />
                                </li>
                            )}
                            style={{ width: '100%' }}
                            renderInput={(params) => <TextField {...params} label='Tipo' placeholder='' />}
                        />
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
