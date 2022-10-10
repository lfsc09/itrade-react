import { AccessTime, AutoFixHigh, CheckBox, CheckBoxOutlineBlank, FilterListOff } from '@mui/icons-material';
import {
    Autocomplete,
    Button,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControl,
    Grid,
    InputLabel,
    ListItemText,
    MenuItem,
    Select,
    Slider,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { PickersDay } from '@mui/x-date-pickers/PickersDay';
import { isEqual } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import cloneDeep from 'lodash.clonedeep';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { batch, useDispatch } from 'react-redux';
import { format } from 'date-fns';

import { isObjectEmpty } from '../../../../../helpers/global';
import { TYPES as DGR_TYPES } from '../dataReducer';
import styles from './dashboard-filter.module.scss';
import FilterCenarioObs from './FilterCenarioObs';
import SimulationParada from './SimulationParada';

const minHoraSlider = 9,
    maxHoraSlider = 18;

const periodos = [
    { value: 1, label: 'Por Trade' },
    { value: 2, label: 'Por Dia' },
    { value: 3, label: 'Por Mês' },
];

const custos = [
    { value: 1, label: 'Incluir' },
    { value: 0, label: 'Não Incluir' },
];

const ignoraErros = [
    { value: 0, label: 'Não' },
    { value: 1, label: 'Sim' },
];

const tiposCts = [
    { value: 1, label: 'Padrão' },
    { value: 2, label: 'Quantidade Fixa' },
    { value: 3, label: 'Quantidade Fixa por R' },
];

const FilterDashboard = (props) => {
    /***********
     * DISPATCH
     ***********/
    const dispatch = useDispatch();

    /*********
     * STATES
     *********/
    // Filters
    const [dateInicial, setDateInicial] = useState(props.filterState?.date_inicial ?? props.original.date_inicial);
    const [dateFinal, setDateFinal] = useState(props.filterState?.date_final ?? props.original.date_final);
    const [hora, setHora] = useState([props.filterState?.hora_inicial ?? 9, props.filterState?.hora_final ?? 18]);
    const [ativo, setAtivo] = useState(props.filterState?.ativo ?? []);
    const [gerenciamento, setGerenciamento] = useState(props.filterState.gerenciamento);
    const [cenario, setCenario] = useState(props.filterState?.cenario ?? {});
    // Simulations
    const [periodo, setPeriodo] = useState(props.simulationState.periodo_calc);
    const [custo, setCusto] = useState(props.simulationState.usa_custo);
    const [ignoraErro, setIgnoraErro] = useState(props.simulationState.ignora_erro);
    const [tipoCts, setTipoCts] = useState(props.simulationState.tipo_cts);
    const [cts, setCts] = useState(props.simulationState?.cts ?? '');
    const [tipoParada, setTipoParada] = useState(props.simulationState?.tipo_parada ?? []);
    const [capital, setCapital] = useState(props.simulationState?.valor_inicial ?? '');
    const [riscoMaximo, setRiscoMaximo] = useState(props.simulationState?.R ?? '');

    /***********
     * HANDLERS
     ***********/
    const handleDateInicialPicker = useCallback((value) => {
        setDateInicial((prevState) => new Date(value.toDateString()));
    }, []);

    const handleDateFinalPicker = useCallback((value) => {
        setDateFinal((prevState) => new Date(value.toDateString()));
    }, []);

    const handleHoraSlider = useCallback((e, value) => {
        setHora((prevState) => value);
    }, []);

    const handleAtivoAutocomplete = useCallback((e, values) => {
        setAtivo((prevState) => values);
    }, []);

    const handleGerenciamentoAutocomplete = useCallback((e, values) => {
        if (values !== null) setGerenciamento((prevState) => values);
    }, []);

    const handlePeriodoSelect = useCallback((e) => {
        setPeriodo((prevState) => e.target.value);
    }, []);

    const handleCustoSelect = useCallback((e) => {
        setCusto((prevState) => e.target.value);
    }, []);

    const handleIgnoraErroSelect = useCallback((e) => {
        setIgnoraErro((prevState) => e.target.value);
    }, []);

    const handleTipoCtsSelect = useCallback((e) => {
        if (e.target.value === 1) {
            batch(() => {
                setCts((prevState) => '');
                setTipoCts((prevState) => e.target.value);
            });
        } else setTipoCts((prevState) => e.target.value);
    }, []);

    const handleCtsInput = useCallback((e) => {
        setCts((prevState) => e.target.value);
    }, []);

    const handleCapitalInput = useCallback((e) => {
        setCapital((prevState) => e.target.value);
    }, []);

    const handleRiscoMaximoInput = useCallback((e) => {
        setRiscoMaximo((prevState) => e.target.value);
    }, []);

    const handleClose = useCallback(() => {
        props.dispatchers.setFilterModalOpen(false);
    }, []);

    const handleSave = () => {
        let newFilters = {
            gerenciamento: gerenciamento,
        };
        if (!isEqual(dateInicial, props.original.date_inicial)) newFilters['data_inicial'] = dateInicial;
        if (!isEqual(dateFinal, props.original.date_final)) newFilters['data_final'] = dateFinal;
        if (hora[0] !== minHoraSlider) newFilters['hora_inicial'] = hora[0];
        if (hora[1] !== maxHoraSlider) newFilters['hora_final'] = hora[1];
        if (ativo.length) newFilters['ativo'] = [...ativo];
        if (!isObjectEmpty(cenario)) newFilters['cenario'] = cloneDeep(cenario);

        let newSimulations = {
            periodo_calc: periodo,
            usa_custo: custo,
            ignora_erro: ignoraErro,
            tipo_cts: tipoCts,
        };
        if (cts !== '') newSimulations['cts'] = cts;
        if (tipoParada.length) newSimulations['tipo_parada'] = [...tipoParada];
        if (capital !== '') newSimulations['valor_inicial'] = capital;
        if (riscoMaximo !== '') newSimulations['R'] = riscoMaximo;

        batch(() => {
            props.dispatchers.dataDispatch({ type: DGR_TYPES.FILTERS_CHANGED, payload: { filters: newFilters, simulations: newSimulations } });
            props.dispatchers.setFilterModalOpen((prevState) => false);
        });
    };

    // const handleClear = useCallback(() => {
    //     setTipo([]);
    //     setSituacao([]);
    //     props.dataDispatch({ type: DGR_TYPES.FILTERS_CLEAR });
    // }, [props]);

    /************
     * MISC FUNC
     ************/
    const horaValueText = useCallback((value) => {
        return `${value}:00`;
    }, []);

    const disableWeekends = useCallback((day) => day.getDay() === 0 || day.getDay() === 6, []);

    const renderDay = useCallback(
        (date, selectedDates, pickersDayProps) => {
            if (format(date, 'yyyy-MM-dd') in props.original.dias) return <PickersDay className={styles.filter__date__has_data} {...pickersDayProps} />;

            return <PickersDay {...pickersDayProps} />;
        },
        [props.original.date_inicial, props.original.date_final]
    );

    /*******************************************
     * UPDATE FILTERS (AFTER CHANGED DATASETS)
     *******************************************/
    useEffect(() => {
        if (props.filterState.gerenciamento !== gerenciamento) setGerenciamento((prevState) => props.filterState.gerenciamento);
        if (props.original.date_inicial !== dateInicial) setDateInicial((prevState) => props.original.date_inicial);
        if (props.original.date_final !== dateFinal) setDateFinal((prevState) => props.original.date_final);
    }, [props.filterState.gerenciamento, props.original.date_inicial, props.original.date_final]);

    /***************
     * RESET INPUTS
     ***************/
    // useEffect(() => {
    //     if (props.open) {
    //         setSituacao((prevState) => props.filterState?.situacao ?? []);
    //         setTipo((prevState) => props.filterState?.tipo ?? []);
    //     }
    // }, [props.open]);

    return (
        <Dialog open={props.open} onClose={handleClose} maxWidth='xl' fullWidth>
            <DialogTitle>Filtros</DialogTitle>
            <DialogContent dividers={true}>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Divider textAlign='left'>
                            <Typography variant='overline' className={styles.divider_title}>
                                FILTRAR
                            </Typography>
                        </Divider>
                    </Grid>
                    <Grid container item spacing={2} xs={12} sx={{ alignItems: 'center' }}>
                        <Grid item md={1.5} xs={12}>
                            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
                                <DatePicker
                                    label='De'
                                    closeOnSelect={true}
                                    value={dateInicial}
                                    onChange={handleDateInicialPicker}
                                    minDate={props.original.date_inicial}
                                    maxDate={props.original.date_final}
                                    shouldDisableDate={disableWeekends}
                                    renderDay={renderDay}
                                    renderInput={(params) => <TextField {...params} fullWidth size='small' />}
                                />
                            </LocalizationProvider>
                        </Grid>
                        <Grid item md={1.5} xs={12}>
                            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
                                <DatePicker
                                    label='Até'
                                    closeOnSelect={true}
                                    value={dateFinal}
                                    onChange={handleDateFinalPicker}
                                    minDate={props.original.date_inicial}
                                    maxDate={props.original.date_final}
                                    shouldDisableDate={disableWeekends}
                                    renderDay={renderDay}
                                    renderInput={(params) => <TextField {...params} fullWidth size='small' />}
                                />
                            </LocalizationProvider>
                        </Grid>
                        <Grid item md={1.5} xs={12}>
                            <Stack spacing={2} direction='row' alignItems='center'>
                                <AccessTime sx={{ color: '#555' }} />
                                <Slider
                                    valueLabelDisplay='auto'
                                    disableSwap
                                    marks={true}
                                    min={minHoraSlider}
                                    max={maxHoraSlider}
                                    value={hora}
                                    onChange={handleHoraSlider}
                                    valueLabelFormat={horaValueText}
                                    componentsProps={{ root: { className: styles.filter__hora } }}
                                />
                            </Stack>
                        </Grid>
                        <Grid item md={2} xs={12}>
                            <Autocomplete
                                multiple
                                name='ativo'
                                size='small'
                                limitTags={2}
                                options={props.ativosSuggest}
                                value={ativo}
                                onChange={handleAtivoAutocomplete}
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
                                renderInput={(params) => <TextField {...params} label='Ativos' placeholder='' />}
                            />
                        </Grid>
                        <Grid item md={2} xs={12}>
                            <Autocomplete
                                name='gerenciamento'
                                size='small'
                                options={props.gerenciamentosSuggest}
                                value={gerenciamento}
                                onChange={handleGerenciamentoAutocomplete}
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
                                renderInput={(params) => <TextField {...params} label='Gerenciamentos' placeholder='' />}
                            />
                        </Grid>
                        <Grid item md={3.5} xs={12}>
                            <FilterCenarioObs cenarios={props.cenariosSuggest} receivedCenario={cenario} returnCenario={setCenario} />
                        </Grid>
                    </Grid>
                    <Grid item xs={12}>
                        <Divider textAlign='left'>
                            <Typography variant='overline' className={styles.divider_title}>
                                SIMULAR
                            </Typography>
                        </Divider>
                    </Grid>
                    <Grid container item spacing={2} xs={12}>
                        <Grid item md={1} xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>Período</InputLabel>
                                <Select value={periodo} label='Período' size='small' onChange={handlePeriodoSelect}>
                                    {periodos.map((p) => (
                                        <MenuItem key={`periodo-${p.value}`} value={p.value}>
                                            {p.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item md={1.5} xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>Custos</InputLabel>
                                <Select value={custo} label='Custos' size='small' onChange={handleCustoSelect}>
                                    {custos.map((p) => (
                                        <MenuItem key={`custo-${p.value}`} value={p.value}>
                                            {p.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item md={1} xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>Ignorar Erros</InputLabel>
                                <Select value={ignoraErro} label='Ignorar Erros' size='small' onChange={handleIgnoraErroSelect}>
                                    {ignoraErros.map((p) => (
                                        <MenuItem key={`ignora-erro-${p.value}`} value={p.value}>
                                            {p.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item md={3} xs={12}>
                            <Stack direction='row' spacing={0}>
                                <FormControl className={styles.simulation__tipo_cts}>
                                    <InputLabel>Simular Cts</InputLabel>
                                    <Select value={tipoCts} label='Simular Cts' size='small' onChange={handleTipoCtsSelect}>
                                        {tiposCts.map((p) => (
                                            <MenuItem key={`tipo-cts-${p.value}`} value={p.value}>
                                                {p.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                <TextField className={styles.simulation__cts} value={cts} label='Cts' size='small' disabled={tipoCts === 1} onChange={handleCtsInput} />
                            </Stack>
                        </Grid>
                        <Grid item md={1.5} xs={12}>
                            <TextField label='Simular Capital' value={capital} onChange={handleCapitalInput} size='small' fullWidth />
                        </Grid>
                        <Grid item md={1.5} xs={12}>
                            <TextField label='Simular Risco Máximo' value={riscoMaximo} onChange={handleRiscoMaximoInput} size='small' fullWidth />
                        </Grid>
                        <Grid item md={2.5} xs={12}>
                            <SimulationParada receivedTipoParada={tipoParada} returnTipoParada={setTipoParada} />
                        </Grid>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions sx={{ px: 2 }}>
                <Button onClick={() => {}} endIcon={<FilterListOff />}>
                    Limpar Tudo
                </Button>
                <Button className={styles.action_clear} onClick={handleClose}>
                    Cancelar
                </Button>
                <Button onClick={handleSave} endIcon={<AutoFixHigh />}>
                    Salvar
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default FilterDashboard;
