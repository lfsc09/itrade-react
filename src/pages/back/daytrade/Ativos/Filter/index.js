import { CheckBox, CheckBoxOutlineBlank, FilterListOff } from '@mui/icons-material';
import { Autocomplete, Button, Checkbox, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Grid, ListItemText, TextField } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import axiosCon from '../../../../../helpers/axios-con';
import { handleLogout } from '../../../../../store/auth/auth-action';
import { TYPES as DGR_TYPES } from '../datagridReducer';
import styles from './ativos-filter.module.scss';

const FilterAtivo = (props) => {
    let nomeAutocompleteTimeout;

    /***********
     * DISPATCH
     ***********/
    const dispatch = useDispatch();

    /***********
     * NAVIGATE
     ***********/
    const navigate = useNavigate();

    /*********
     * STATES
     *********/
    const [nome, setNome] = useState(props.filterState?.nome ?? []);
    const [nomeSuggest, setNomeSuggest] = useState([]);
    const [nomeLoading, setNomeLoading] = useState(false);

    /***********
     * HANDLERS
     ***********/
    const handleNomeAutocomplete = useCallback((e, values) => {
        setNome((prevState) => values);
        setNomeSuggest([]);
    }, []);

    const handleNomeInputChange = useCallback((obj, typedValue) => {
        clearTimeout(nomeAutocompleteTimeout);
        if (typedValue.length > 1) {
            nomeAutocompleteTimeout = setTimeout(() => {
                setNomeLoading(true);
                axiosCon
                    .get(`/ativo/list_suggest?place=ativo__filter__nome&filters[nome]=${typedValue}`)
                    .then((resp) => {
                        setNomeSuggest(resp.data.suggestion);
                        setNomeLoading(false);
                    })
                    .catch((error) => {
                        if (error.response) {
                            if (error.response.status === 401) dispatch(handleLogout());
                            else if (error.response.status === 403) navigate('/daytrade/dashboard', { replace: true });
                            else if (error.response.status === 500) {
                                console.log('Error Suggest: ', error.response.data);
                            }
                        } else {
                            console.log('Error Suggest: ', error.message);
                        }
                        setNomeLoading(false);
                    });
            }, 300);
        } else setNomeSuggest([]);
    }, []);

    const handleClose = useCallback(() => {
        props.datagridDispatch({ type: DGR_TYPES.CHANGE_FILTER_MODAL_STATE, payload: false });
    }, [props]);

    const handleSave = useCallback(() => {
        let newFilters = {};
        if (nome.length) newFilters['nome'] = [...nome];
        props.datagridDispatch({ type: DGR_TYPES.FILTERS_CHANGED, payload: newFilters });
    }, [nome, props]);

    const handleClear = useCallback(() => {
        setNome([]);
        props.datagridDispatch({ type: DGR_TYPES.FILTERS_CLEAR });
    }, [props]);

    /***************
     * RESET INPUTS
     ***************/
    useEffect(() => {
        if (props.open) {
            setNome((prevState) => props.filterState?.nome ?? []);
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
                            autoHighlight
                            disableCloseOnSelect
                            loading={nomeLoading}
                            name='nome'
                            options={nomeSuggest}
                            value={nome}
                            onChange={handleNomeAutocomplete}
                            onInputChange={handleNomeInputChange}
                            filterOptions={(x) => x}
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
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label='Nome'
                                    placeholder=''
                                    InputProps={{
                                        ...params.InputProps,
                                        endAdornment: (
                                            <>
                                                {nomeLoading ? <CircularProgress color='inherit' size={20} /> : null}
                                                {params.InputProps.endAdornment}
                                            </>
                                        ),
                                    }}
                                />
                            )}
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

export default FilterAtivo;
