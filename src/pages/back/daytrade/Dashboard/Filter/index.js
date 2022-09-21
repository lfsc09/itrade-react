import { AccessTime, AutoFixHigh, CalendarToday, CheckBox, CheckBoxOutlineBlank, FilterListOff } from '@mui/icons-material';
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
    FormControlLabel,
    FormGroup,
    Grid,
    InputLabel,
    ListItemText,
    MenuItem,
    Paper,
    Select,
    Slider,
    Stack,
    Switch,
    TextField,
    Typography,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import ptBR from 'date-fns/locale/pt-BR';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { TYPES as DGR_TYPES } from '../dataReducer';
import styles from './dashboard-filter.module.scss';
import FilterCenarioObs from './FilterCenarioObs';
import SimulationParada from './SimulationParada';

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
    /*********
     * STATES
     *********/
    const [dataset, setDataset] = useState(props.filterState?.datasets ?? []);
    const [comparaDataset, setComparaDataset] = useState(props.filterState?.comparaDataset ?? false);
    // Filters
    const [dateInicial, setDateInicial] = useState(props.filterState?.dateInicial ?? new Date());
    const [dateFinal, setDateFinal] = useState(props.filterState?.dateFinal ?? new Date());
    const [hora, setHora] = useState(props.filterState?.hora ?? [9, 18]);
    const [ativo, setAtivo] = useState(props.filterState?.ativo ?? []);
    const [gerenciamento, setGerenciamento] = useState(props.filterState?.gerenciamento ?? null);
    const [cenario, setCenario] = useState(props.filterState?.cenario ?? {});
    // Simulations
    const [periodo, setPeriodo] = useState(props.simulationState?.periodo_calc ?? 1);
    const [custo, setCusto] = useState(props.simulationState?.usa_custo ?? 1);
    const [ignoraErro, setIgnoraErro] = useState(props.simulationState?.ignora_erro ?? 0);
    const [tipoCts, setTipoCts] = useState(props.simulationState?.tipo_cts ?? 1);
    const [cts, setCts] = useState(props.simulationState?.cts ?? '');
    const [tipoParada, setTipoParada] = useState(props.simulationState?.tipo_parada ?? []);
    const [capital, setCapital] = useState(props.simulationState?.valor_inicial ?? '');
    const [riscoMaximo, setRiscoMaximo] = useState(props.simulationState?.R ?? '');

    /*******
     * VARS
     *******/
    const ativos = useMemo(() => [], []);
    const gerenciamentos = useMemo(() => [], []);
    const cenarios = useMemo(
        () => [
            {
                id: 1,
                nome: 'FT',
                observacoes: [
                    {
                        id: '1329',
                        ref: '1',
                        nome: '(Entrada) 50%: Compra Acima / Venda Abaixo',
                    },
                    {
                        id: '1330',
                        ref: '2',
                        nome: '(Entrada) EMA20: Compra Acima / Venda Abaixo',
                    },
                    {
                        id: '1331',
                        ref: '3',
                        nome: '(Entrada) PLOT60: Entre entrada e alvo ou tocando',
                    },
                    {
                        id: '1332',
                        ref: '4',
                        nome: '(Padrão) Rompimento barra Ruim',
                    },
                    {
                        id: '1333',
                        ref: '5',
                        nome: '(Padrão) Rompimento barra Forte',
                    },
                    {
                        id: '1334',
                        ref: '6',
                        nome: '(Padrão) Rompimento é Outside',
                    },
                    {
                        id: '1335',
                        ref: '7',
                        nome: '(Padrão) Continuidade Forte',
                    },
                    {
                        id: '1336',
                        ref: '8',
                        nome: '(Padrão) Continuidade é Outside',
                    },
                    {
                        id: '1337',
                        ref: '9',
                        nome: '(Padrão) Continuidade é Inside',
                    },
                    {
                        id: '1338',
                        ref: '10',
                        nome: '(Padrão) Continuidade toca na EMA20',
                    },
                    {
                        id: '1339',
                        ref: '11',
                        nome: '(Padrão) 3 barras consecutivas contando com a continuidade',
                    },
                    {
                        id: '1340',
                        ref: '12',
                        nome: '(Padrão) Veio de A2/B2 ou A4/B4',
                    },
                    {
                        id: '1341',
                        ref: '13',
                        nome: '(Padrão) Veio de pré-rompimento',
                    },
                ],
            },
            { id: 2, nome: 'FTS', observacoes: [] },
        ],
        []
    );

    /***********
     * HANDLERS
     ***********/
    const handleDatasetAutocomplete = useCallback((e, values) => {
        setDataset((prevState) => values);
    }, []);

    const handleComparaDatasetSwitch = useCallback((e) => {
        setComparaDataset((prevState) => e.target.checked);
    }, []);

    const handleDateInicialPicker = useCallback((value) => {
        setDateInicial((prevState) => value);
    }, []);

    const handleDateFinalPicker = useCallback((value) => {
        setDateFinal((prevState) => value);
    }, []);

    const handleHoraSlider = useCallback((e, value) => {
        setHora((prevState) => value);
    }, []);

    const handleAtivoAutocomplete = useCallback((e, values) => {
        setAtivo((prevState) => values);
    }, []);

    const handleGerenciamentoAutocomplete = useCallback((e, values) => {
        setGerenciamento((prevState) => values);
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
        setTipoCts((prevState) => e.target.value);
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

    // const handleSave = useCallback(() => {
    //     let newFilters = {};
    //     if (tipo.length) newFilters['tipo'] = [...tipo];
    //     if (situacao.length) newFilters['situacao'] = [...situacao];
    //     props.datagridDispatch({ type: DGR_TYPES.FILTERS_CHANGED, payload: newFilters });
    // }, [tipo, situacao, props]);

    // const handleClear = useCallback(() => {
    //     setTipo([]);
    //     setSituacao([]);
    //     props.datagridDispatch({ type: DGR_TYPES.FILTERS_CLEAR });
    // }, [props]);

    /************
     * MISC FUNC
     ************/
    const horaValueText = useCallback((value) => {
        return `${value}:00`;
    }, []);

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
        <Dialog open={props.open} onClose={handleClose} maxWidth='lg' fullWidth>
            <DialogTitle>Filtros</DialogTitle>
            <DialogContent dividers={true}>
                <Grid container spacing={3}>
                    <Grid container item spacing={2} xs={12}>
                        <Grid item md={9} xs={12}>
                            <Autocomplete
                                multiple
                                disableCloseOnSelect
                                name='dataset'
                                options={props.datasetSuggest}
                                value={dataset}
                                onChange={handleDatasetAutocomplete}
                                isOptionEqualToValue={(option, value) => option.id === value.id}
                                getOptionLabel={(option) => option.nome}
                                renderOption={(props, option, { selected }) => (
                                    <li {...props}>
                                        <Checkbox
                                            icon={<CheckBoxOutlineBlank fontSize='small' />}
                                            checkedIcon={<CheckBox fontSize='small' />}
                                            style={{ marginRight: 8 }}
                                            checked={selected}
                                        />
                                        <ListItemText primary={option.nome} />
                                    </li>
                                )}
                                style={{ width: '100%' }}
                                renderInput={(params) => <TextField {...params} label='Dataset' placeholder='' />}
                            />
                        </Grid>
                        <Grid item md={3} xs={12} className={styles.filter__compara}>
                            <FormGroup>
                                <FormControlLabel
                                    classes={{ label: styles.filter__compara_label }}
                                    componentsProps={{ typography: { variant: 'overline' } }}
                                    control={<Switch color='success' checked={comparaDataset} onChange={handleComparaDatasetSwitch} />}
                                    label={comparaDataset ? 'Comparar Datasets' : 'Juntar Datasets'}
                                />
                            </FormGroup>
                        </Grid>
                    </Grid>
                    <Grid item xs={12}>
                        <Divider textAlign='left'>
                            <Typography variant='overline' className={styles.divider_title}>
                                FILTRAR
                            </Typography>
                        </Divider>
                    </Grid>
                    <Grid container item spacing={2} xs={12} sx={{ alignItems: 'center' }}>
                        <Grid item md={2} xs={12}>
                            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
                                <DatePicker
                                    label='De'
                                    closeOnSelect={true}
                                    value={dateInicial}
                                    onChange={handleDateInicialPicker}
                                    minDate={dateInicial}
                                    maxDate={dateFinal}
                                    renderInput={(params) => <TextField {...params} fullWidth size='small' />}
                                />
                            </LocalizationProvider>
                        </Grid>
                        <Grid item md={2} xs={12}>
                            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
                                <DatePicker
                                    label='Até'
                                    closeOnSelect={true}
                                    value={dateFinal}
                                    onChange={handleDateFinalPicker}
                                    minDate={dateInicial}
                                    maxDate={dateFinal}
                                    renderInput={(params) => <TextField {...params} fullWidth size='small' />}
                                />
                            </LocalizationProvider>
                        </Grid>
                        <Grid item md={2} xs={12}>
                            <Stack spacing={2} direction='row' alignItems='center'>
                                <AccessTime sx={{ color: '#555' }} />
                                <Slider
                                    valueLabelDisplay='auto'
                                    disableSwap
                                    marks={true}
                                    min={9}
                                    max={18}
                                    value={hora}
                                    onChange={handleHoraSlider}
                                    valueLabelFormat={horaValueText}
                                    componentsProps={{ root: { className: styles.filter__hora } }}
                                />
                            </Stack>
                        </Grid>
                        <Grid item md={6} xs={12}>
                            <Autocomplete
                                multiple
                                name='ativo'
                                size='small'
                                options={ativos}
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
                        <Grid item md={6} xs={12}>
                            <Autocomplete
                                name='gerenciamento'
                                size='small'
                                options={gerenciamentos}
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
                        <Grid item md={6} xs={12}>
                            <FilterCenarioObs cenarios={cenarios} receivedCenario={cenario} returnCenario={setCenario} />
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
                        <Grid item md={2} xs={12}>
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
                        <Grid item md={2} xs={12}>
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
                        <Grid item md={2} xs={12}>
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
                        <Grid item md={3} xs={12}>
                            <SimulationParada receivedTipoParada={tipoParada} returnTipoParada={setTipoParada} />
                        </Grid>
                        <Grid item md={2} xs={12}>
                            <TextField label='Simular Capital' value={capital} onChange={handleCapitalInput} size='small' fullWidth />
                        </Grid>
                        <Grid item md={2} xs={12}>
                            <TextField label='Simular Risco Máximo' value={riscoMaximo} onChange={handleRiscoMaximoInput} size='small' fullWidth />
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
                <Button onClick={() => {}} endIcon={<AutoFixHigh />}>
                    Salvar
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default FilterDashboard;
