import { Switch, TableCell, TableRow } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import { useCallback } from 'react';
import { batch } from 'react-redux';

import Input from '../../../../../../components/ui/Input';
import { maskValue } from '../../../../../../helpers/global';
import styles from './operacao.module.scss';

/*
    Componente de cada linha operação.
    Cada linha é composta com um Gerenciamento especifico, e pode fazer parte de um grupo.

    O Grupo espelha algumas informações como: Data, Ativo, Op, Barra, Vol, Cenario, Observações e Erro

    Props recebidos:
        linhaOperacao(object)      : Objecto com os valores da linha passados do 
        isBacktest(true|false)     : Se a linha será de padrão Bactest
        updateLinhasOperacao(func) : Função para repassar os valores alterados para cima
*/
const Operacao = (props) => {
    /*********
     * STATES
     *********/
    const [date, setDate] = useState(props.linhaOperacao.date.value);
    const [ativo, setAtivo] = useState(props.linhaOperacao.ativo.value);
    const [gerenciamento, setGerenciamento] = useState(props.linhaOperacao?.gerenciamento?.value ?? null);
    const [op, setOp] = useState(props.linhaOperacao.op.value);
    const [barra, setBarra] = useState(props.linhaOperacao.barra.value);
    const [cts, setCts] = useState(props.linhaOperacao.cts.value);
    const [cenario, setCenario] = useState(props.linhaOperacao.cenario.value);
    const [observacoes, setObservacoes] = useState(props.linhaOperacao.observacoes.value);
    const [result, setResult] = useState(props.linhaOperacao.result.value);
    const [retornoRisco, setRetornoRisco] = useState(props.linhaOperacao.retornoRisco.value);
    const [erro, setErro] = useState(props.linhaOperacao?.erro?.value ?? null);

    /********
     * FUNCS
     ********/
    const generateChecksum = useCallback(
        (values = null) => {
            let checksum = '';
            checksum += `date=${values?.date ?? props.linhaOperacao.date.value}`;
            checksum += `&ativo=${values?.ativo ?? props.linhaOperacao.ativo.value}`;
            checksum += `&op=${values?.op ?? props.linhaOperacao.op.value}`;
            checksum += `&barra=${values?.barra ?? props.linhaOperacao.barra.value}`;
            checksum += `&cts=${values?.cts ?? props.linhaOperacao.cts.value}`;
            checksum += `&cenario=${values?.cenario ?? props.linhaOperacao.cenario.value}`;
            checksum += `&observacoes=${values?.observacoes ?? props.linhaOperacao.observacoes.value}`;
            checksum += `&result=${values?.result ?? props.linhaOperacao.result.value}`;
            checksum += `&rr=${values?.retornoRisco ?? props.linhaOperacao.retornoRisco.value}`;
            if ('erro' in props.linhaOperacao) checksum += `&erro=${values?.erro ?? props.linhaOperacao.erro.value}`;
            return checksum;
        },
        [
            props.linhaOperacao.date.value,
            props.linhaOperacao.ativo.value,
            props.linhaOperacao.op.value,
            props.linhaOperacao.barra.value,
            props.linhaOperacao.cts.value,
            props.linhaOperacao.cenario.value,
            props.linhaOperacao.observacoes.value,
            props.linhaOperacao.result.value,
            props.linhaOperacao.retornoRisco.value,
            props.linhaOperacao?.erro?.value,
        ]
    );

    const updateInfo = useCallback(
        (value = null) => {
            // Atualiza se os valores não forem vazios, ou se forem, se anteriormente tinha valor
            if (
                /* prettier-ignore */ ((value !== null && value.key === 'date'    && (value.value !== '' || (value.value === '' && dateOldValueRef.current !== '')))    || (date !== ''    || (date === ''    && dateOldValueRef.current !== ''))) &&
                /* prettier-ignore */ ((value !== null && value.key === 'ativo'   && (value.value !== '' || (value.value === '' && ativoOldValueRef.current !== '')))   || (ativo !== ''   || (ativo === ''   && ativoOldValueRef.current !== ''))) &&
                /* prettier-ignore */ ((value !== null && value.key === 'op'      && (value.value !== '' || (value.value === '' && opOldValueRef.current !== '')))      || (op !== ''      || (op === ''      && opOldValueRef.current !== ''))) &&
                /* prettier-ignore */ ((value !== null && value.key === 'barra'   && (value.value !== '' || (value.value === '' && barraOldValueRef.current !== '')))   || (barra !== ''   || (barra === ''   && barraOldValueRef.current !== ''))) &&
                /* prettier-ignore */ ((value !== null && value.key === 'cts'     && (value.value !== '' || (value.value === '' && ctsOldValueRef.current !== '')))     || (cts !== ''     || (cts === ''     && ctsOldValueRef.current !== ''))) &&
                /* prettier-ignore */ ((value !== null && value.key === 'result'  && (value.value !== '' || (value.value === '' && resultOldValueRef.current !== '')))  || (result !== ''  || (result === ''  && resultOldValueRef.current !== ''))) &&
                /* prettier-ignore */ ((value !== null && value.key === 'cenario' && (value.value !== '' || (value.value === '' && cenarioOldValueRef.current !== ''))) || (cenario !== '' || (cenario === '' && cenarioOldValueRef.current !== '')))
            ) {
                let updatedValues = {
                    linha_id: props.linhaOperacao.linha_id,
                    grupo_id: props.linhaOperacao.grupo_id,
                    date: date,
                    ativo: ativo,
                    op: op,
                    barra: barra,
                    cts: cts,
                    cenario: cenario,
                    observacoes: observacoes,
                    result: result,
                    retornoRisco: retornoRisco,
                    ...(erro !== null && { erro: erro }),
                    ...(value !== null && { [value.key]: value.value }),
                };
                propsLinhaOperacaoRef_checksum.current = generateChecksum(updatedValues);
                // Reseta o valor anterior para zero, pois seu propósito já foi comprido nesse momento
                /* prettier-ignore */ if ((value !== null && value.key === 'date'    && (value.value === '' && dateOldValueRef.current !== ''))    || (date === ''    && dateOldValueRef.current !== '')) dateOldValueRef.current = '';
                /* prettier-ignore */ if ((value !== null && value.key === 'ativo'   && (value.value === '' && ativoOldValueRef.current !== ''))   || (ativo === ''   && ativoOldValueRef.current !== '')) ativoOldValueRef.current = '';
                /* prettier-ignore */ if ((value !== null && value.key === 'op'      && (value.value === '' && opOldValueRef.current !== ''))      || (op === ''      && opOldValueRef.current !== '')) opOldValueRef.current = '';
                /* prettier-ignore */ if ((value !== null && value.key === 'barra'   && (value.value === '' && barraOldValueRef.current !== ''))   || (barra === ''   && barraOldValueRef.current !== '')) barraOldValueRef.current = '';
                /* prettier-ignore */ if ((value !== null && value.key === 'cts'     && (value.value === '' && ctsOldValueRef.current !== ''))     || (cts === ''     && ctsOldValueRef.current !== '')) ctsOldValueRef.current = '';
                /* prettier-ignore */ if ((value !== null && value.key === 'result'  && (value.value === '' && resultOldValueRef.current !== ''))  || (result === ''  && resultOldValueRef.current !== '')) resultOldValueRef.current = '';
                /* prettier-ignore */ if ((value !== null && value.key === 'cenario' && (value.value === '' && cenarioOldValueRef.current !== '')) || (cenario === '' && cenarioOldValueRef.current !== '')) cenarioOldValueRef.current = '';
                props.updateLinhasOperacao(updatedValues);
            }
        },
        [date, ativo, op, barra, cts, result, cenario, observacoes, retornoRisco, erro, props.linhaOperacao.linha_id, props.linhaOperacao.grupo_id, generateChecksum]
    );

    /*******
     * REFS
     *******/
    const propsLinhaOperacaoRef_checksum = useRef(generateChecksum());
    // Propósito desses valores antigos é atualiar o componente Pai, quando o valor do input for apagado, ai eu preciso saber se tinha valor anterior
    // Porque se sempre foi vazio, ai não deve atualizar
    const dateOldValueRef = useRef(props.linhaOperacao.date.value);
    const ativoOldValueRef = useRef(props.linhaOperacao.ativo.value);
    const opOldValueRef = useRef(props.linhaOperacao.op.value);
    const barraOldValueRef = useRef(props.linhaOperacao.barra.value);
    const ctsOldValueRef = useRef(props.linhaOperacao.cts.value);
    const cenarioOldValueRef = useRef(props.linhaOperacao.cenario.value);
    const resultOldValueRef = useRef(props.linhaOperacao.result.value);

    /***********
     * HANDLERS
     ***********/
    const handleBlur_Generic = useCallback(() => {
        updateInfo();
    }, [updateInfo]);

    const handleDateChange = useCallback(
        (e) => {
            let newValue = maskValue('date', { current: e.target.value, old: date });
            setDate((prevState) => {
                if (newValue.check) {
                    dateOldValueRef.current = prevState;
                    return newValue.value;
                }
                return prevState;
            });
        },
        [date]
    );

    const handleAtivoChange = useCallback((e) => {
        setAtivo((prevState) => {
            ativoOldValueRef.current = prevState;
            return e.target.value;
        });
    }, []);
    const handleAtivoBlur = useCallback(() => {
        let value = { value: ativo, check: false };
        for (let a of props.ativos) {
            if (a.nome.toLowerCase() === value.value.toLowerCase()) {
                value.value = a.nome;
                value.check = true;
                break;
            }
        }
        batch(() => {
            if (value.check) {
                batch(() => {
                    setAtivo((prevState) => {
                        ativoOldValueRef.current = prevState;
                        return value.value;
                    });
                    updateInfo({ key: 'ativo', value: value.value });
                });
            } else {
                setAtivo((prevState) => {
                    ativoOldValueRef.current = prevState;
                    return '';
                });
            }
        });
    }, [ativo, updateInfo]);

    const handleOpChange = useCallback((e) => {
        let newValue = maskValue('inputOp', { current: e.target.value });
        setOp((prevState) => {
            if (newValue.check) {
                opOldValueRef.current = prevState;
                return newValue.value;
            }
            return prevState;
        });
    }, []);

    const handleBarraChange = useCallback((e) => {
        let newValue = maskValue('number', { current: e.target.value });
        setBarra((prevState) => {
            if (newValue.check) {
                barraOldValueRef.current = prevState;
                return newValue.value;
            }
            return prevState;
        });
    }, []);

    const handleCtsChange = useCallback((e) => {
        let newValue = maskValue('number', { current: e.target.value });
        setCts((prevState) => {
            if (newValue.check) {
                ctsOldValueRef.current = prevState;
                return newValue.value;
            }
            return prevState;
        });
    }, []);

    const handleCenarioChange = useCallback((e) => {
        setCenario((prevState) => {
            cenarioOldValueRef.current = prevState;
            return e.target.value;
        });
    }, []);
    const handleCenarioBlur = useCallback(() => {
        let value = { value: cenario, check: false };
        for (let c of props.cenarios) {
            if (c.nome.toLowerCase() === value.value.toLowerCase()) {
                value.value = c.nome;
                value.check = true;
                break;
            }
        }
        if (value.check) {
            batch(() => {
                setCenario((prevState) => {
                    cenarioOldValueRef.current = prevState;
                    return value.value;
                });
                props.updateObservacoesPainel_Cenario((prevState) => value.value);
                updateInfo({ key: 'cenario', value: value.value });
            });
        } else {
            batch(() => {
                setCenario((prevState) => {
                    cenarioOldValueRef.current = prevState;
                    return '';
                });
                props.updateObservacoesPainel_Cenario((prevState) => '');
                updateInfo({ key: 'cenario', value: value.value });
            });
        }
    }, [cenario, updateInfo]);

    const handleObservacoesChange = useCallback((e) => {
        let newValue = maskValue('inputObservacao', { current: e.target.value });
        setObservacoes((prevState) => (newValue.check ? newValue.value : prevState));
    }, []);

    const handleResultChange = useCallback((e) => {
        let newValue = maskValue('number_decimal', { current: e.target.value });
        setResult((prevState) => {
            if (newValue.check) {
                resultOldValueRef.current = prevState;
                return newValue.value;
            }
            return prevState;
        });
    }, []);
    const handleResultBlur = useCallback(() => {
        if (/^.*\.$/g.test(result)) {
            let newValue = result + '00';
            batch(() => {
                setResult((prevState) => {
                    resultOldValueRef.current = prevState;
                    return newValue;
                });
                updateInfo({ key: 'result', value: newValue });
            });
        } else updateInfo();
    }, [result, updateInfo]);

    const handleRetornoRiscoChange = useCallback((e) => {
        let newValue = maskValue('number_decimal', { current: e.target.value });
        setRetornoRisco((prevState) => (newValue.check ? newValue.value : prevState));
    }, []);

    const handleErroChange = useCallback(() => {
        batch(() => {
            setErro((prevState) => !erro);
            updateInfo({ key: 'erro', value: !erro });
        });
    }, [erro, updateInfo]);

    /**********************************************
     * ATUALIZA OS INPUTS, POR ALTERAÇÕES EXTERNAS
     **********************************************/
    useEffect(() => {
        if (propsLinhaOperacaoRef_checksum.current !== generateChecksum()) {
            batch(() => {
                setDate((prevState) => props.linhaOperacao.date.value);
                setAtivo((prevState) => props.linhaOperacao.ativo.value);
                setOp((prevState) => props.linhaOperacao.op.value);
                setBarra((prevState) => props.linhaOperacao.barra.value);
                setCenario((prevState) => props.linhaOperacao.cenario.value);
                setObservacoes((prevState) => props.linhaOperacao.observacoes.value);
                setErro((prevState) => props.linhaOperacao?.erro?.value ?? null);
            });
            dateOldValueRef.current = props.linhaOperacao.date.value;
            ativoOldValueRef.current = props.linhaOperacao.ativo.value;
            opOldValueRef.current = props.linhaOperacao.op.value;
            barraOldValueRef.current = props.linhaOperacao.barra.value;
            cenarioOldValueRef.current = props.linhaOperacao.cenario.value;
            propsLinhaOperacaoRef_checksum.current = generateChecksum();
        }
    });

    return (
        <TableRow className={`${styles.table_row} ${props.linhaOperacao.last_of_group ? styles.table_row__last_of_group : ''}`}>
            <TableCell className={styles.table_cell__date}>
                <Input
                    id={`${props.linhaOperacao.linha_id}__date`}
                    value={date}
                    onChange={handleDateChange}
                    onBlur={handleBlur_Generic}
                    disabled={props.linhaOperacao.date.disabled}
                    addedClasses={{ input: `${styles.inputCenter__input} ${styles.inputTiny__input}` }}
                />
            </TableCell>
            <TableCell className={styles.table_cell__ativo}>
                <Input
                    id={`${props.linhaOperacao.linha_id}__ativo`}
                    value={ativo}
                    onChange={handleAtivoChange}
                    onBlur={handleAtivoBlur}
                    disabled={props.linhaOperacao.ativo.disabled}
                    addedClasses={{ input: `${styles.inputCenter__input} ${styles.inputTiny__input}` }}
                />
            </TableCell>
            {props.hasGerenciamento ? (
                <TableCell className={styles.table_cell__gerenciamento}>
                    <Input
                        id={`${props.linhaOperacao.linha_id}__gerenciamento`}
                        value={gerenciamento}
                        disabled={props.linhaOperacao?.gerenciamento?.disabled ?? false}
                        addedClasses={{ input: `${styles.inputCenter__input} ${styles.inputTiny__input}` }}
                    />
                </TableCell>
            ) : (
                <></>
            )}
            <TableCell className={styles.table_cell__op}>
                <Input
                    id={`${props.linhaOperacao.linha_id}__op`}
                    value={op}
                    onChange={handleOpChange}
                    onBlur={handleBlur_Generic}
                    disabled={props.linhaOperacao.op.disabled}
                    addedClasses={{ input: `${styles.inputCenter__input} ${styles.inputTiny__input}` }}
                />
            </TableCell>
            <TableCell className={styles.table_cell__barra}>
                <Input
                    id={`${props.linhaOperacao.linha_id}__barra`}
                    value={barra}
                    onChange={handleBarraChange}
                    onBlur={handleBlur_Generic}
                    disabled={props.linhaOperacao.barra.disabled}
                    addedClasses={{ input: `${styles.inputCenter__input} ${styles.inputTiny__input}` }}
                />
            </TableCell>
            <TableCell className={styles.table_cell__cts}>
                <Input
                    id={`${props.linhaOperacao.linha_id}__cts`}
                    value={cts}
                    onChange={handleCtsChange}
                    onBlur={handleBlur_Generic}
                    disabled={props.linhaOperacao.cts.disabled}
                    addedClasses={{ input: `${styles.inputCenter__input} ${styles.inputTiny__input}` }}
                />
            </TableCell>
            <TableCell className={styles.table_cell__cenario}>
                <Input
                    id={`${props.linhaOperacao.linha_id}__cenario`}
                    value={cenario}
                    onChange={handleCenarioChange}
                    onBlur={handleCenarioBlur}
                    disabled={props.linhaOperacao.cenario.disabled}
                    addedClasses={{ input: `${styles.inputCenter__input} ${styles.inputTiny__input}` }}
                />
            </TableCell>
            <TableCell className={styles.table_cell__observacoes}>
                <Input
                    id={`${props.linhaOperacao.linha_id}__observacoes`}
                    value={observacoes}
                    onChange={handleObservacoesChange}
                    onBlur={handleBlur_Generic}
                    disabled={props.linhaOperacao.observacoes.disabled}
                    addedClasses={{ input: `${styles.inputCenter__input} ${styles.inputTiny__input}` }}
                />
            </TableCell>
            <TableCell className={styles.table_cell__result}>
                <Input
                    id={`${props.linhaOperacao.linha_id}__result`}
                    value={result}
                    onChange={handleResultChange}
                    onBlur={handleResultBlur}
                    disabled={props.linhaOperacao.result.disabled}
                    addedClasses={{ input: `${styles.inputCenter__input} ${styles.inputTiny__input}` }}
                />
            </TableCell>
            <TableCell className={styles.table_cell__retornoRisco}>
                <Input
                    id={`${props.linhaOperacao.linha_id}__retornoRisco`}
                    value={retornoRisco}
                    onChange={handleRetornoRiscoChange}
                    onBlur={handleBlur_Generic}
                    disabled={props.linhaOperacao.retornoRisco.disabled}
                    addedClasses={{ input: `${styles.inputCenter__input} ${styles.inputTiny__input}` }}
                />
            </TableCell>
            {!props.isBacktest ? (
                <TableCell className={styles.table_cell__erro} align='center'>
                    <Switch
                        id={`${props.linhaOperacao.linha_id}__erro`}
                        color='error'
                        size='small'
                        checked={erro}
                        onChange={handleErroChange}
                        disabled={props.linhaOperacao?.erro?.disabled ?? false}
                    />
                </TableCell>
            ) : (
                <></>
            )}
        </TableRow>
    );
};

export default Operacao;
