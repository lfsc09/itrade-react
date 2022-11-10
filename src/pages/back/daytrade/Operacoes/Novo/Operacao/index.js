import { TableCell, TableRow } from '@mui/material';
import React, { useState } from 'react';
import { useCallback } from 'react';

import Input from '../../../../../../components/ui/Input';
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
    const [gerenciamento, setGerenciamento] = useState(props.linhaOperacao.gerenciamento.value);
    const [op, setOp] = useState(props.linhaOperacao.op.value);
    const [barra, setBarra] = useState(props.linhaOperacao.barra.value);
    const [vol, setVol] = useState(props.linhaOperacao.vol.value);
    const [cts, setCts] = useState(props.linhaOperacao.cts.value);
    const [escalada, setEscalada] = useState(props.linhaOperacao.escalada.value);
    const [result, setResult] = useState(props.linhaOperacao.result.value);
    const [cenario, setCenario] = useState(props.linhaOperacao.cenario.value);
    const [observacoes, setObservacoes] = useState(props.linhaOperacao.observacoes.value);
    const [erro, setErro] = useState(props.linhaOperacao.erro.value);

    /***********
     * HANDLERS
     ***********/
    const handleDateChange = useCallback((e) => {
        setDate(e.target.value);
    }, []);

    const handleAtivoChange = useCallback((e) => {
        setAtivo(e.target.value);
    }, []);

    const handleOpChange = useCallback((e) => {
        setOp(e.target.value);
    }, []);

    const handleBarraChange = useCallback((e) => {
        setBarra(e.target.value);
    }, []);

    const handleVolChange = useCallback((e) => {
        setVol(e.target.value);
    }, []);

    const handleCtsChange = useCallback((e) => {
        setCts(e.target.value);
    }, []);

    const handleEscaladaChange = useCallback((e) => {
        setEscalada(e.target.value);
    }, []);

    const handleResultChange = useCallback((e) => {
        setResult(e.target.value);
    }, []);

    const handleCenarioChange = useCallback((e) => {
        setCenario(e.target.value);
    }, []);

    const handleObservacoesChange = useCallback((e) => {
        setObservacoes(e.target.value);
    }, []);

    const handleErroChange = useCallback((e) => {
        setErro(e.target.value);
    }, []);

    return props.isBacktest ? (
        <></>
    ) : (
        <TableRow>
            <TableCell className={styles.table_cell__date}>
                <Input
                    extraClasses={['inputSize__small']}
                    id={`${props.linhaOperacao.linha_id}__date`}
                    value={date}
                    onChange={handleDateChange}
                    disabled={props.linhaOperacao.date.disabled}
                />
            </TableCell>
            <TableCell>
                <Input
                    extraClasses={['textAlign__center', 'inputSize__small']}
                    id={`${props.linhaOperacao.linha_id}__ativo`}
                    value={ativo}
                    onChange={handleAtivoChange}
                    disabled={props.linhaOperacao.ativo.disabled}
                />
            </TableCell>
            <TableCell>
                <Input
                    extraClasses={['textAlign__center', 'inputSize__small']}
                    id={`${props.linhaOperacao.linha_id}__gerenciamento`}
                    value={gerenciamento}
                    disabled={props.linhaOperacao.gerenciamento.disabled}
                />
            </TableCell>
            <TableCell>
                <Input
                    extraClasses={['textAlign__center', 'inputSize__small']}
                    id={`${props.linhaOperacao.linha_id}__op`}
                    value={op}
                    onChange={handleOpChange}
                    disabled={props.linhaOperacao.op.disabled}
                />
            </TableCell>
            <TableCell>
                <Input
                    extraClasses={['textAlign__center', 'inputSize__small']}
                    id={`${props.linhaOperacao.linha_id}__barra`}
                    value={barra}
                    onChange={handleBarraChange}
                    disabled={props.linhaOperacao.barra.disabled}
                />
            </TableCell>
            <TableCell>
                <Input
                    extraClasses={['textAlign__center', 'inputSize__small']}
                    id={`${props.linhaOperacao.linha_id}__vol`}
                    value={vol}
                    onChange={handleVolChange}
                    disabled={props.linhaOperacao.vol.disabled}
                />
            </TableCell>
            <TableCell>
                <Input
                    extraClasses={['textAlign__center', 'inputSize__small']}
                    id={`${props.linhaOperacao.linha_id}__cts`}
                    value={cts}
                    onChange={handleCtsChange}
                    disabled={props.linhaOperacao.cts.disabled}
                />
            </TableCell>
            <TableCell>
                <Input
                    extraClasses={['textAlign__center', 'inputSize__small']}
                    id={`${props.linhaOperacao.linha_id}__escalada`}
                    value={escalada}
                    onChange={handleEscaladaChange}
                    disabled={props.linhaOperacao.escalada.disabled}
                />
            </TableCell>
            <TableCell>
                <Input
                    extraClasses={['textAlign__center', 'inputSize__small']}
                    id={`${props.linhaOperacao.linha_id}__result`}
                    value={result}
                    onChange={handleResultChange}
                    disabled={props.linhaOperacao.result.disabled}
                />
            </TableCell>
            <TableCell>
                <Input
                    extraClasses={['textAlign__center', 'inputSize__small']}
                    id={`${props.linhaOperacao.linha_id}__cenario`}
                    value={cenario}
                    onChange={handleCenarioChange}
                    disabled={props.linhaOperacao.cenario.disabled}
                />
            </TableCell>
            <TableCell>
                <Input
                    extraClasses={['textAlign__center', 'inputSize__small']}
                    id={`${props.linhaOperacao.linha_id}__observacoes`}
                    value={observacoes}
                    onChange={handleObservacoesChange}
                    disabled={props.linhaOperacao.observacoes.disabled}
                />
            </TableCell>
            <TableCell>
                <Input
                    extraClasses={['textAlign__center', 'inputSize__small']}
                    id={`${props.linhaOperacao.linha_id}__erro`}
                    value={erro}
                    onChange={handleErroChange}
                    disabled={props.linhaOperacao.erro.disabled}
                />
            </TableCell>
        </TableRow>
    );
};

export default Operacao;
