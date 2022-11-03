import { CheckBox, CheckBoxOutlineBlank, KeyboardDoubleArrowUp, NavigateNext } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import {
    Autocomplete,
    Box,
    Breadcrumbs,
    Checkbox,
    Divider,
    FormControl,
    FormControlLabel,
    FormGroup,
    InputLabel,
    ListItemText,
    MenuItem,
    Paper,
    Select,
    Stack,
    Switch,
    TextField,
    Typography,
} from '@mui/material';
import { motion } from 'framer-motion';
import React, { useCallback, useEffect, useState } from 'react';
import { batch } from 'react-redux';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

import gStyles from '../../../../../assets/back/scss/global.module.scss';
import MessageController from '../../../../../components/ui/MessageController';
import { axiosCon } from '../../../../../helpers/axios-con';
import { isObjectEmpty } from '../../../../../helpers/global';
import { add } from '../../../../../store/api-messages/api-messages-slice';
import { handleLogout } from '../../../../../store/auth/auth-action';
import styles from './operacoes-novo.module.scss';

const temposGraficos = [{ value: 5, label: '5min' }];

const DaytradeOperacoesNovo = () => {
    /**********
     * DISPATCH
     **********/
    const dispatch = useDispatch();

    /***********
     * NAVIGATE
     ***********/
    const navigate = useNavigate();

    /*********
     * STATES
     *********/
    const [datasetSuggest, setDatasetSuggest] = useState([]);
    const [cenarioSuggest, setCenarioSuggest] = useState([]);
    const [gerenciamentoSuggest, setGerenciamentoSuggest] = useState([]);
    const [dataset, setDataset] = useState(null);
    const [ativos, setAtivos] = useState([]);
    const [cenarios, setCenarios] = useState([]);
    const [gerenciamentos, setGerenciamentos] = useState([]);
    // Auto-preenchimento
    const [isBacktest, setIsBacktest] = useState(false);
    const [autoDate, setAutoDate] = useState('');
    const [autoAtivo, setAutoAtivo] = useState('');
    const [autoCts, setAutoCts] = useState('');
    const [autoCenario, setAutoCenario] = useState(null);
    const [gerenciamento, setGerenciamento] = useState([]);
    const [tempoGrafico, setTempoGrafico] = useState(5);
    // Linhas de Operação
    const [operacoes, setOperacoes] = useState([]);

    /***********
     * HANDLERS
     ***********/
    const handleIsBacktest = useCallback(() => {
        setIsBacktest((prevState) => !prevState);
    }, []);

    const handleAutoDate = useCallback(() => {
        setAutoDate((prevState) => (prevState !== '' ? '' : 0));
    }, []);

    const handleAutoAtivo = useCallback((e) => {
        setAutoAtivo((prevState) => e.target.value);
    }, []);

    const handleAutoCts = useCallback((e) => {
        setAutoAtivo((prevState) => e.target.value);
    }, []);

    const handleTempoGrafico = useCallback((e) => {
        setAutoAtivo((prevState) => e.target.value);
    }, []);

    const handleAutoCenarioAutocomplete = useCallback((e, values) => {
        setAutoCenario((prevState) => values);
    }, []);

    const handleGerenciamentoAutocomplete = useCallback((e, values) => {
        setGerenciamento((prevState) => values);
    }, []);

    /********************************
     * DATASET AUTOCOMPLETE HANDLERS
     ********************************/
    const handleDatasetAutocomplete = useCallback((e, values) => {
        setDataset((prevState) => values);
    }, []);

    /****************************
     * DATASET AUTOCOMPLETE LOAD
     ****************************/
    // Carregamento do select de Datasets
    useEffect(() => {
        const abortController = new AbortController();
        axiosCon
            .get('/dataset/list_suggest?place=operacoes_novo__picker__nome', { signal: abortController.signal })
            .then((resp) => {
                batch(() => {
                    setDatasetSuggest((prevState) => resp.data.suggestion);
                    setDataset((prevState) => resp.data.suggestion?.[0] ?? null);
                });
            })
            .catch((error) => {
                if (error.response) {
                    if (error.response.status === 401) dispatch(handleLogout());
                    else if (error.response.status === 403) navigate('/daytrade/dashboard', { replace: true });
                    else if (error.response.status === 500) {
                        console.log('Error Suggest: ', error.response.data);
                    }
                } else console.log('Error Axios: ', error.message);
            });
        return () => {
            abortController.abort();
        };
    }, [dispatch, navigate]);

    /************
     * DATA LOAD
     ************/
    useEffect(() => {
        const abortController = new AbortController();
        // Carrega apenas depois que ja foi escolhido um Dataset
        if (dataset !== null)
            axiosCon
                .post(
                    '/operacao/load_datasets__info',
                    {
                        id_dataset: dataset?.id,
                    },
                    { signal: abortController.signal }
                )
                .then((resp) => {
                    let cenario_suggest = resp.data.cenarios.map((c) => ({ value: c.nome, label: c.nome }));
                    let gerenciamento_suggest = resp.data.gerenciamentos.map((g) => ({ value: g.id, label: g.nome }));
                    batch(() => {
                        setAtivos((prevState) => resp.data.ativos);
                        setCenarios((prevState) => resp.data.cenarios);
                        setGerenciamentos((prevState) => resp.data.gerenciamentos);
                        setCenarioSuggest((prevState) => cenario_suggest);
                        setGerenciamentoSuggest((prevState) => gerenciamento_suggest);
                    });
                })
                .catch((error) => {
                    if (error.response) {
                        if (error.response.status === 401) dispatch(handleLogout());
                        else if (error.response.status === 403) navigate('/daytrade/dashboard', { replace: true });
                        else if (error.response.status === 500) {
                            dispatch(
                                add({
                                    message: error.response.data,
                                    severity: 'error',
                                })
                            );
                        }
                    } else console.log('Error Axios: ', error.message);
                });
        return () => {
            abortController.abort();
        };
    }, [dataset?.id, dispatch, navigate]);

    return (
        <>
            <MessageController overlay={true} />
            <Box
                className={gStyles.wrapper}
                component={motion.div}
                initial={{ y: '-100vh' }}
                animate={{ y: 0, transition: { duration: 0.25 } }}
                exit={{ transition: { duration: 0.1 } }}
            >
                <Stack direction='column' spacing={2} sx={{ height: '100%' }}>
                    <div className={gStyles.title_panel}>
                        <Breadcrumbs separator={<NavigateNext fontSize='small' />}>
                            <Typography className={gStyles.title_link} variant='overline' component={Link} to='/daytrade/dashboard' replace={true}>
                                Daytrade
                            </Typography>
                            <Typography className={gStyles.title} variant='overline'>
                                Operações Novas
                            </Typography>
                        </Breadcrumbs>
                    </div>
                    <Divider />
                    <div className={styles.picker_panel}>
                        <Paper elevation={0}>
                            <Autocomplete
                                name='dataset'
                                options={datasetSuggest}
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
                                        <ListItemText
                                            primary={option.nome}
                                            secondary={option.data_atualizacao}
                                            secondaryTypographyProps={{ className: styles.dataset_atualizadoEm }}
                                        />
                                    </li>
                                )}
                                style={{ width: '100%' }}
                                renderInput={(params) => <TextField {...params} label='Dataset' placeholder='' />}
                            />
                        </Paper>
                    </div>
                    <Paper sx={{ px: 2, pb: 1, pt: 2 }}>
                        <Stack direction='row' spacing={2}>
                            <FormGroup className={styles.autofill__slider} sx={{ flex: 1 }}>
                                <FormControlLabel
                                    classes={{ label: styles.filter__slider_label }}
                                    componentsProps={{ typography: { variant: 'overline' } }}
                                    control={<Switch color='success' checked={isBacktest} onChange={handleIsBacktest} />}
                                    label='É Backtest'
                                />
                            </FormGroup>
                            <FormGroup className={styles.autofill__slider} sx={{ flex: 1 }}>
                                <FormControlLabel
                                    classes={{ label: styles.filter__slider_label }}
                                    componentsProps={{ typography: { variant: 'overline' } }}
                                    control={<Switch color='success' checked={autoDate !== ''} onChange={handleAutoDate} />}
                                    label='Data de Hoje'
                                />
                            </FormGroup>
                            <TextField label='Ativo (Padrão)' variant='outlined' value={autoAtivo} onChange={handleAutoAtivo} size='small' sx={{ flex: 1 }} />
                            <TextField label='Cts (Padrão)' variant='outlined' value={autoCts} onChange={handleAutoCts} size='small' sx={{ flex: 1 }} />
                            <Autocomplete
                                name='cenario'
                                size='small'
                                openOnFocus
                                options={cenarioSuggest}
                                value={autoCenario}
                                onChange={handleAutoCenarioAutocomplete}
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
                                style={{ flex: 1 }}
                                renderInput={(params) => <TextField {...params} label='Cenário (Padrão)' placeholder='' />}
                            />
                            <Autocomplete
                                name='gerenciamento'
                                size='small'
                                openOnFocus
                                multiple
                                limitTags={2}
                                options={gerenciamentoSuggest}
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
                                style={{ flex: 2 }}
                                renderInput={(params) => <TextField {...params} label='R:R (Gerenciamentos)' placeholder='' />}
                            />
                            <FormControl sx={{ flex: 1 }}>
                                <InputLabel>Tempo Gráfico</InputLabel>
                                <Select label='Tempo Gráfico' size='small' value={tempoGrafico} onChange={handleTempoGrafico}>
                                    {temposGraficos.map((tG, i) => (
                                        <MenuItem key={`tG_${i}`} value={tG.value}>
                                            {tG.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Stack>
                    </Paper>
                </Stack>
            </Box>
        </>
    );
};

export default DaytradeOperacoesNovo;