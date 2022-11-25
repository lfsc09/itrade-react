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
    const [result, setResult] = useState(props.linhaOperacao.result.value);
    const [cenario, setCenario] = useState(props.linhaOperacao.cenario.value);
    const [observacoes, setObservacoes] = useState(props.linhaOperacao.observacoes.value);
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
            if (date !== '' && ativo !== '' && op !== '' && barra !== '' && cts !== '' && result !== '' && cenario !== '') {
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
                props.updateLinhasOperacao(updatedValues);
            }
        },
        [date, ativo, op, barra, cts, cenario, observacoes, result, retornoRisco, erro, props.linhaOperacao.linha_id, props.linhaOperacao.grupo_id, generateChecksum]
    );

    /*******
     * REFS
     *******/
    const propsLinhaOperacaoRef_checksum = useRef(generateChecksum());
    const dateOldValueRef = useRef(props.linhaOperacao.date.value);
    const ativoRef = useRef();
    const barraRef = useRef();

    /***********
     * HANDLERS
     ***********/
    const handleBlur_Generic = useCallback(() => {
        updateInfo();
    }, [updateInfo]);

    const handleDateChange = useCallback((e) => {
        let newValue = maskValue('date', { current: e.target.value, old: dateOldValueRef.current }, () => {
            ativoRef.current.querySelector('input')?.focus();
        });
        setDate((prevState) => (newValue.check ? newValue.value : prevState));
        if (newValue.check) dateOldValueRef.current = newValue.value;
    }, []);

    const handleAtivoChange = useCallback((e) => {
        setAtivo(e.target.value);
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
            setAtivo((prevState) => (value.check ? value.value : ''));
            updateInfo({ key: 'ativo', value: value.value });
        });
    }, [ativo]);

    const handleOpChange = useCallback((e) => {
        let newValue = maskValue('inputOp', { current: e.target.value }, (value, check) => {
            if (check && value !== '') barraRef.current.querySelector('input')?.focus();
        });
        setOp((prevState) => (newValue.check ? newValue.value : prevState));
    }, []);

    const handleBarraChange = useCallback((e) => {
        let newValue = maskValue('number', { current: e.target.value });
        setBarra((prevState) => (newValue.check ? newValue.value : prevState));
    }, []);

    const handleCtsChange = useCallback((e) => {
        let newValue = maskValue('number', { current: e.target.value });
        setCts((prevState) => (newValue.check ? newValue.value : prevState));
    }, []);

    const handleCenarioChange = useCallback((e) => {
        setCenario(e.target.value);
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
                setCenario((prevState) => value.value);
                props.updateObservacoesPainel_Cenario((prevState) => value.value);
            });
        } else {
            batch(() => {
                setCenario((prevState) => '');
                props.updateObservacoesPainel_Cenario((prevState) => '');
            });
        }
    }, [cenario]);

    const handleObservacoesChange = useCallback((e) => {
        let newValue = maskValue('inputObservacao', { current: e.target.value });
        setObservacoes((prevState) => (newValue.check ? newValue.value : prevState));
    }, []);

    const handleResultChange = useCallback((e) => {
        let newValue = maskValue('valor_financeiro', { current: e.target.value });
        setResult((prevState) => (newValue.check ? newValue.value : prevState));
    }, []);

    const handleRetornoRiscoChange = useCallback((e) => {
        let newValue = maskValue('valor_financeiro', { current: e.target.value });
        setRetornoRisco((prevState) => (newValue.check ? newValue.value : prevState));
    }, []);

    const handleErroChange = useCallback(() => {
        batch(() => {
            setErro((prevState) => !erro);
            updateInfo({ key: 'erro', value: !erro });
        });
    }, [erro]);

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
                    ref={ativoRef}
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
                    ref={barraRef}
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
                    onBlur={handleBlur_Generic}
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
