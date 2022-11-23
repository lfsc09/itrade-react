import { Add, CheckBox, CheckBoxOutlineBlank, ConstructionOutlined, DeleteSweep, NavigateNext, Telegram } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import {
    Autocomplete,
    Box,
    Breadcrumbs,
    Button,
    Checkbox,
    Divider,
    fabClasses,
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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from '@mui/material';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import cloneDeep from 'lodash.clonedeep';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { batch } from 'react-redux';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

import gStyles from '../../../../../assets/back/scss/global.module.scss';
import MessageController from '../../../../../components/ui/MessageController';
import NoContent from '../../../../../components/ui/NoContent';
import { axiosCon } from '../../../../../helpers/axios-con';
import { generateHash, isObjectEmpty } from '../../../../../helpers/global';
import useLongPress from '../../../../../helpers/useLongPress';
import { add } from '../../../../../store/api-messages/api-messages-slice';
import { handleLogout } from '../../../../../store/auth/auth-action';
import ObservacoesPainel from './ObservacoesPainel';
import Operacao from './Operacao';
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
    const [linhasOperacao, setLinhasOperacao] = useState([]);
    const [observacoesPainel_Cenario, setObservacoesPainel_Cenario] = useState('');

    /*******
     * REFS
     *******/
    const cenarioHasObsRef = useRef(false);
    const gerenciamentoPrevStateRef = useRef(0);

    /********************************
     * GERA NOVAS LINHAS DE OPERAÇÃO
     ********************************/
    const groupData_struct = useCallback(() => {
        let groupData_struct = [];
        let group_id = generateHash(15);
        for (let t = 0; t < 1; t++) {
            if (gerenciamento.length > 0) {
                for (let gerenc of gerenciamento) {
                    groupData_struct.push({
                        linha_id: generateHash(10),
                        grupo_id: group_id,
                        last_of_group: false,
                        date: { value: autoDate, disabled: autoDate !== '' },
                        ativo: { value: autoAtivo, disabled: autoAtivo !== '' },
                        gerenciamento: { value: gerenc.label, disabled: true },
                        op: { value: '', disabled: false },
                        barra: { value: '', disabled: false },
                        cts: { value: autoCts, disabled: autoCts !== '' },
                        cenario: { value: autoCenario?.label ?? '', disabled: autoCenario !== null && autoCenario.label !== '' },
                        observacoes: { value: '', disabled: false },
                        result: { value: '', disabled: false },
                        retornoRisco: { value: '', disabled: false },
                        ...(isBacktest && { erro: { value: false, disabled: false } }),
                    });
                }
            } else {
                groupData_struct.push({
                    linha_id: generateHash(10),
                    grupo_id: group_id,
                    last_of_group: false,
                    date: { value: autoDate, disabled: autoDate !== '' },
                    ativo: { value: autoAtivo, disabled: autoAtivo !== '' },
                    op: { value: '', disabled: false },
                    barra: { value: '', disabled: false },
                    cts: { value: autoCts, disabled: autoCts !== '' },
                    cenario: { value: autoCenario?.label ?? '', disabled: autoCenario !== null && autoCenario.label !== '' },
                    observacoes: { value: '', disabled: false },
                    result: { value: '', disabled: false },
                    retornoRisco: { value: '', disabled: false },
                    ...(isBacktest && { erro: { value: false, disabled: false } }),
                });
            }
            if (groupData_struct.length) groupData_struct[groupData_struct.length - 1].last_of_group = true;
        }
        return groupData_struct;
    }, [isBacktest, gerenciamento, autoDate, autoAtivo, autoCts, autoCenario]);

    /*****************************
     * ATUALIZA A LINHA E O GRUPO
     *****************************/
    const updateLinhasOperacao = useCallback(
        (lO) => {
            let cpyLinhasOperacao = cloneDeep(linhasOperacao);
            // Busca as linhas
            for (let i = 0; i < cpyLinhasOperacao.length; i++) {
                // Atualiza colunas que devem se copiar se estiverem vazios (Ex: Data)
                if (cpyLinhasOperacao[i].date.value === '') cpyLinhasOperacao[i].date.value = lO.date;
                if (cpyLinhasOperacao[i].ativo.value === '') cpyLinhasOperacao[i].ativo.value = lO.ativo;
                // Da própria linha alterada
                if (lO.linha_id === cpyLinhasOperacao[i].linha_id) {
                    cpyLinhasOperacao[i].op.value = lO.op;
                    cpyLinhasOperacao[i].barra.value = lO.barra;
                    cpyLinhasOperacao[i].cts.value = lO.cts;
                    cpyLinhasOperacao[i].cenario.value = lO.cenario;
                    cpyLinhasOperacao[i].observacoes.value = lO.observacoes;
                    cpyLinhasOperacao[i].result.value = lO.result;
                    cpyLinhasOperacao[i].retornoRisco.value = lO.retornoRisco;
                    if ('erro' in lO) cpyLinhasOperacao[i].erro.value = lO.erro;
                }
                // Do grupo da linha alterada
                else if (lO.grupo_id === cpyLinhasOperacao[i].grupo_id) {
                    cpyLinhasOperacao[i].op.value = lO.op;
                    cpyLinhasOperacao[i].barra.value = lO.barra;
                    cpyLinhasOperacao[i].cts.value = lO.cts;
                    cpyLinhasOperacao[i].cenario.value = lO.cenario;
                    cpyLinhasOperacao[i].observacoes.value = lO.observacoes;
                    if ('erro' in lO) cpyLinhasOperacao[i].erro.value = lO.erro;
                }
            }
            setLinhasOperacao((prevState) => cpyLinhasOperacao);
        },
        [linhasOperacao]
    );

    /***********
     * HANDLERS
     ***********/
    const handleIsBacktest = useCallback(() => {
        batch(() => {
            setIsBacktest((prevState) => !prevState);
            setLinhasOperacao((prevState) => []);
            setObservacoesPainel_Cenario((prevState) => '');
        });
    }, []);

    const handleAutoDate = useCallback(() => {
        setAutoDate((prevState) => (prevState !== '' ? '' : format(new Date(), 'dd/MM/yyyy')));
    }, []);

    const handleAutoAtivo = useCallback(
        (e) => {
            let newValue = e.target.value;
            for (let a of ativos) {
                if (a.nome.toLowerCase() === e.target.value.toLowerCase()) {
                    newValue = a.nome;
                    break;
                }
            }
            setAutoAtivo((prevState) => newValue);
        },
        [ativos]
    );

    const handleAutoCts = useCallback((e) => {
        setAutoCts((prevState) => e.target.value);
    }, []);

    const handleTempoGrafico = useCallback((e) => {
        setAutoAtivo((prevState) => e.target.value);
    }, []);

    const handleAutoCenarioAutocomplete = useCallback((e, values) => {
        setAutoCenario((prevState) => values);
    }, []);

    const handleGerenciamentoAutocomplete = useCallback((e, values) => {
        if (gerenciamentoPrevStateRef.current > 0 && values.length > 0) setGerenciamento((prevState) => values);
        else {
            batch(() => {
                setGerenciamento((prevState) => values);
                setLinhasOperacao((prevState) => []);
                setObservacoesPainel_Cenario((prevState) => '');
            });
        }
        gerenciamentoPrevStateRef.current = values.length;
    }, []);

    /*******************
     * HANDLERS BUTTONS
     *******************/
    const handleMaisOperacoes = useCallback(() => {
        let cpyLinhasOperacao = [...cloneDeep(linhasOperacao), ...groupData_struct()];
        setLinhasOperacao((prevState) => cpyLinhasOperacao);
    }, [linhasOperacao, groupData_struct]);

    const handleLimpaTudo = useCallback(() => {
        batch(() => {
            setLinhasOperacao((prevState) => groupData_struct());
            setObservacoesPainel_Cenario((prevState) => '');
        });
    }, [groupData_struct]);

    /************
     * LONGPRESS
     ************/
    const [onStart_handleLimpaTudo, onEnd_handleLimpaTudo] = useLongPress(handleLimpaTudo, 500);

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
                    cenarioHasObsRef.current = resp.data.cenarios.reduce((rC, c) => rC || c.observacoes.length > 0, false);
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
                <Stack direction='column' spacing={2} sx={{ height: '100%', flexGrow: '1' }}>
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
                                limitTags={3}
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
                    <Stack direction='row' spacing={2}>
                        <Button variant='contained' sx={{ flex: 1 }} startIcon={<Add />} onClick={handleMaisOperacoes}>
                            Operações
                        </Button>
                        <Button variant='contained' sx={{ flex: 1 }} color='success' endIcon={<Telegram />} disabled={linhasOperacao.length === 0}>
                            Enviar
                        </Button>
                        <Button
                            variant='outlined'
                            sx={{ flex: 1 }}
                            color='error'
                            startIcon={<DeleteSweep />}
                            onMouseDown={onStart_handleLimpaTudo}
                            onMouseUp={onEnd_handleLimpaTudo}
                            disabled={linhasOperacao.length === 0}
                        >
                            Limpa Tudo
                        </Button>
                    </Stack>
                    <Stack direction='row' spacing={2} sx={{ flexGrow: '1' }}>
                        <Paper sx={{ flex: 3, p: 2 }}>
                            {linhasOperacao.length > 0 ? (
                                <Table size='small'>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Data</TableCell>
                                            <TableCell>Ativo</TableCell>
                                            {gerenciamento.length > 0 ? <TableCell>Gerenc.</TableCell> : <></>}
                                            <TableCell>Op</TableCell>
                                            <TableCell>Barra</TableCell>
                                            <TableCell>Cts</TableCell>
                                            <TableCell>Cenário</TableCell>
                                            <TableCell>Observações</TableCell>
                                            <TableCell>Result.</TableCell>
                                            <TableCell>Retorno x Risco</TableCell>
                                            {!isBacktest ? <TableCell align='center'>Erro</TableCell> : <></>}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {linhasOperacao.map((lO) => (
                                            <Operacao
                                                key={`linhaOp_${lO.linha_id}`}
                                                hasGerenciamento={gerenciamento.length > 0}
                                                isBacktest={isBacktest}
                                                linhaOperacao={lO}
                                                cenarios={cenarios}
                                                ativos={ativos}
                                                updateLinhasOperacao={updateLinhasOperacao}
                                                updateObservacoesPainel_Cenario={setObservacoesPainel_Cenario}
                                            />
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <NoContent type='empty-data' empty_text='Nada a mostrar' text_color='black' text_bold={true} text_size='small' />
                            )}
                        </Paper>
                        {cenarioHasObsRef.current ? (
                            <Paper sx={{ flex: 1, p: 2 }}>
                                <ObservacoesPainel cenario={observacoesPainel_Cenario} cenarios={cenarios} container_name='observacoes_portal' />
                            </Paper>
                        ) : (
                            <></>
                        )}
                    </Stack>
                </Stack>
            </Box>
        </>
    );
};

export default DaytradeOperacoesNovo;
