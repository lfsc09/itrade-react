///////////////////////////////////////////////////////////////////////////////////////////////////
// FUNÇÕES USADAS PARA GERAÇÃO DE ESTATISTICAS DO RENDA VARIAVEL
//
///////////////////////////////////////////////////////////////////////////////////////////////////
import { format, getDay, getISOWeek, getMonth, parseISO, startOfHour } from 'date-fns';

import { BBollinger, desvpad, divide, generateHash, isObjectEmpty, SMA } from './global';

/*
    Compara duas datas ou dois horarios, retornando:
        1: v1 > v2
        0: v1 = v2
        -1: v1 < v2
*/
const compareDate_Time = (v1, v2, method = 'date') => {
    if (method === 'date') {
        let e_v2 = v2.split('/');
        v1 = new Date(`${v1}`);
        v2 = new Date(`${e_v2[2]}-${e_v2[1]}-${e_v2[0]}`);
    } else if (method === 'time') {
        v1 = new Date(`2000-01-01 ${v1}`);
        v2 = new Date(`2000-01-01 ${v2}`);
    }
    if (v1 > v2) return 1;
    else if (v1 < v2) return -1;
    else return 0;
};

/*
    Busca observações do cenario passado na lista de observações dos filtros.
*/
const checkObservacoes = (opCenario, opObs, filter_cenarios, method = 'AND') => {
    // Verifica se o cenario está nos filtros
    if (opCenario in filter_cenarios) {
        // Verifica se há observações escolhidas nos filtros do cenario
        if (!isObjectEmpty(filter_cenarios[opCenario]['observacoes'])) {
            let opObs__Array = opObs.split(',');
            // A operação deve ter pelo menos um dos filtros escolhidos
            if (method === 'OR') {
                for (let ref in filter_cenarios[opCenario]['observacoes']) {
                    // Operações que TENHAM a observação
                    if (!filter_cenarios[opCenario]['observacoes'][ref]) {
                        if (opObs__Array.includes(ref)) return true;
                    }
                    // Operações que NÃO TENHAM a observação
                    else if (filter_cenarios[opCenario]['observacoes'][ref]) {
                        if (!opObs__Array.includes(ref)) return true;
                    }
                }
                return false;
            }
            // A operação deve ter todos os filtros escolhidos
            if (method === 'AND') {
                for (let ref in filter_cenarios[opCenario]['observacoes']) {
                    // Operações que TENHAM a observação
                    if (!filter_cenarios[opCenario]['observacoes'][ref]) {
                        if (!opObs__Array.includes(ref)) return false;
                    }
                    // Operações que NÃO TENHAM a observação
                    else if (filter_cenarios[opCenario]['observacoes'][ref]) {
                        if (opObs__Array.includes(ref)) return false;
                    }
                }
            }
        }
    }
    return true;
};

/*
    Calcula a quantidade de Cts, baseado no 'tipo_cts' passado.
*/
const findCts_toUse = (opCts, simulation) => {
    // Usar Cts da operação
    if (simulation.tipo_cts === 1 || (simulation.tipo_cts === 2 && simulation.cts === null)) return opCts;
    // Força uma quantidade fixa passada em 'simulation.cts'
    else if (simulation.tipo_cts === 2 && simulation.cts !== null) return simulation.cts;
};

/*
    Aplica os 'filters' na operacao passada.
*/
const okToUse_filterOp = (op, filters, simulation) => {
    // Filtra a data com a data inicial
    if (filters.data_inicial !== null && compareDate_Time(op.data, filters.data_inicial, 'date') === -1) return false;
    // Filtra a data com a data final
    if (filters.data_final !== null && compareDate_Time(op.data, filters.data_final, 'date') === 1) return false;
    // Filtra a hora com a hora inicial
    if (filters.hora_inicial !== null && compareDate_Time(op.hora, filters.hora_inicial, 'time') === -1) return false;
    // Filtra a hora com a hora final
    if (filters.hora_final !== null && compareDate_Time(op.hora, filters.hora_final, 'time') === 1) return false;
    // Filtra apenas os ativos selecionados
    if (filters.ativo.length > 0 && !filters.ativo.includes(op.ativo)) return false;
    // Filtra apenas os gerenciamentos selecionados
    if (filters.gerenciamento !== null && filters.gerenciamento !== op.gerenciamento) return false;
    // Filtra apenas os cenarios selecionados
    if (!isObjectEmpty(filters.cenario) && !(op.cenario in filters.cenario)) return false;
    // Filtra apenas as observações selecionadas dos cenarios
    if (!checkObservacoes(op.cenario, op.observacoes, filters.cenario, filters.observacoes_query_union)) return false;
    // Filtra operações com Erro
    if (simulation.ignora_erro && op.erro === 1) return false;
    return true;
};

/*
    Realiza os calculos de 'tipo_parada', para aplicar os filtros.
*/
const checkTipo_Paradas = (stop_tipo_parada, resultLiquido_operacao, simulation) => {
    ///////////////////////////////////////////////////////////////////////////////////
    // Verifica se a operação pode ser executada dados os tipos de parada 'Na Semana'
    ///////////////////////////////////////////////////////////////////////////////////
    for (let tp_value in stop_tipo_parada['sem'].tipo_parada) {
        // Parada N dias Stop (Cheio)
        if (tp_value === 'ss1') {
            if (stop_tipo_parada['sem']['tipo_parada'][tp_value].current >= stop_tipo_parada['sem']['tipo_parada'][tp_value].max) return false;
        }
        // Parada N dias Gain (Cheio)
        else if (tp_value === 'gs1') {
            if (stop_tipo_parada['sem']['tipo_parada'][tp_value].current >= stop_tipo_parada['sem']['tipo_parada'][tp_value].max) return false;
        }
        // Parada N dias Stop (Total)
        else if (tp_value === 'ss2') {
            if (stop_tipo_parada['sem']['tipo_parada'][tp_value].current < stop_tipo_parada['sem']['tipo_parada'][tp_value].max) {
                if (stop_tipo_parada['sem']['tipo_parada'][tp_value]['dia'].condicao !== stop_tipo_parada['dia'].condicao) {
                    if (stop_tipo_parada['sem']['tipo_parada'][tp_value]['dia'].current < 0) {
                        stop_tipo_parada['sem']['tipo_parada'][tp_value].current += 1;
                        if (stop_tipo_parada['sem']['tipo_parada'][tp_value].current >= stop_tipo_parada['sem']['tipo_parada'][tp_value].max) return false;
                    }
                    stop_tipo_parada['sem']['tipo_parada'][tp_value]['dia'].current = 0.0;
                    stop_tipo_parada['sem']['tipo_parada'][tp_value]['dia'].condicao = stop_tipo_parada['dia'].condicao;
                }
                stop_tipo_parada['sem']['tipo_parada'][tp_value]['dia'].current += resultLiquido_operacao;
            } else return false;
        }
        // Parada N dias Gain (Total)
        else if (tp_value === 'gs2') {
            if (stop_tipo_parada['sem']['tipo_parada'][tp_value].current < stop_tipo_parada['sem']['tipo_parada'][tp_value].max) {
                if (stop_tipo_parada['sem']['tipo_parada'][tp_value]['dia'].condicao !== stop_tipo_parada['dia'].condicao) {
                    if (stop_tipo_parada['sem']['tipo_parada'][tp_value]['dia'].current > 0) {
                        stop_tipo_parada['sem']['tipo_parada'][tp_value].current += 1;
                        if (stop_tipo_parada['sem']['tipo_parada'][tp_value].current >= stop_tipo_parada['sem']['tipo_parada'][tp_value].max) return false;
                    }
                    stop_tipo_parada['sem']['tipo_parada'][tp_value]['dia'].current = 0.0;
                    stop_tipo_parada['sem']['tipo_parada'][tp_value]['dia'].condicao = stop_tipo_parada['dia'].condicao;
                }
                stop_tipo_parada['sem']['tipo_parada'][tp_value]['dia'].current += resultLiquido_operacao;
            } else return false;
        }
        // Parada N dias Stop (Sequencia)
        else if (tp_value === 'ss3') {
            if (stop_tipo_parada['sem']['tipo_parada'][tp_value].current < stop_tipo_parada['sem']['tipo_parada'][tp_value].max) {
                if (stop_tipo_parada['sem']['tipo_parada'][tp_value]['dia'].condicao !== stop_tipo_parada['dia'].condicao) {
                    // Se o dia foi negativo
                    if (stop_tipo_parada['sem']['tipo_parada'][tp_value]['dia'].current < 0) {
                        stop_tipo_parada['sem']['tipo_parada'][tp_value].current += 1;
                        if (stop_tipo_parada['sem']['tipo_parada'][tp_value].current >= stop_tipo_parada['sem']['tipo_parada'][tp_value].max) return false;
                    }
                    // Zera apenas com dias positivos, Empates não contam
                    else if (stop_tipo_parada['sem']['tipo_parada'][tp_value]['dia'].current > 0) stop_tipo_parada['sem']['tipo_parada'][tp_value].current = 0;
                    stop_tipo_parada['sem']['tipo_parada'][tp_value]['dia'].current = 0.0;
                    stop_tipo_parada['sem']['tipo_parada'][tp_value]['dia'].condicao = stop_tipo_parada['dia'].condicao;
                }
                stop_tipo_parada['sem']['tipo_parada'][tp_value]['dia'].current += resultLiquido_operacao;
            } else return false;
        }
        // Parada N dias Gain (Sequencia)
        else if (tp_value === 'gs3') {
            if (stop_tipo_parada['sem']['tipo_parada'][tp_value].current < stop_tipo_parada['sem']['tipo_parada'][tp_value].max) {
                if (stop_tipo_parada['sem']['tipo_parada'][tp_value]['dia'].condicao !== stop_tipo_parada['dia'].condicao) {
                    // Se o dia foi positivo
                    if (stop_tipo_parada['sem']['tipo_parada'][tp_value]['dia'].current > 0) {
                        stop_tipo_parada['sem']['tipo_parada'][tp_value].current += 1;
                        if (stop_tipo_parada['sem']['tipo_parada'][tp_value].current >= stop_tipo_parada['sem']['tipo_parada'][tp_value].max) return false;
                    }
                    // Zera apenas com dias negativos, Empates não contam
                    else if (stop_tipo_parada['sem']['tipo_parada'][tp_value]['dia'].current < 0) stop_tipo_parada['sem']['tipo_parada'][tp_value].current = 0;
                    stop_tipo_parada['sem']['tipo_parada'][tp_value]['dia'].current = 0.0;
                    stop_tipo_parada['sem']['tipo_parada'][tp_value]['dia'].condicao = stop_tipo_parada['dia'].condicao;
                }
                stop_tipo_parada['sem']['tipo_parada'][tp_value]['dia'].current += resultLiquido_operacao;
            } else return false;
        }
    }
    ////////////////////////////////////////////////////////////////////////////////
    // Verifica se a operação pode ser executada dados os tipos de parada 'No Dia'
    ////////////////////////////////////////////////////////////////////////////////
    for (let tp_value in stop_tipo_parada['dia'].tipo_parada) {
        // Parada N Stops (Total)
        if (tp_value === 'sd1') {
            if (stop_tipo_parada['dia']['tipo_parada'][tp_value].current < stop_tipo_parada['dia']['tipo_parada'][tp_value].max) {
                // Se for um Stop
                if (resultLiquido_operacao < 0) stop_tipo_parada['dia']['tipo_parada'][tp_value].current += 1;
                // Atualiza o 'ss1' os dias com stop cheio
                if ('ss1' in stop_tipo_parada['sem']['tipo_parada']) {
                    // Se caso atingiu o limite diario, atualiza as paradas semanais
                    if (stop_tipo_parada['dia']['tipo_parada'][tp_value].current >= stop_tipo_parada['dia']['tipo_parada'][tp_value].max) {
                        if (stop_tipo_parada['sem']['tipo_parada']['ss1']['dia'].condicao !== stop_tipo_parada['dia'].condicao) {
                            stop_tipo_parada['sem']['tipo_parada']['ss1']['dia'].condicao = stop_tipo_parada['dia'].condicao;
                            stop_tipo_parada['sem']['tipo_parada']['ss1'].current += 1;
                        }
                    }
                }
            }
            // Foi atingido o limite diário
            else return false;
        }
        // Parada N Gain (Total)
        else if (tp_value === 'gd1') {
            if (stop_tipo_parada['dia']['tipo_parada'][tp_value].current < stop_tipo_parada['dia']['tipo_parada'][tp_value].max) {
                // Se for um Gain
                if (resultLiquido_operacao > 0) stop_tipo_parada['dia']['tipo_parada'][tp_value].current += 1;
                // Atualiza o 'gs1' os dias com gain cheio
                if ('gs1' in stop_tipo_parada['sem']['tipo_parada']) {
                    // Se caso atingiu o limite diario, atualiza as paradas semanais
                    if (stop_tipo_parada['dia']['tipo_parada'][tp_value].current >= stop_tipo_parada['dia']['tipo_parada'][tp_value].max) {
                        if (stop_tipo_parada['sem']['tipo_parada']['gs1']['dia'].condicao !== stop_tipo_parada['dia'].condicao) {
                            stop_tipo_parada['sem']['tipo_parada']['gs1']['dia'].condicao = stop_tipo_parada['dia'].condicao;
                            stop_tipo_parada['sem']['tipo_parada']['gs1'].current += 1;
                        }
                    }
                }
            }
            // Foi atingido o limite diário
            else return false;
        }
        // Parada N Stops (Sequencia)
        else if (tp_value === 'sd2') {
            if (stop_tipo_parada['dia']['tipo_parada'][tp_value].current < stop_tipo_parada['dia']['tipo_parada'][tp_value].max) {
                // Se for um Stop
                if (resultLiquido_operacao < 0) stop_tipo_parada['dia']['tipo_parada'][tp_value].current += 1;
                // Zera apenas com Gain, Empates não contam
                else if (resultLiquido_operacao > 0) stop_tipo_parada['dia']['tipo_parada'][tp_value].current = 0;
                // Atualiza o 'ss1' os dias com stop cheio
                if ('ss1' in stop_tipo_parada['sem']['tipo_parada']) {
                    // Se caso atingiu o limite diario, atualiza as paradas semanais
                    if (stop_tipo_parada['dia']['tipo_parada'][tp_value].current >= stop_tipo_parada['dia']['tipo_parada'][tp_value].max) {
                        if (stop_tipo_parada['sem']['tipo_parada']['ss1']['dia'].condicao !== stop_tipo_parada['dia'].condicao) {
                            stop_tipo_parada['sem']['tipo_parada']['ss1']['dia'].condicao = stop_tipo_parada['dia'].condicao;
                            stop_tipo_parada['sem']['tipo_parada']['ss1'].current += 1;
                        }
                    }
                }
            }
            // Foi atingido o limite diário
            else return false;
        }
        // Parada N Gains (Sequencia)
        else if (tp_value === 'gd2') {
            if (stop_tipo_parada['dia']['tipo_parada'][tp_value].current < stop_tipo_parada['dia']['tipo_parada'][tp_value].max) {
                // Se for um Gain
                if (resultLiquido_operacao > 0) stop_tipo_parada['dia']['tipo_parada'][tp_value].current += 1;
                // Zera apenas com Stop, Empates não contam
                else if (resultLiquido_operacao < 0) stop_tipo_parada['dia']['tipo_parada'][tp_value].current = 0;
                // Atualiza o 'gs1' os dias com gain cheio
                if ('gs1' in stop_tipo_parada['sem']['tipo_parada']) {
                    // Se caso atingiu o limite diario, atualiza as paradas semanais
                    if (stop_tipo_parada['dia']['tipo_parada'][tp_value].current >= stop_tipo_parada['dia']['tipo_parada'][tp_value].max) {
                        if (stop_tipo_parada['sem']['tipo_parada']['gs1']['dia'].condicao !== stop_tipo_parada['dia'].condicao) {
                            stop_tipo_parada['sem']['tipo_parada']['gs1']['dia'].condicao = stop_tipo_parada['dia'].condicao;
                            stop_tipo_parada['sem']['tipo_parada']['gs1'].current += 1;
                        }
                    }
                }
            }
            // Foi atingido o limite diário
            else return false;
        }
        // Parada X Valor no Negativo
        else if (tp_value === 'sd3') {
            if (stop_tipo_parada['dia']['tipo_parada'][tp_value].current > stop_tipo_parada['dia']['tipo_parada'][tp_value].max * -1) {
                stop_tipo_parada['dia']['tipo_parada'][tp_value].current += resultLiquido_operacao;
                // Atualiza o 'ss1' os dias com stop cheio
                if ('ss1' in stop_tipo_parada['sem']['tipo_parada']) {
                    // Se caso atingiu o limite diario, atualiza as paradas semanais
                    if (stop_tipo_parada['dia']['tipo_parada'][tp_value].current <= stop_tipo_parada['dia']['tipo_parada'][tp_value].max * -1) {
                        if (stop_tipo_parada['sem']['tipo_parada']['ss1']['dia'].condicao !== stop_tipo_parada['dia'].condicao) {
                            stop_tipo_parada['sem']['tipo_parada']['ss1']['dia'].condicao = stop_tipo_parada['dia'].condicao;
                            stop_tipo_parada['sem']['tipo_parada']['ss1'].current += 1;
                        }
                    }
                }
            }
            // Foi atingido o limite diário
            else return false;
        }
        // Parada X Valor no Positivo
        else if (tp_value === 'gd3') {
            if (stop_tipo_parada['dia']['tipo_parada'][tp_value].current < stop_tipo_parada['dia']['tipo_parada'][tp_value].max) {
                stop_tipo_parada['dia']['tipo_parada'][tp_value].current += resultLiquido_operacao;
                // Atualiza o 'gs1' os dias com gain cheio
                if ('gs1' in stop_tipo_parada['sem']['tipo_parada']) {
                    // Se caso atingiu o limite diario, atualiza as paradas semanais
                    if (stop_tipo_parada['dia']['tipo_parada'][tp_value].current >= stop_tipo_parada['dia']['tipo_parada'][tp_value].max) {
                        if (stop_tipo_parada['sem']['tipo_parada']['gs1']['dia'].condicao !== stop_tipo_parada['dia'].condicao) {
                            stop_tipo_parada['sem']['tipo_parada']['gs1']['dia'].condicao = stop_tipo_parada['dia'].condicao;
                            stop_tipo_parada['sem']['tipo_parada']['gs1'].current += 1;
                        }
                    }
                }
            }
            // Foi atingido o limite diário
            else return false;
        }
        // Parada X Valor de Perda Bruta
        else if (tp_value === 'sd4') {
            if (stop_tipo_parada['dia']['tipo_parada'][tp_value].current > stop_tipo_parada['dia']['tipo_parada'][tp_value].max * -1) {
                // Se for um Stop
                if (resultLiquido_operacao < 0) stop_tipo_parada['dia']['tipo_parada'][tp_value].current += resultLiquido_operacao;
                // Atualiza o 'ss1' os dias com stop cheio
                if ('ss1' in stop_tipo_parada['sem']['tipo_parada']) {
                    // Se caso atingiu o limite diario, atualiza as paradas semanais
                    if (stop_tipo_parada['dia']['tipo_parada'][tp_value].current <= stop_tipo_parada['dia']['tipo_parada'][tp_value].max * -1) {
                        if (stop_tipo_parada['sem']['tipo_parada']['ss1']['dia'].condicao !== stop_tipo_parada['dia'].condicao) {
                            stop_tipo_parada['sem']['tipo_parada']['ss1']['dia'].condicao = stop_tipo_parada['dia'].condicao;
                            stop_tipo_parada['sem']['tipo_parada']['ss1'].current += 1;
                        }
                    }
                }
            }
            // Foi atingido o limite diário
            else return false;
        }
        // Parada X Valor de Ganho Bruta
        else if (tp_value === 'gd4') {
            if (stop_tipo_parada['dia']['tipo_parada'][tp_value].current > stop_tipo_parada['dia']['tipo_parada'][tp_value].max * -1) {
                // Se for um Gain
                if (resultLiquido_operacao > 0) stop_tipo_parada['dia']['tipo_parada'][tp_value].current += resultLiquido_operacao;
                // Atualiza o 'gs1' os dias com gain cheio
                if ('gs1' in stop_tipo_parada['sem']['tipo_parada']) {
                    // Se caso atingiu o limite diario, atualiza as paradas semanais
                    if (stop_tipo_parada['dia']['tipo_parada'][tp_value].current >= stop_tipo_parada['dia']['tipo_parada'][tp_value].max) {
                        if (stop_tipo_parada['sem']['tipo_parada']['gs1']['dia'].condicao !== stop_tipo_parada['dia'].condicao) {
                            stop_tipo_parada['sem']['tipo_parada']['gs1']['dia'].condicao = stop_tipo_parada['dia'].condicao;
                            stop_tipo_parada['sem']['tipo_parada']['gs1'].current += 1;
                        }
                    }
                }
            }
            // Foi atingido o limite diário
            else return false;
        }
        // Parada X R's no Negativo
        else if (tp_value === 'sd5' && simulation.R !== null) {
            if (stop_tipo_parada['dia']['tipo_parada'][tp_value].current > stop_tipo_parada['dia']['tipo_parada'][tp_value].max * simulation.R * -1) {
                stop_tipo_parada['dia']['tipo_parada'][tp_value].current += resultLiquido_operacao;
                // Atualiza o 'ss1' os dias com stop cheio
                if ('ss1' in stop_tipo_parada['sem']['tipo_parada']) {
                    // Se caso atingiu o limite diario, atualiza as paradas semanais
                    if (stop_tipo_parada['dia']['tipo_parada'][tp_value].current <= stop_tipo_parada['dia']['tipo_parada'][tp_value].max * simulation.R * -1) {
                        if (stop_tipo_parada['sem']['tipo_parada']['ss1']['dia'].condicao !== stop_tipo_parada['dia'].condicao) {
                            stop_tipo_parada['sem']['tipo_parada']['ss1']['dia'].condicao = stop_tipo_parada['dia'].condicao;
                            stop_tipo_parada['sem']['tipo_parada']['ss1'].current += 1;
                        }
                    }
                }
            }
            // Foi atingido o limite diário
            else return false;
        }
        // Parada X R's no Positivo
        else if (tp_value === 'gd5' && simulation.R !== null) {
            if (stop_tipo_parada['dia']['tipo_parada'][tp_value].current < stop_tipo_parada['dia']['tipo_parada'][tp_value].max * simulation.R) {
                stop_tipo_parada['dia']['tipo_parada'][tp_value].current += resultLiquido_operacao;
                // Atualiza o 'gs1' os dias com gain cheio
                if ('gs1' in stop_tipo_parada['sem']['tipo_parada']) {
                    // Se caso atingiu o limite diario, atualiza as paradas semanais
                    if (stop_tipo_parada['dia']['tipo_parada'][tp_value].current >= stop_tipo_parada['dia']['tipo_parada'][tp_value].max * simulation.R) {
                        if (stop_tipo_parada['sem']['tipo_parada']['gs1']['dia'].condicao !== stop_tipo_parada['dia'].condicao) {
                            stop_tipo_parada['sem']['tipo_parada']['gs1']['dia'].condicao = stop_tipo_parada['dia'].condicao;
                            stop_tipo_parada['sem']['tipo_parada']['gs1'].current += 1;
                        }
                    }
                }
            }
            // Foi atingido o limite diário
            else return false;
        }
        // Parada X R's de Perda Bruta
        else if (tp_value === 'sd6' && simulation.R !== null) {
            if (stop_tipo_parada['dia']['tipo_parada'][tp_value].current > stop_tipo_parada['dia']['tipo_parada'][tp_value].max * simulation.R * -1) {
                // Se for um Stop
                if (resultLiquido_operacao < 0) stop_tipo_parada['dia']['tipo_parada'][tp_value].current += resultLiquido_operacao;
                // Atualiza o 'ss1' os dias com stop cheio
                if ('ss1' in stop_tipo_parada['sem']['tipo_parada']) {
                    // Se caso atingiu o limite diario, atualiza as paradas semanais
                    if (stop_tipo_parada['dia']['tipo_parada'][tp_value].current <= stop_tipo_parada['dia']['tipo_parada'][tp_value].max * simulation.R * -1) {
                        if (stop_tipo_parada['sem']['tipo_parada']['ss1']['dia'].condicao !== stop_tipo_parada['dia'].condicao) {
                            stop_tipo_parada['sem']['tipo_parada']['ss1']['dia'].condicao = stop_tipo_parada['dia'].condicao;
                            stop_tipo_parada['sem']['tipo_parada']['ss1'].current += 1;
                        }
                    }
                }
            }
            // Foi atingido o limite diário
            else return false;
        }
        // Parada X R's de Ganho Bruto
        else if (tp_value === 'gd6' && simulation.R !== null) {
            if (stop_tipo_parada['dia']['tipo_parada'][tp_value].current < stop_tipo_parada['dia']['tipo_parada'][tp_value].max * simulation.R) {
                // Se for um Gain
                if (resultLiquido_operacao > 0) stop_tipo_parada['dia']['tipo_parada'][tp_value].current += resultLiquido_operacao;
                // Atualiza o 'gs1' os dias com gain cheio
                if ('gs1' in stop_tipo_parada['sem']['tipo_parada']) {
                    // Se caso atingiu o limite diario, atualiza as paradas semanais
                    if (stop_tipo_parada['dia']['tipo_parada'][tp_value].current >= stop_tipo_parada['dia']['tipo_parada'][tp_value].max * simulation.R) {
                        if (stop_tipo_parada['sem']['tipo_parada']['gs1']['dia'].condicao !== stop_tipo_parada['dia'].condicao) {
                            stop_tipo_parada['sem']['tipo_parada']['gs1']['dia'].condicao = stop_tipo_parada['dia'].condicao;
                            stop_tipo_parada['sem']['tipo_parada']['gs1'].current += 1;
                        }
                    }
                }
            }
            // Foi atingido o limite diário
            else return false;
        }
    }
    return true;
};

/*
    Recebe a lista de operações (Por Trade), e agrupa dependendo do escolhido. (Por Trade 'Default', Por Dia, Por Mes)
    Já calcula as informações de resultado necessárias.
*/
const groupData_byPeriodo = (ops, filters, simulation, options = {}) => {
    let new_list = [],
        stop_tipo_parada = {
            dia: { condicao: null, tipo_parada: {} },
            sem: { condicao: null, tipo_parada: {} },
        };
    ///////////////////////
    // Mantem 'por Trade'
    ///////////////////////
    if (simulation.periodo_calc === 1) {
        for (let e in ops) {
            let op_resultBruto_Unitario = calculate_op_result(ops[e]);
            // Roda os 'filters' na operação
            if (okToUse_filterOp(ops[e], filters, simulation)) {
                let current_month_year = ops[e].data.split('-'),
                    current_week_year = getISOWeek(parseISO(ops[e].data));
                current_week_year = `${current_month_year[0]}-${current_week_year}`;
                current_month_year = `${current_month_year[0]}-${current_month_year[1]}`;
                // Inicia a condição do Tipo Parada (No Dia)
                if (stop_tipo_parada['dia'].condicao !== ops[e].data) {
                    stop_tipo_parada['dia']['condicao'] = ops[e].data;
                    for (let tp = 0; tp < simulation['tipo_parada'].length; tp++) {
                        // Busca apenas os 'tipo_parada' de 'No Dia'
                        if (/[sg]d[1-9]/.test(simulation['tipo_parada'][tp]['tipo_parada'])) {
                            stop_tipo_parada['dia']['tipo_parada'][simulation['tipo_parada'][tp].tipo_parada] = {
                                current: 0.0,
                                max: parseFloat(simulation['tipo_parada'][tp].valor_parada),
                            };
                        }
                    }
                }
                // Inicia a condição do Tipo Parada (Na Semana)
                if (stop_tipo_parada['sem'].condicao !== current_week_year) {
                    stop_tipo_parada['sem']['condicao'] = current_week_year;
                    for (let tp = 0; tp < simulation['tipo_parada'].length; tp++) {
                        // Busca apenas os 'tipo_parada' de 'Na Semana'
                        if (/[sg]s[1-9]/.test(simulation['tipo_parada'][tp]['tipo_parada'])) {
                            stop_tipo_parada['sem']['tipo_parada'][simulation['tipo_parada'][tp].tipo_parada] = {
                                dia: { condicao: null, current: 0.0 },
                                current: 0.0,
                                max: parseFloat(simulation['tipo_parada'][tp].valor_parada),
                            };
                        }
                    }
                }
                // Calcula o resultado bruto da operação com apenas 1 contrato
                // Calcula o numero de contratos a ser usado dependendo do 'simulation'
                let cts_usado = findCts_toUse(ops[e].cts, simulation);
                // Calcula o resultado bruto aplicando o numero de contratos
                let resultBruto_operacao = op_resultBruto_Unitario['result'].brl * cts_usado;
                // Usa o custo da operação a ser aplicada no resultado 'Resultado Líquido'
                let custo_operacao = simulation.usa_custo ? cts_usado * ops[e].ativo_custo : 0.0;
                // Calcula o resultado liquido aplicando os custos
                let resultLiquido_operacao = resultBruto_operacao - custo_operacao;
                if (checkTipo_Paradas(stop_tipo_parada, resultLiquido_operacao, simulation)) {
                    if ('only_FilterOps' in options && options.only_FilterOps) {
                        new_list.push({
                            id: ops[e].id,
                            sequencia: ops[e].sequencia,
                            gerenciamento: ops[e].gerenciamento,
                            data: ops[e].data,
                            hora: ops[e].hora,
                            ativo: ops[e].ativo,
                            op: ops[e].op,
                            cts: cts_usado,
                            retornoRisco: ops[e].retorno_risco,
                            erro: ops[e].erro,
                            cenario: ops[e].cenario,
                            observacoes: ops[e].observacoes,
                            resultado: resultBruto_operacao,
                            ativo_custo: ops[e].ativo_custo,
                            ativo_valor_tick: ops[e].ativo_valor_tick,
                            ativo_pts_tick: ops[e].ativo_pts_tick,
                        });
                    } else {
                        new_list.push({
                            id: ops[e].id,
                            data: ops[e].data,
                            hora: ops[e].hora,
                            cenario: ops[e].cenario,
                            op: ops[e].op,
                            erro: ops[e].erro,
                            cts_usado: cts_usado,
                            retornoRisco: ops[e].retorno_risco,
                            custo: custo_operacao,
                            observacoes: ops[e].observacoes,
                            resultado_op: resultLiquido_operacao > 0 ? 1 : resultLiquido_operacao < 0 ? -1 : 0,
                            result_bruto: {
                                brl: resultBruto_operacao,
                                R: simulation.R !== null ? divide(resultBruto_operacao, simulation.R) : '--',
                            },
                            result_liquido: {
                                brl: resultLiquido_operacao,
                                R: simulation.R !== null ? divide(resultLiquido_operacao, simulation.R) : '--',
                            },
                        });
                    }
                }
            }
        }
    }
    ////////////////////
    // Agrupa 'por Dia'
    ////////////////////
    else if (simulation.periodo_calc === 2) {
        let day_used = null,
            index = -1;
        for (let e in ops) {
            let op_resultBruto_Unitario = calculate_op_result(ops[e]);
            // Roda os 'filters' na operação
            if (okToUse_filterOp(ops[e], filters, simulation)) {
                let current_month_year = ops[e].data.split('-'),
                    current_week_year = getISOWeek(parseISO(ops[e].data));
                current_week_year = `${current_month_year[0]}-${current_week_year}`;
                current_month_year = `${current_month_year[0]}-${current_month_year[1]}`;
                // Inicia a condição do Tipo Parada (No Dia)
                if (stop_tipo_parada['dia'].condicao !== ops[e].data) {
                    stop_tipo_parada['dia']['condicao'] = ops[e].data;
                    for (let tp = 0; tp < simulation['tipo_parada'].length; tp++) {
                        // Busca apenas os 'tipo_parada' de 'No Dia'
                        if (simulation['tipo_parada'][tp].tipo_parada.includes('d')) {
                            stop_tipo_parada['dia']['tipo_parada'][simulation['tipo_parada'][tp].tipo_parada] = {
                                current: 0.0,
                                max: parseFloat(simulation['tipo_parada'][tp].valor_parada),
                            };
                        }
                    }
                }
                // Inicia a condição do Tipo Parada (Na Semana)
                if (stop_tipo_parada['sem'].condicao !== current_week_year) {
                    stop_tipo_parada['sem']['condicao'] = current_week_year;
                    for (let tp = 0; tp < simulation['tipo_parada'].length; tp++) {
                        // Busca apenas os 'tipo_parada' de 'Na Semana'
                        if (simulation['tipo_parada'][tp].tipo_parada.includes('s')) {
                            stop_tipo_parada['sem']['tipo_parada'][simulation['tipo_parada'][tp].tipo_parada] = {
                                dia: { condicao: null, current: 0.0 },
                                current: 0.0,
                                max: parseFloat(simulation['tipo_parada'][tp].valor_parada),
                            };
                        }
                    }
                }
                // Calcula o resultado bruto da operação com apenas 1 contrato
                // Calcula o numero de contratos a ser usado dependendo do 'simulation'
                let cts_usado = findCts_toUse(ops[e].cts, simulation);
                // Calcula o resultado bruto aplicando o numero de contratos
                let resultBruto_operacao = op_resultBruto_Unitario['result'].brl * cts_usado;
                // Usa o custo da operação a ser aplicada no resultado 'Resultado Líquido'
                let custo_operacao = simulation.usa_custo ? cts_usado * ops[e].ativo_custo : 0.0;
                // Calcula o resultado liquido aplicando os custos
                let resultLiquido_operacao = resultBruto_operacao - custo_operacao;
                if (checkTipo_Paradas(stop_tipo_parada, resultLiquido_operacao, simulation)) {
                    // Guarda o dia sendo olhado
                    if (day_used !== ops[e].data) {
                        day_used = ops[e].data;
                        if (index > -1) new_list[index]['resultado_op'] = new_list[index]['result_liquido'].brl > 0 ? 1 : new_list[index]['result_liquido'].brl < 0 ? -1 : 0;
                        index++;
                    }
                    if (!(index in new_list)) {
                        new_list[index] = {
                            erro: ops[e].erro,
                            data: day_used,
                            qtd_trades: 1,
                            erro: ops[e].erro,
                            cts_usado: cts_usado,
                            custo: custo_operacao,
                            retornoRisco: ops[e].retorno_risco,
                            resultado_op: null,
                            lucro_bruto: {
                                brl: resultBruto_operacao > 0 ? resultBruto_operacao : 0.0,
                                R: simulation.R !== null ? (resultBruto_operacao > 0 ? divide(resultBruto_operacao, simulation.R) : 0.0) : '--',
                            },
                            prejuizo_bruto: {
                                brl: resultBruto_operacao < 0 ? resultBruto_operacao : 0.0,
                                R: simulation.R !== null ? (resultBruto_operacao < 0 ? divide(resultBruto_operacao, simulation.R) : 0.0) : '--',
                            },
                            result_bruto: {
                                brl: resultBruto_operacao,
                                R: simulation.R !== null ? divide(resultBruto_operacao, simulation.R) : '--',
                            },
                            result_liquido: {
                                brl: resultLiquido_operacao,
                                R: simulation.R !== null ? divide(resultLiquido_operacao, simulation.R) : '--',
                            },
                        };
                    } else {
                        new_list[index]['qtd_trades']++;
                        if (new_list[index]['erro'] === 0) new_list[index]['erro'] = ops[e].erro;
                        new_list[index]['cts_usado'] += cts_usado;
                        new_list[index]['custo'] += custo_operacao;
                        new_list[index]['retornoRisco'] += ops[e].retorno_risco;
                        new_list[index]['erro'] = new_list[index]['erro'] || ops[e].erro;
                        if (resultBruto_operacao > 0) {
                            new_list[index]['lucro_bruto']['brl'] += resultBruto_operacao;
                            if (simulation.R !== null) new_list[index]['lucro_bruto']['R'] += divide(resultBruto_operacao, simulation.R);
                        } else if (resultBruto_operacao < 0) {
                            new_list[index]['prejuizo_bruto']['brl'] += resultBruto_operacao;
                            if (simulation.R !== null) new_list[index]['prejuizo_bruto']['R'] += divide(resultBruto_operacao, simulation.R);
                        }
                        new_list[index]['result_bruto']['brl'] += resultBruto_operacao;
                        if (simulation.R !== null) new_list[index]['result_bruto']['R'] += divide(resultBruto_operacao, simulation.R);
                        new_list[index]['result_liquido']['brl'] += resultLiquido_operacao;
                        if (simulation.R !== null) new_list[index]['result_liquido']['R'] += divide(resultLiquido_operacao, simulation.R);
                    }
                }
            }
        }
        // Termina para o ultimo
        if (index > -1) {
            new_list[index]['resultado_op'] =
                new_list[index]['result_liquido']['brl'] > new_list[index]['custo'] ? 1 : new_list[index]['result_liquido']['brl'] < new_list[index]['custo'] ? -1 : 0;
            new_list[index]['retornoRisco'] = divide(new_list[index]['retornoRisco'], new_list[index]['qtd_trades']);
        }
    }
    ////////////////////
    // Agrupa 'por Mes'
    ////////////////////
    else if (simulation.periodo_calc === 3) {
        let month_used = null,
            index = -1;
        for (let e in ops) {
            let op_resultBruto_Unitario = calculate_op_result(ops[e]);
            // Roda os 'filters' na operação
            if (okToUse_filterOp(ops[e], filters, simulation)) {
                let current_month_year = ops[e].data.split('-'),
                    current_week_year = getISOWeek(parseISO(ops[e].data));
                current_week_year = `${current_month_year[0]}-${current_week_year}`;
                current_month_year = `${current_month_year[0]}-${current_month_year[1]}`;
                // Inicia a condição do Tipo Parada (No Dia)
                if (stop_tipo_parada['dia'].condicao !== ops[e].data) {
                    stop_tipo_parada['dia']['condicao'] = ops[e].data;
                    for (let tp = 0; tp < simulation['tipo_parada'].length; tp++) {
                        // Busca apenas os 'tipo_parada' de 'No Dia'
                        if (simulation['tipo_parada'][tp].tipo_parada.includes('d')) {
                            stop_tipo_parada['dia']['tipo_parada'][simulation['tipo_parada'][tp].tipo_parada] = {
                                current: 0.0,
                                max: parseFloat(simulation['tipo_parada'][tp].valor_parada),
                            };
                        }
                    }
                }
                // Inicia a condição do Tipo Parada (Na Semana)
                if (stop_tipo_parada['sem'].condicao !== current_week_year) {
                    stop_tipo_parada['sem']['condicao'] = current_week_year;
                    for (let tp = 0; tp < simulation['tipo_parada'].length; tp++) {
                        // Busca apenas os 'tipo_parada' de 'Na Semana'
                        if (simulation['tipo_parada'][tp].tipo_parada.includes('s')) {
                            stop_tipo_parada['sem']['tipo_parada'][simulation['tipo_parada'][tp].tipo_parada] = {
                                dia: { condicao: null, current: 0.0 },
                                current: 0.0,
                                max: parseFloat(simulation['tipo_parada'][tp].valor_parada),
                            };
                        }
                    }
                }
                // Calcula o resultado bruto da operação com apenas 1 contrato
                // Calcula o numero de contratos a ser usado dependendo do 'simulation'
                let cts_usado = findCts_toUse(ops[e].cts, simulation);
                // Calcula o resultado bruto aplicando o numero de contratos
                let resultBruto_operacao = op_resultBruto_Unitario['result'].brl * cts_usado;
                // Usa o custo da operação a ser aplicada no resultado 'Resultado Líquido'
                let custo_operacao = simulation.usa_custo ? cts_usado * ops[e].ativo_custo : 0.0;
                // Calcula o resultado liquido aplicando os custos
                let resultLiquido_operacao = resultBruto_operacao - custo_operacao;
                if (checkTipo_Paradas(stop_tipo_parada, resultLiquido_operacao, simulation)) {
                    // Guarda o mes sendo olhado
                    if (month_used !== current_month_year) {
                        month_used = current_month_year;
                        if (index > -1) new_list[index]['resultado_op'] = new_list[index]['result_liquido'].brl > 0 ? 1 : new_list[index]['result_liquido'].brl < 0 ? -1 : 0;
                        index++;
                    }
                    if (!(index in new_list)) {
                        new_list[index] = {
                            erro: ops[e].erro,
                            data: month_used,
                            qtd_trades: 1,
                            erro: ops[e].erro,
                            cts_usado: cts_usado,
                            custo: custo_operacao,
                            retornoRisco: ops[e].retorno_risco,
                            resultado_op: null,
                            lucro_bruto: {
                                brl: resultBruto_operacao > 0 ? resultBruto_operacao : 0.0,
                                R: simulation.R !== null ? (resultBruto_operacao > 0 ? divide(resultBruto_operacao, simulation.R) : 0.0) : '--',
                            },
                            prejuizo_bruto: {
                                brl: resultBruto_operacao < 0 ? resultBruto_operacao : 0.0,
                                R: simulation.R !== null ? (resultBruto_operacao < 0 ? divide(resultBruto_operacao, simulation.R) : 0.0) : '--',
                            },
                            result_bruto: {
                                brl: resultBruto_operacao,
                                R: simulation.R !== null ? divide(resultBruto_operacao, simulation.R) : '--',
                            },
                            result_liquido: {
                                brl: resultLiquido_operacao,
                                R: simulation.R !== null ? divide(resultLiquido_operacao, simulation.R) : '--',
                            },
                        };
                    } else {
                        new_list[index]['qtd_trades']++;
                        if (new_list[index]['erro'] === 0) new_list[index]['erro'] = ops[e].erro;
                        new_list[index]['cts_usado'] += cts_usado;
                        new_list[index]['custo'] += custo_operacao;
                        new_list[index]['retornoRisco'] += ops[e].retorno_risco;
                        new_list[index]['erro'] = new_list[index]['erro'] || ops[e].erro;
                        if (resultBruto_operacao > 0) {
                            new_list[index]['lucro_bruto']['brl'] += resultBruto_operacao;
                            if (simulation.R !== null) new_list[index]['lucro_bruto']['R'] += divide(resultBruto_operacao, simulation.R);
                        } else if (resultBruto_operacao < 0) {
                            new_list[index]['prejuizo_bruto']['brl'] += resultBruto_operacao;
                            if (simulation.R !== null) new_list[index]['prejuizo_bruto']['R'] += divide(resultBruto_operacao, simulation.R);
                        }
                        new_list[index]['result_bruto']['brl'] += resultBruto_operacao;
                        if (simulation.R !== null) new_list[index]['result_bruto']['R'] += divide(resultBruto_operacao, simulation.R);
                        new_list[index]['result_liquido']['brl'] += resultLiquido_operacao;
                        if (simulation.R !== null) new_list[index]['result_liquido']['R'] += divide(resultLiquido_operacao, simulation.R);
                    }
                }
            }
        }
        // Termina para o ultimo
        if (index > -1) {
            new_list[index]['resultado_op'] =
                new_list[index]['result_liquido']['brl'] > new_list[index]['custo'] ? 1 : new_list[index]['result_liquido']['brl'] < new_list[index]['custo'] ? -1 : 0;
            new_list[index]['retornoRisco'] = divide(new_list[index]['retornoRisco'], new_list[index]['qtd_trades']);
        }
    }
    return new_list;
};

/*
    Calcula em 'Brl' o Resultado de uma operação.
*/
const calculate_op_result = (op) => {
    return {
        // Resultado com apenas 1 contrato
        result: { brl: op.resultado / op.cts },
    };
};

/*
    Gera as estatisticas e dados para Gráficos, para a seção de Dashboard Ops em Renda Variável.

    @ops        : Lista de operações. (Seguira a ordem da lista passada)
    @filters    : Filtros a serem aplicados na lista de operações.
    @simulation : Dados de simulação para serem substituidos na lista de operações.
    @options    : Opções opcionais a serem passadas para a função.
*/
const generate__DashboardOps = (ops = [], filters = {}, simulation = {}, options = {}) => {
    // console.log(simulation);
    /*------------------------------------ Vars --------------------------------------*/
    // Opções passadas ao executar o generate
    let _options = {
        get_byCenario: 'get_byCenario' in options ? options.get_byCenario : true,
        get_graficoData: 'get_graficoData' in options ? options.get_graficoData : true,
        get_tradeTableData: 'get_tradeTableData' in options ? options.get_tradeTableData : true,
        only_FilterOps: 'only_FilterOps' in options ? options.only_FilterOps : false,
    };
    // Modifca alguns valores do 'filters' e 'simulation'
    let _filters = {
        data_inicial: 'data_inicial' in filters ? filters.data_inicial : null,
        data_final: 'data_final' in filters ? filters.data_final : null,
        hora_inicial: 'hora_inicial' in filters ? filters.hora_inicial : null,
        hora_final: 'hora_final' in filters ? filters.hora_final : null,
        ativo: 'ativo' in filters ? filters.ativo.map((v) => v.label) : [],
        gerenciamento: 'gerenciamento' in filters ? filters.gerenciamento?.label : null,
        cenario: 'cenario' in filters ? filters.cenario : {},
        observacoes_query_union: 'observacoes_query_union' in filters ? filters.observacoes_query_union : 'AND',
    };
    let _simulation = {
        periodo_calc: 'periodo_calc' in simulation ? simulation.periodo_calc : 1,
        tipo_cts: 'tipo_cts' in simulation ? simulation.tipo_cts : 1,
        cts: 'cts' in simulation ? simulation.cts : null,
        usa_custo: 'usa_custo' in simulation ? simulation.usa_custo === 1 : true,
        ignora_erro: 'ignora_erro' in simulation ? simulation.ignora_erro === 1 : false,
        tipo_parada: 'tipo_parada' in simulation ? simulation.tipo_parada : [],
        valor_inicial: 'valor_inicial' in simulation ? parseFloat(simulation.valor_inicial) : null,
        R: 'R' in simulation && simulation.R !== 0 ? simulation.R : null,
        R_filter_ops: 'R_filter_ops' in simulation && simulation.R_filter_ops === 1 ? true : false,
    };
    // Variaveis para a tabela de estatistica geral
    let _table_stats = {
        // Total de dias operados
        dias__total: 0,
        // Média de trades por dia
        dias__trades_por_dia: 0,
        // Quantidade total de trades
        trades__total: 0,
        // Quantidade total de trades positivos
        trades__positivo: 0,
        // Quantidade % de trades positivos
        trades__positivo_perc: 0.0,
        // Quantidade total de trades negativos
        trades__negativo: 0,
        // Quantidade % de trades negativos
        trades__negativo_perc: 0.0,
        // Quantidade total de trades empatados
        trades__empate: 0,
        // Quantidade % de trades empatados
        trades__empate_perc: 0.0,
        // Quantidade total de trades errados
        trades__erro: 0,
        // Quantidade % de trades errados
        trades__erro_perc: 0.0,
        // Maior sequencia de trades negativos
        trades__max_seq_negativo: 0,
        // Média da sequencia de trades negativos
        trades__max_seq_negativo_medio: 0,
        // Maior sequencia de trades positivos
        trades__max_seq_positivo: 0,
        // Média da sequencia de trades positivos
        trades__max_seq_positivo_medio: 0,
        // Lucro total em R$ das operações
        result__lucro_brl: 0.0,
        // Lucro total em R das operações
        result__lucro_R: 0.0,
        // Lucro total % das operações (Com base em um valor Inicial)
        result__lucro_perc: 0.0,
        // Lucro médio no periodo em R$ das operações
        result__lucro_medio_brl: 0.0,
        // Lucro médio no periodo em R das operações
        result__lucro_medio_R: 0.0,
        // Lucro médio no periodo em % das operações
        result__lucro_medio_perc: 0.0,
        // Valor médio em R$ das operações positivas (Incluindo os empates)
        result__mediaGain_brl: 0.0,
        // Valor médio em R das operações positivas (Incluindo os empates)
        result__mediaGain_R: 0.0,
        // Valor médio em % das operações positivas (Incluindo os empates)
        result__mediaGain_perc: 0.0,
        // Valor médio em R$ das operações negativas
        result__mediaLoss_brl: 0.0,
        // Valor médio em R das operações negativas
        result__mediaLoss_R: 0.0,
        // Valor médio em % das operações negativas
        result__mediaLoss_perc: 0.0,
        // Edge das operações
        stats__edge: 0.0,
        // Breakeven das operações
        stats__breakeven: 0.0,
        // Fator de Lucro das operações
        stats__fatorLucro: 0.0,
        // SQN das operações
        stats__sqn: 0.0,
        // Desvio Padrão em R$ das operações
        stats__dp_brl: 0.0,
        // Desvio Padrão em R das operações
        stats__dp_R: 0.0,
        // Desvio Padrão em % das operações
        stats__dp_perc: 0.0,
        // Média do Retorno sobre o risco, informado nos trades
        stats__retornoRiscoMedio: 0.0,
        // Risco Retorno médio das operações
        stats__rrMedio: 0.0,
        // Expectativa média em R$ a se esperar em futuras operações
        stats__expect_brl: 0.0,
        // Expectativa média em R a se esperar em futuras operações
        stats__expect_R: 0.0,
        // Expectativa média em % a se esperar em futuras operações
        stats__expect_perc: 0.0,
        // Quantidade total de drawdowns passados
        stats__drawdown_qtd: 0,
        // Drawdown corrente (Caso haja)
        stats__drawdown: 0.0,
        // Periodo do drawdown corrente
        stats__drawdown_periodo: 0,
        // Topo histórico alcançado na lista de operações
        stats__drawdown_topoHistorico: 0.0,
        // Maior drawdown na lista de operações
        stats__drawdown_max: 0.0,
        // Periodo do maior drawdown na lista de operações
        stats__drawdown_max_periodo: 0,
        // Valor corrente para chegar à ruína de (X%)
        stats__ruinaAtual: 0.0,
        // Valor Inicial informado + resultado liquido
        stats__valorInicial_com_lucro: 0.0,
        // Quantidade de Stops até quebrar o Valor Inicial informado
        stats__stops_ruina: 0,
    };
    // Variaveis para a tabela de resultados dos trades
    let _table_trades = [];
    // Variaveis de listas para os gráficos
    let _chart_data = {
        resultados_normalizado: {
            labels: [],
            data: [],
            banda_media: [],
            banda_superior: [],
            banda_inferior: [],
            date: [],
            risco: _simulation.R !== null ? _simulation.R * -1 : null,
        },
        evolucao_patrimonial: {
            labels: [],
            data: [],
            sma20: [],
            banda_media: [],
            banda_superior: [],
            banda_inferior: [],
            date: [],
        },
        resultado_por_hora: {
            labels: [],
            data_result: [],
            data_qtd: [],
        },
        drawdowns: {
            labels: [],
            data: [],
            banda_media: [],
            banda_superior1: [],
            banda_superior2: [],
        },
    };
    // Variaveis temporarias usadas em '_table_stats'
    let _temp__table_stats = {
        i_seq: 1,
        dias__unicos: {},
        horas__unicas: {},
        lucro_corrente: { brl: 0.0 },
        lucro_por_periodo: {},
        mediaGain: 0.0,
        mediaLoss: 0.0,
        lista_resultados: [],
        lista_resultados_R: [],
        sequencias_negativo__index: 0,
        sequencias_negativo: [],
        sequencias_positivo__index: 0,
        sequencias_positivo: [],
        drawdowns: [],
        sorted_drawdowns: [],
        drawdowns_index: 0,
    };
    // Variaveis para a tabela de estatistica por cenario
    let _table_stats__byCenario = {};
    // Variaveis temporarias usadas em '_table_stats__byCenario'
    let _temp__table_stats__byCenario = {};
    let _ops = groupData_byPeriodo(ops, _filters, _simulation, _options);
    if (_options.only_FilterOps) {
        return {
            filtered_ops: _ops,
        };
    }
    /*----------------------------- Percorre as operações ----------------------------*/
    /*----------------------------------- Por Trade ----------------------------------*/
    if (_simulation.periodo_calc === 1) {
        for (let o in _ops) {
            //////////////////////////////////
            // Resultados do Trade
            //////////////////////////////////
            if (_options.get_tradeTableData) {
                _table_trades.push({
                    trade__id: _ops[o].id,
                    // Sequencia do trade, na ordem que vem do BD
                    trade__seq: _temp__table_stats['i_seq']++,
                    // Data do trade
                    trade__data: _ops[o].data,
                    // Hora do trade
                    trade__hora: _ops[o].hora,
                    // Cenario do trade
                    trade__cenario: _ops[o].cenario,
                    // Contratos usados
                    trade__cts: _ops[o].cts_usado,
                    // Retorno sobre o risco
                    trade__retornoRisco: _ops[o].retornoRisco,
                    // Tipo da operação
                    trade__op: _ops[o].op,
                    // Se teve erro na operação
                    trade__erro: _ops[o].erro,
                    // Retorna a lista de observações do trade
                    trade__observacoes: _ops[o].observacoes,
                    // Resultado bruto do trade em BRL
                    trade__result_bruto__brl: _ops[o].result_bruto['brl'],
                    // Custo do trade
                    trade__custo: _ops[o].custo,
                    // Resultado Liquido do trade em BRL
                    trade__result_liquido__brl: _ops[o].result_liquido['brl'],
                });
            }
            //////////////////////////////////
            // Estatisticas Gerais
            //////////////////////////////////
            _temp__table_stats['dias__unicos'][_ops[o].data] = null;
            // Para a média de Retorno sobre risco
            _table_stats['stats__retornoRiscoMedio'] += _ops[o].retornoRisco;
            // Para o lucro em S
            _table_stats['result__lucro_S'] += _ops[o].result_bruto['S'];
            if (_ops[o].hora !== '00:00:00') {
                let round_time = format(startOfHour(parseISO(`2000-01-01T${_ops[o].hora}`)), 'HH:mm');
                if (!(round_time in _temp__table_stats['horas__unicas'])) _temp__table_stats['horas__unicas'][round_time] = { result: 0.0, qtd: 0 };
                _temp__table_stats['horas__unicas'][round_time]['result'] += _ops[o].result_liquido['brl'];
                _temp__table_stats['horas__unicas'][round_time]['qtd']++;
            }
            // Se for uma operação 'Positiva'
            if (_ops[o].resultado_op === 1) {
                _table_stats['trades__positivo']++;
                _temp__table_stats['mediaGain'] += _ops[o].result_liquido['brl'];
                if (_temp__table_stats['sequencias_positivo'][_temp__table_stats['sequencias_positivo__index']] === undefined)
                    _temp__table_stats['sequencias_positivo'][_temp__table_stats['sequencias_positivo__index']] = 0;
                _temp__table_stats['sequencias_positivo'][_temp__table_stats['sequencias_positivo__index']]++;
                // Reinicia a contagem de sequencia negativa
                if (_temp__table_stats['sequencias_negativo'][_temp__table_stats['sequencias_negativo__index']] > 0) _temp__table_stats['sequencias_negativo__index']++;
            }
            // Se for uma operação 'Negativa'
            else if (_ops[o].resultado_op === -1) {
                _table_stats['trades__negativo']++;
                _temp__table_stats['mediaLoss'] += _ops[o].result_liquido['brl'];
                if (_temp__table_stats['sequencias_negativo'][_temp__table_stats['sequencias_negativo__index']] === undefined)
                    _temp__table_stats['sequencias_negativo'][_temp__table_stats['sequencias_negativo__index']] = 0;
                _temp__table_stats['sequencias_negativo'][_temp__table_stats['sequencias_negativo__index']]++;
                // Reinicia a contagem de sequencia positiva
                if (_temp__table_stats['sequencias_positivo'][_temp__table_stats['sequencias_positivo__index']] > 0) _temp__table_stats['sequencias_positivo__index']++;
            }
            // Se for uma operação 'Empate (0x0)'
            else if (_ops[o].resultado_op === 0) {
                _table_stats['trades__empate']++;
                _temp__table_stats['mediaGain'] += _ops[o].result_liquido['brl'];
            }
            // Se for uma operação com Erro
            if (_ops[o].erro === 1) _table_stats['trades__erro']++;
            // Calcula o lucro corrente após cada operação
            _temp__table_stats['lucro_corrente']['brl'] += _ops[o].result_liquido['brl'];
            // Calcula o Lucro por Mes
            let current_month_year = _ops[o].data.split('-');
            current_month_year = `${current_month_year[0]}-${current_month_year[1]}`;
            if (!(current_month_year in _temp__table_stats['lucro_por_periodo'])) _temp__table_stats['lucro_por_periodo'][current_month_year] = 0.0;
            _temp__table_stats['lucro_por_periodo'][current_month_year] += _ops[o].result_liquido['brl'];
            // Para o Drawdown
            // Atualiza o topo historico
            if (_temp__table_stats['lucro_corrente']['brl'] > _table_stats['stats__drawdown_topoHistorico']) {
                _table_stats['stats__drawdown_topoHistorico'] = _temp__table_stats['lucro_corrente']['brl'];
                _table_stats['stats__drawdown'] = 0;
                _table_stats['stats__drawdown_periodo'] = 0;
                if (_temp__table_stats['drawdowns'][_temp__table_stats['drawdowns_index']] !== undefined) _temp__table_stats['drawdowns_index']++;
            }
            // Se estiver abaixo do topo, está em drawdown
            else if (_temp__table_stats['lucro_corrente']['brl'] < _table_stats['stats__drawdown_topoHistorico']) {
                if (_temp__table_stats['drawdowns'][_temp__table_stats['drawdowns_index']] === undefined) {
                    _temp__table_stats['drawdowns'][_temp__table_stats['drawdowns_index']] = {
                        brl: 0,
                        periodo: 0,
                    };
                    _temp__table_stats['sorted_drawdowns'][_temp__table_stats['drawdowns_index']] = {
                        brl: 0,
                        periodo: 0,
                    };
                }
                let lucro__topo_diff = Math.abs(_table_stats['stats__drawdown_topoHistorico'] - _temp__table_stats['lucro_corrente']['brl']);
                if (lucro__topo_diff > _temp__table_stats['drawdowns'][_temp__table_stats['drawdowns_index']]['brl']) {
                    _temp__table_stats['drawdowns'][_temp__table_stats['drawdowns_index']]['brl'] = lucro__topo_diff;
                    _temp__table_stats['sorted_drawdowns'][_temp__table_stats['drawdowns_index']]['brl'] = lucro__topo_diff;
                }
                _temp__table_stats['drawdowns'][_temp__table_stats['drawdowns_index']]['periodo']++;
                _temp__table_stats['sorted_drawdowns'][_temp__table_stats['drawdowns_index']]['periodo']++;
                _table_stats['stats__drawdown'] = lucro__topo_diff;
                _table_stats['stats__drawdown_periodo']++;
            }
            // Para o DP
            _temp__table_stats['lista_resultados'].push(_ops[o].result_liquido['brl']);
            if (_simulation['R'] !== null) _temp__table_stats['lista_resultados_R'].push(divide(_ops[o].result_liquido['brl'], _simulation['R']));
            //////////////////////////////////
            // Estatisticas para os Gráficos
            //////////////////////////////////
            if (_options.get_graficoData) {
                // Para o gráfico de Resultados por Trade
                _chart_data['resultados_normalizado']['labels'].push(parseInt(o) + 1);
                _chart_data['resultados_normalizado']['data'].push(_ops[o].result_liquido['brl']);
                _chart_data['resultados_normalizado']['date'].push(`${format(parseISO(_ops[o].data), 'dd/MM/yyyy')} ${_ops[o].hora}`);
                // Para o gráfico de Evolução Patrimonial
                _chart_data['evolucao_patrimonial']['labels'].push(parseInt(o) + 1);
                _chart_data['evolucao_patrimonial']['data'].push(_temp__table_stats['lucro_corrente']['brl']);
                _chart_data['evolucao_patrimonial']['date'].push(`${format(parseISO(_ops[o].data), 'dd/MM/yyyy')} ${_ops[o].hora}`);
            }
            //////////////////////////////////
            // Estatisticas por Cenario
            //////////////////////////////////
            if (_options.get_byCenario) {
                if (!(_ops[o].cenario in _table_stats__byCenario)) {
                    _table_stats__byCenario[_ops[o].cenario] = {
                        // Total de dias operados
                        dias__total: 0,
                        dias__trades_por_dia: 0,
                        trades__total: 0,
                        trades__total_perc: 0,
                        trades__positivo: 0,
                        trades__positivo_perc: 0.0,
                        trades__negativo: 0,
                        trades__negativo_perc: 0.0,
                        trades__empate: 0,
                        trades__empate_perc: 0.0,
                        trades__erro: 0,
                        trades__erro_perc: 0.0,
                        result__lucro_brl: 0.0,
                        result__lucro_R: 0.0,
                        result__lucro_perc: 0.0,
                        result__mediaGain_brl: 0.0,
                        result__mediaGain_R: 0.0,
                        result__mediaGain_perc: 0.0,
                        result__mediaLoss_brl: 0.0,
                        result__mediaLoss_R: 0.0,
                        result__mediaLoss_perc: 0.0,
                        stats__edge: 0.0,
                        stats__breakeven: 0.0,
                        stats__fatorLucro: 0.0,
                        stats__sqn: 0.0,
                        stats__dp_brl: 0.0,
                        stats__dp_R: 0.0,
                        stats__dp_perc: 0.0,
                        stats__retornoRiscoMedio: 0.0,
                        stats__rrMedio: 0.0,
                        stats__expect_brl: 0.0,
                        stats__expect_R: 0.0,
                        stats__expect_perc: 0.0,
                    };
                    _temp__table_stats__byCenario[_ops[o].cenario] = {
                        dias__unicos: {},
                        lucro_corrente: { brl: 0.0 },
                        mediaGain: 0.0,
                        mediaLoss: 0.0,
                        lista_resultados: [],
                        lista_resultados_R: [],
                    };
                }
                _temp__table_stats__byCenario[_ops[o].cenario]['dias__unicos'][_ops[o].data] = null;
                _table_stats__byCenario[_ops[o].cenario]['trades__total']++;
                _table_stats__byCenario[_ops[o].cenario]['stats__retornoRiscoMedio'] += _ops[o].retornoRisco;
                // Se for uma operação 'Positiva'
                if (_ops[o].resultado_op === 1) {
                    _table_stats__byCenario[_ops[o].cenario]['trades__positivo']++;
                    _temp__table_stats__byCenario[_ops[o].cenario]['mediaGain'] += _ops[o].result_liquido['brl'];
                }
                // Se for uma operação 'Negativa'
                else if (_ops[o].resultado_op === -1) {
                    _table_stats__byCenario[_ops[o].cenario]['trades__negativo']++;
                    _temp__table_stats__byCenario[_ops[o].cenario]['mediaLoss'] += _ops[o].result_liquido['brl'];
                }
                // Se for uma operação 'Empate (0x0)'
                else if (_ops[o].resultado_op === 0) {
                    _table_stats__byCenario[_ops[o].cenario]['trades__empate']++;
                    _temp__table_stats__byCenario[_ops[o].cenario]['mediaGain'] += _ops[o].result_liquido['brl'];
                }
                // Se for uma operação com Erro
                if (_ops[o].erro === 1) _table_stats__byCenario[_ops[o].cenario]['trades__erro']++;
                // Calcula o lucro corrente após cada operação
                _temp__table_stats__byCenario[_ops[o].cenario]['lucro_corrente']['brl'] += _ops[o].result_liquido['brl'];
                // Para o DP
                _temp__table_stats__byCenario[_ops[o].cenario]['lista_resultados'].push(_ops[o].result_liquido['brl']);
                if (_simulation['R'] !== null) _temp__table_stats__byCenario[_ops[o].cenario]['lista_resultados_R'].push(divide(_ops[o].result_liquido['brl'], _simulation['R']));
            }
        }
        /*------------------------ Termina processamento dos Dados -----------------------*/
        //////////////////////////////////
        // Estatisticas Gerais
        //////////////////////////////////
        // Termina de processar estatisticas de '_temp__table_stats'
        /* prettier-ignore */ _temp__table_stats['mediaGain']                = divide(_temp__table_stats['mediaGain'], (_table_stats['trades__positivo'] + _table_stats['trades__empate']));
        /* prettier-ignore */ _temp__table_stats['mediaLoss']                = divide(_temp__table_stats['mediaLoss'], _table_stats['trades__negativo']);

        // Termina de processar estatisticas do '_table_stats'
        /* prettier-ignore */ _table_stats['dias__total']                    = Object.keys(_temp__table_stats['dias__unicos']).length;

        /* prettier-ignore */ _table_stats['dias__trades_por_dia']           = divide(_ops.length, _table_stats['dias__total']);
        /* prettier-ignore */ _table_stats['trades__total']                  = _ops.length;
        /* prettier-ignore */ _table_stats['trades__positivo_perc']          = (divide(_table_stats['trades__positivo'], _table_stats['trades__total']) * 100);
        /* prettier-ignore */ _table_stats['trades__negativo_perc']          = (divide(_table_stats['trades__negativo'], _table_stats['trades__total']) * 100);
        /* prettier-ignore */ _table_stats['trades__empate_perc']            = (divide(_table_stats['trades__empate'], _table_stats['trades__total']) * 100);
        /* prettier-ignore */ _table_stats['trades__max_seq_negativo']       = (_temp__table_stats['sequencias_negativo'].length) ? Math.max(..._temp__table_stats['sequencias_negativo']) : 0;
        /* prettier-ignore */ _table_stats['trades__max_seq_positivo']       = (_temp__table_stats['sequencias_positivo'].length) ? Math.max(..._temp__table_stats['sequencias_positivo']) : 0;
        /* prettier-ignore */ _table_stats['trades__max_seq_negativo_medio'] = (_temp__table_stats['sequencias_negativo'].length) ? divide(_temp__table_stats['sequencias_negativo'].reduce((a, b) => a + b, 0), _temp__table_stats['sequencias_negativo'].length) : 0;
        /* prettier-ignore */ _table_stats['trades__max_seq_positivo_medio'] = (_temp__table_stats['sequencias_positivo'].length) ? divide(_temp__table_stats['sequencias_positivo'].reduce((a, b) => a + b, 0), _temp__table_stats['sequencias_positivo'].length) : 0;

        /* prettier-ignore */ _table_stats['result__lucro_brl']              = _temp__table_stats['lucro_corrente']['brl'];
        /* prettier-ignore */ _table_stats['result__lucro_R']                = (_simulation['R'] !== null) ? divide(_temp__table_stats['lucro_corrente']['brl'], _simulation['R']) : '--';
        /* prettier-ignore */ _table_stats['result__lucro_perc']             = (_simulation['valor_inicial'] !== null) ? (divide(_temp__table_stats['lucro_corrente']['brl'], _simulation['valor_inicial']) * 100) : '--';
        /* prettier-ignore */ _table_stats['result__lucro_medio_brl']        = divide(Object.values(_temp__table_stats['lucro_por_periodo']).reduce((a, b) => a + b, 0), Object.keys(_temp__table_stats['lucro_por_periodo']).length);
        /* prettier-ignore */ _table_stats['result__lucro_medio_R']          = (_simulation['R'] !== null) ? divide(_table_stats['result__lucro_medio_brl'], _simulation['R']) : '--';
        /* prettier-ignore */ _table_stats['result__lucro_medio_perc']       = (_simulation['valor_inicial'] !== null) ? (divide(_table_stats['result__lucro_medio_brl'], _simulation['valor_inicial']) * 100) : '--';
        /* prettier-ignore */ _table_stats['result__mediaGain_brl']          = _temp__table_stats['mediaGain'];
        /* prettier-ignore */ _table_stats['result__mediaLoss_brl']          = _temp__table_stats['mediaLoss'];
        /* prettier-ignore */ _table_stats['result__mediaGain_R'] 	         = (_simulation['R'] !== null) ? divide(_temp__table_stats['mediaGain'], _simulation['R']) : '--';
        /* prettier-ignore */ _table_stats['result__mediaLoss_R']            = (_simulation['R'] !== null) ? divide(_temp__table_stats['mediaLoss'], _simulation['R']) : '--';
        /* prettier-ignore */ _table_stats['result__mediaGain_perc']         = (_simulation['valor_inicial'] !== null) ? (divide(_temp__table_stats['mediaGain'], _simulation['valor_inicial']) * 100) : '--';
        /* prettier-ignore */ _table_stats['result__mediaLoss_perc']         = (_simulation['valor_inicial'] !== null) ? (divide(_temp__table_stats['mediaLoss'], _simulation['valor_inicial']) * 100) : '--';

        /* prettier-ignore */ _table_stats['stats__retornoRiscoMedio']       = divide(_table_stats['stats__retornoRiscoMedio'], _table_stats['trades__total']);
        /* prettier-ignore */ _table_stats['stats__rrMedio']                 = divide(_temp__table_stats['mediaGain'], Math.abs(_temp__table_stats['mediaLoss']));
        /* prettier-ignore */ _table_stats['stats__breakeven']               = (divide(Math.abs(_temp__table_stats['mediaLoss']), (_temp__table_stats['mediaGain'] + Math.abs(_temp__table_stats['mediaLoss']))) * 100);
        /* prettier-ignore */ _table_stats['stats__edge']                    = _table_stats['trades__positivo_perc'] - _table_stats['stats__breakeven'];
        /* prettier-ignore */ // Calculado da forma do Tainan
        /* prettier-ignore */ _table_stats['stats__fatorLucro']              = divide((_table_stats['trades__positivo_perc'] * _table_stats['stats__rrMedio']), (100 - _table_stats['trades__positivo_perc']));
        /* prettier-ignore */ _table_stats['stats__expect_brl']              = divide(_temp__table_stats['lucro_corrente']['brl'], _table_stats['trades__total']);
        /* prettier-ignore */ _table_stats['stats__expect_R']                = (_simulation['R'] !== null) ? divide(_table_stats['stats__expect_brl'], _simulation['R']) : '--';
        /* prettier-ignore */ _table_stats['stats__expect_perc']             = (_simulation['valor_inicial'] !== null) ? (divide(_table_stats['stats__expect_brl'], _simulation['valor_inicial']) * 100) : '--';
        /* prettier-ignore */ _table_stats['stats__dp_brl']                  = desvpad(_temp__table_stats['lista_resultados'])['desvpad'];
        /* prettier-ignore */ _table_stats['stats__dp_R']                    = (_simulation['R'] !== null) ? desvpad(_temp__table_stats['lista_resultados_R'])['desvpad'] : '--';
        /* prettier-ignore */ _table_stats['stats__dp_perc']                 = (_simulation['valor_inicial'] !== null) ? (divide(_table_stats['stats__dp_brl'], _simulation['valor_inicial']) * 100) : '--';
        /* prettier-ignore */ _table_stats['stats__sqn']                     = (_simulation['R'] !== null) ? (divide(_table_stats['stats__expect_R'], _table_stats['stats__dp_R']) * Math.sqrt(_table_stats['trades__total'])) : '--';
        /* prettier-ignore */ _table_stats['stats__valorInicial_com_lucro']  = (_simulation['valor_inicial'] !== null) ? (_simulation['valor_inicial'] + _temp__table_stats['lucro_corrente']['brl']) : '--';
        /* prettier-ignore */ _table_stats['stats__stops_ruina']             = (_simulation['valor_inicial'] !== null && _simulation['R'] !== null) ? Math.floor(divide(_table_stats['stats__valorInicial_com_lucro'], _simulation['R'])) : '--';

        _temp__table_stats['sorted_drawdowns'].sort((a, b) => a.brl - b.brl);

        /* prettier-ignore */ _table_stats['stats__drawdown_qtd']            = _temp__table_stats['drawdowns'].length;
        /* prettier-ignore */ _table_stats['stats__drawdown_max']            = (_temp__table_stats['sorted_drawdowns'].length) ? _temp__table_stats['sorted_drawdowns'][_temp__table_stats['drawdowns'].length-1]['brl'] : 0.0;
        /* prettier-ignore */ _table_stats['stats__drawdown_max_periodo']    = (_temp__table_stats['sorted_drawdowns'].length) ? _temp__table_stats['sorted_drawdowns'][_temp__table_stats['drawdowns'].length-1]['periodo'] : 0.0;

        /* prettier-ignore */ _table_stats['trades__erro']                   = ((!_simulation.ignora_erro) ? _table_stats['trades__erro'] : '--');
        /* prettier-ignore */ _table_stats['trades__erro_perc']              = ((!_simulation.ignora_erro) ? (divide(_table_stats['trades__erro'], _table_stats['trades__total']) * 100) : '--');

        //////////////////////////////////
        // Estatisticas por Cenario
        //////////////////////////////////
        if (_options.get_byCenario) {
            for (let cenario in _table_stats__byCenario) {
                // Termina de processar estatisticas de '_temp__table_stats__byCenario'
                /* prettier-ignore */ _temp__table_stats__byCenario[cenario]['mediaGain']          = divide(_temp__table_stats__byCenario[cenario]['mediaGain'], (_table_stats__byCenario[cenario]['trades__positivo'] + _table_stats__byCenario[cenario]['trades__empate']));
                /* prettier-ignore */ _temp__table_stats__byCenario[cenario]['mediaLoss']          = divide(_temp__table_stats__byCenario[cenario]['mediaLoss'], _table_stats__byCenario[cenario]['trades__negativo']);

                // Termina de processar estatisticas do '_table_stats__byCenario'
                /* prettier-ignore */ _table_stats__byCenario[cenario]['dias__total']              = Object.keys(_temp__table_stats__byCenario[cenario]['dias__unicos']).length;

                /* prettier-ignore */ _table_stats__byCenario[cenario]['trades__total_perc']       = (divide(_table_stats__byCenario[cenario]['trades__total'], _table_stats['trades__total']) * 100);
                /* prettier-ignore */ _table_stats__byCenario[cenario]['trades__positivo_perc']    = (divide(_table_stats__byCenario[cenario]['trades__positivo'], _table_stats__byCenario[cenario]['trades__total']) * 100);
                /* prettier-ignore */ _table_stats__byCenario[cenario]['trades__negativo_perc']    = (divide(_table_stats__byCenario[cenario]['trades__negativo'], _table_stats__byCenario[cenario]['trades__total']) * 100);
                /* prettier-ignore */ _table_stats__byCenario[cenario]['trades__empate_perc']      = (divide(_table_stats__byCenario[cenario]['trades__empate'], _table_stats__byCenario[cenario]['trades__total']) * 100);

                /* prettier-ignore */ _table_stats__byCenario[cenario]['result__lucro_brl']        = _temp__table_stats__byCenario[cenario]['lucro_corrente']['brl'];
                /* prettier-ignore */ _table_stats__byCenario[cenario]['result__lucro_R']          = (_simulation['R'] !== null) ? divide(_temp__table_stats__byCenario[cenario]['lucro_corrente']['brl'], _simulation['R']) : '--';
                /* prettier-ignore */ _table_stats__byCenario[cenario]['result__lucro_perc']       = (_simulation['valor_inicial'] !== null) ? (divide(_temp__table_stats__byCenario[cenario]['lucro_corrente']['brl'], _simulation['valor_inicial']) * 100) : '--';
                /* prettier-ignore */ _table_stats__byCenario[cenario]['result__mediaGain_brl']    = _temp__table_stats__byCenario[cenario]['mediaGain'];
                /* prettier-ignore */ _table_stats__byCenario[cenario]['result__mediaLoss_brl']    = _temp__table_stats__byCenario[cenario]['mediaLoss'];
                /* prettier-ignore */ _table_stats__byCenario[cenario]['result__mediaGain_R'] 	   = (_simulation['R'] !== null) ? divide(_temp__table_stats__byCenario[cenario]['mediaGain'], _simulation['R']) : '--';
                /* prettier-ignore */ _table_stats__byCenario[cenario]['result__mediaLoss_R']      = (_simulation['R'] !== null) ? divide(_temp__table_stats__byCenario[cenario]['mediaLoss'], _simulation['R']) : '--';
                /* prettier-ignore */ _table_stats__byCenario[cenario]['result__mediaGain_perc']   = (_simulation['valor_inicial'] !== null) ? (divide(_temp__table_stats__byCenario[cenario]['mediaGain'], _simulation['valor_inicial']) * 100) : '--';
                /* prettier-ignore */ _table_stats__byCenario[cenario]['result__mediaLoss_perc']   = (_simulation['valor_inicial'] !== null) ? (divide(_temp__table_stats__byCenario[cenario]['mediaLoss'], _simulation['valor_inicial']) * 100) : '--';

                /* prettier-ignore */ _table_stats__byCenario[cenario]['stats__retornoRiscoMedio'] = divide(_table_stats__byCenario[cenario]['stats__retornoRiscoMedio'], _table_stats__byCenario[cenario]['trades__total']);
                /* prettier-ignore */ _table_stats__byCenario[cenario]['stats__rrMedio']           = divide(_temp__table_stats__byCenario[cenario]['mediaGain'], Math.abs(_temp__table_stats__byCenario[cenario]['mediaLoss']));
                /* prettier-ignore */ _table_stats__byCenario[cenario]['stats__breakeven']         = (divide(Math.abs(_temp__table_stats__byCenario[cenario]['mediaLoss']), (_temp__table_stats__byCenario[cenario]['mediaGain'] + Math.abs(_temp__table_stats__byCenario[cenario]['mediaLoss']))) * 100);
                /* prettier-ignore */ _table_stats__byCenario[cenario]['stats__edge']              = _table_stats__byCenario[cenario]['trades__positivo_perc'] - _table_stats__byCenario[cenario]['stats__breakeven'];
                /* prettier-ignore */ // Calculado da forma do Tainan
                /* prettier-ignore */ _table_stats__byCenario[cenario]['stats__fatorLucro']        = divide((_table_stats__byCenario[cenario]['trades__positivo_perc'] * _table_stats__byCenario[cenario]['stats__rrMedio']), (100 - _table_stats__byCenario[cenario]['trades__positivo_perc']));
                /* prettier-ignore */ _table_stats__byCenario[cenario]['stats__expect_brl']        = divide(_temp__table_stats__byCenario[cenario]['lucro_corrente']['brl'], _table_stats__byCenario[cenario]['trades__total']);
                /* prettier-ignore */ _table_stats__byCenario[cenario]['stats__expect_R']          = (_simulation['R'] !== null) ? divide(_table_stats__byCenario[cenario]['stats__expect_brl'], _simulation['R']) : '--';
                /* prettier-ignore */ _table_stats__byCenario[cenario]['stats__expect_perc']       = (_simulation['valor_inicial'] !== null) ? (divide(_table_stats__byCenario[cenario]['stats__expect_brl'], _simulation['valor_inicial']) * 100) : '--';
                /* prettier-ignore */ _table_stats__byCenario[cenario]['stats__dp_brl']            = desvpad(_temp__table_stats__byCenario[cenario]['lista_resultados'])['desvpad'];
                /* prettier-ignore */ _table_stats__byCenario[cenario]['stats__dp_R']              = (_simulation['R'] !== null) ? desvpad(_temp__table_stats__byCenario[cenario]['lista_resultados_R'])['desvpad'] : '--';
                /* prettier-ignore */ _table_stats__byCenario[cenario]['stats__dp_perc']           = (_simulation['valor_inicial'] !== null) ? (divide(_table_stats__byCenario[cenario]['stats__dp_brl'], _simulation['valor_inicial']) * 100) : '--';
                /* prettier-ignore */ _table_stats__byCenario[cenario]['stats__sqn']               = (_simulation['R'] !== null) ? (divide(_table_stats__byCenario[cenario]['stats__expect_R'], _table_stats__byCenario[cenario]['stats__dp_R']) * Math.sqrt(_table_stats__byCenario[cenario]['trades__total'])) : '--';

                /* prettier-ignore */ _table_stats__byCenario[cenario]['trades__erro']             = ((!_simulation.ignora_erro) ? _table_stats__byCenario[cenario]['trades__erro'] : '--');
                /* prettier-ignore */ _table_stats__byCenario[cenario]['trades__erro_perc']        = ((!_simulation.ignora_erro) ? (divide(_table_stats__byCenario[cenario]['trades__erro'], _table_stats__byCenario[cenario]['trades__total']) * 100) : '--');
            }
        }

        //////////////////////////////////
        // Estatisticas para os Gráficos
        //////////////////////////////////
        if (_options.get_graficoData) {
            //////////////////////////////////
            // Gráfico de Evolução Patrimonial
            //////////////////////////////////
            // Média móvel simples da evolução patrimonial
            SMA(_chart_data['evolucao_patrimonial']['data'], _chart_data['evolucao_patrimonial']['sma20'], 20);
            // 2 Bandas de Desvio Padrão
            BBollinger(_chart_data['evolucao_patrimonial'], 1, null, 2);
            //////////////////////////////////
            // Gráfico de Resultados Normalizados
            //////////////////////////////////
            // Gráfico de barras dos resultados + bandas superior e inferior do desvio padrao + linha de risco
            BBollinger(_chart_data['resultados_normalizado'], 1, null, 1);
            //////////////////////////////////
            // Gráfico de Resultados por Hora
            //////////////////////////////////
            let sorted_horas__unicas = Object.keys(_temp__table_stats['horas__unicas']).sort();
            for (let h = 0; h < sorted_horas__unicas.length; h++) {
                _chart_data['resultado_por_hora']['labels'].push(sorted_horas__unicas[h]);
                _chart_data['resultado_por_hora']['data_result'].push(_temp__table_stats['horas__unicas'][sorted_horas__unicas[h]]['result']);
                _chart_data['resultado_por_hora']['data_qtd'].push(_temp__table_stats['horas__unicas'][sorted_horas__unicas[h]]['qtd']);
            }
            //////////////////////////////////
            // Gráfico Historico de Drawdowns
            //////////////////////////////////
            _chart_data['drawdowns']['data'] = _temp__table_stats['drawdowns'].map((o) => o.brl);
            _chart_data['drawdowns']['labels'] = Object.keys(_chart_data['drawdowns']['data']).map((o) => parseInt(o) + 1);
            BBollinger(_chart_data['drawdowns'], 1, null, 2, true, 'sup');
        }
        /*------------------------------- Retorno dos Dados ------------------------------*/
        return {
            checksum: generateHash(6),
            table_stats: _table_stats,
            table_stats__byCenario: _table_stats__byCenario,
            table_trades: _table_trades,
            table_trades__periodo_calc: _simulation.periodo_calc,
            chart_data: _chart_data,
        };
    } else if (_simulation.periodo_calc === 2) {
        /*------------------------------------ Por Dia -----------------------------------*/
        for (let o in _ops) {
            //////////////////////////////////
            // Resultados do Trade
            //////////////////////////////////
            if (_options.get_tradeTableData) {
                _table_trades.push({
                    // Sequencia do trade, na ordem que vem do BD
                    dia__seq: _temp__table_stats['i_seq']++,
                    // Data do trade
                    dia__data: _ops[o].data,
                    // Contratos usados
                    dia__cts: _ops[o].cts_usado,
                    // Média de Retorno sobre risco do dia
                    dia__retornoRisco_medio: _ops[o].retornoRisco,
                    // Trades feitos no dia
                    dia__qtd_trades: _ops[o].qtd_trades,
                    // Se houve erro no dia
                    dia__erro: _ops[o].erro,
                    // Lucro bruto do dia em BRL
                    dia__lucro_bruto__brl: _ops[o].lucro_bruto['brl'],
                    // Prejuizo bruto do dia em BRL
                    dia__prejuizo_bruto__brl: _ops[o].prejuizo_bruto['brl'],
                    // Resultado bruto do dia em BRL
                    dia__result_bruto__brl: _ops[o].result_bruto['brl'],
                    // Custo do trade
                    dia__custo: _ops[o].custo,
                    // Resultado Liquido do dia em BRL
                    dia__result_liquido__brl: _ops[o].result_liquido['brl'],
                });
            }
            //////////////////////////////////
            // Estatisticas Gerais
            //////////////////////////////////
            let day_of_week = getDay(parseISO(_ops[o].data));
            if (!(day_of_week in _temp__table_stats['horas__unicas'])) _temp__table_stats['horas__unicas'][day_of_week] = { result: 0.0, qtd: 0 };
            _temp__table_stats['horas__unicas'][day_of_week]['result'] += _ops[o].result_liquido['brl'];
            _temp__table_stats['horas__unicas'][day_of_week]['qtd']++;
            _table_stats['stats__retornoRiscoMedio'] += _ops[o].retornoRisco;
            // Se for uma operação 'Positiva'
            if (_ops[o].resultado_op === 1) {
                _table_stats['trades__positivo']++;
                _temp__table_stats['mediaGain'] += _ops[o].result_liquido['brl'];
                if (_temp__table_stats['sequencias_positivo'][_temp__table_stats['sequencias_positivo__index']] === undefined)
                    _temp__table_stats['sequencias_positivo'][_temp__table_stats['sequencias_positivo__index']] = 0;
                _temp__table_stats['sequencias_positivo'][_temp__table_stats['sequencias_positivo__index']]++;
                // Reinicia a contagem de sequencia negativa
                if (_temp__table_stats['sequencias_negativo'][_temp__table_stats['sequencias_negativo__index']] > 0) _temp__table_stats['sequencias_negativo__index']++;
            }
            // Se for uma operação 'Negativa'
            else if (_ops[o].resultado_op === -1) {
                _table_stats['trades__negativo']++;
                _temp__table_stats['mediaLoss'] += _ops[o].result_liquido['brl'];
                if (_temp__table_stats['sequencias_negativo'][_temp__table_stats['sequencias_negativo__index']] === undefined)
                    _temp__table_stats['sequencias_negativo'][_temp__table_stats['sequencias_negativo__index']] = 0;
                _temp__table_stats['sequencias_negativo'][_temp__table_stats['sequencias_negativo__index']]++;
                // Reinicia a contagem de sequencia positiva
                if (_temp__table_stats['sequencias_positivo'][_temp__table_stats['sequencias_positivo__index']] > 0) _temp__table_stats['sequencias_positivo__index']++;
            }
            // Se for uma operação 'Empate (0x0)'
            else if (_ops[o].resultado_op === 0) {
                _table_stats['trades__empate']++;
                _temp__table_stats['mediaGain'] += _ops[o].result_liquido['brl'];
            }
            // Se for uma operação com Erro
            if (_ops[o].erro === 1) _table_stats['trades__erro']++;
            // Calcula o lucro corrente após cada operação
            _temp__table_stats['lucro_corrente']['brl'] += _ops[o].result_liquido['brl'];
            // Calcula o Lucro por Mes
            let current_month_year = _ops[o].data.split('-');
            current_month_year = `${current_month_year[0]}-${current_month_year[1]}`;
            if (!(current_month_year in _temp__table_stats['lucro_por_periodo'])) _temp__table_stats['lucro_por_periodo'][current_month_year] = 0.0;
            _temp__table_stats['lucro_por_periodo'][current_month_year] += _ops[o].result_liquido['brl'];
            // Para o Drawdown
            // Atualiza o topo historico
            if (_temp__table_stats['lucro_corrente']['brl'] > _table_stats['stats__drawdown_topoHistorico']) {
                _table_stats['stats__drawdown_topoHistorico'] = _temp__table_stats['lucro_corrente']['brl'];
                _table_stats['stats__drawdown'] = 0;
                _table_stats['stats__drawdown_periodo'] = 0;
                if (_temp__table_stats['drawdowns'][_temp__table_stats['drawdowns_index']] !== undefined) _temp__table_stats['drawdowns_index']++;
            }
            // Se estiver abaixo do topo, está em drawdown
            else if (_temp__table_stats['lucro_corrente']['brl'] < _table_stats['stats__drawdown_topoHistorico']) {
                if (_temp__table_stats['drawdowns'][_temp__table_stats['drawdowns_index']] === undefined) {
                    _temp__table_stats['drawdowns'][_temp__table_stats['drawdowns_index']] = {
                        brl: 0,
                        periodo: 0,
                    };
                    _temp__table_stats['sorted_drawdowns'][_temp__table_stats['drawdowns_index']] = {
                        brl: 0,
                        periodo: 0,
                    };
                }
                let lucro__topo_diff = Math.abs(_table_stats['stats__drawdown_topoHistorico'] - Math.abs(_temp__table_stats['lucro_corrente']['brl']));
                if (lucro__topo_diff > _temp__table_stats['drawdowns'][_temp__table_stats['drawdowns_index']]['brl']) {
                    _temp__table_stats['drawdowns'][_temp__table_stats['drawdowns_index']]['brl'] = lucro__topo_diff;
                    _temp__table_stats['sorted_drawdowns'][_temp__table_stats['drawdowns_index']]['brl'] = lucro__topo_diff;
                }
                _temp__table_stats['drawdowns'][_temp__table_stats['drawdowns_index']]['periodo']++;
                _temp__table_stats['sorted_drawdowns'][_temp__table_stats['drawdowns_index']]['periodo']++;
                _table_stats['stats__drawdown'] = lucro__topo_diff;
                _table_stats['stats__drawdown_periodo']++;
            }
            // Para o DP
            _temp__table_stats['lista_resultados'].push(_ops[o].result_liquido['brl']);
            if (_simulation['R'] !== null) _temp__table_stats['lista_resultados_R'].push(divide(_ops[o].result_liquido['brl'], _simulation['R']));
            //////////////////////////////////
            // Estatisticas para os Gráficos
            //////////////////////////////////
            if (_options.get_graficoData) {
                // Para o gráfico de Resultados por Trade
                _chart_data['resultados_normalizado']['labels'].push(parseInt(o) + 1);
                _chart_data['resultados_normalizado']['data'].push(_ops[o].result_liquido['brl']);
                _chart_data['resultados_normalizado']['date'].push(`${format(parseISO(_ops[o].data), 'dd/MM/yyyy')} Trades: ${_ops[o].qtd_trades}`);
                // Para o gráfico de Evolução Patrimonial
                _chart_data['evolucao_patrimonial']['labels'].push(parseInt(o) + 1);
                _chart_data['evolucao_patrimonial']['data'].push(_temp__table_stats['lucro_corrente']['brl']);
                _chart_data['evolucao_patrimonial']['date'].push(`${format(parseISO(_ops[o].data), 'dd/MM/yyyy')} Trades: ${_ops[o].qtd_trades}`);
            }
        }
        /*------------------------ Termina processamento dos Dados -----------------------*/
        //////////////////////////////////
        // Estatisticas Gerais
        //////////////////////////////////
        // Termina de processar estatisticas de '_temp__table_stats'
        /* prettier-ignore */ _temp__table_stats['mediaGain']                = divide(_temp__table_stats['mediaGain'], (_table_stats['trades__positivo'] + _table_stats['trades__empate']));
        /* prettier-ignore */ _temp__table_stats['mediaLoss']                = divide(_temp__table_stats['mediaLoss'], _table_stats['trades__negativo']);

        // Termina de processar estatisticas do '_table_stats'

        /* prettier-ignore */ _table_stats['trades__total']                  = _ops.length;

        /* prettier-ignore */ _table_stats['trades__positivo_perc']          = (divide(_table_stats['trades__positivo'], _table_stats['trades__total']) * 100);
        /* prettier-ignore */ _table_stats['trades__negativo_perc']          = (divide(_table_stats['trades__negativo'], _table_stats['trades__total']) * 100);
        /* prettier-ignore */ _table_stats['trades__empate_perc']            = (divide(_table_stats['trades__empate'], _table_stats['trades__total']) * 100);
        /* prettier-ignore */ _table_stats['trades__max_seq_negativo']       = (_temp__table_stats['sequencias_negativo'].length) ? Math.max(..._temp__table_stats['sequencias_negativo']) : 0;
        /* prettier-ignore */ _table_stats['trades__max_seq_positivo']       = (_temp__table_stats['sequencias_positivo'].length) ? Math.max(..._temp__table_stats['sequencias_positivo']) : 0;
        /* prettier-ignore */ _table_stats['trades__max_seq_negativo_medio'] = (_temp__table_stats['sequencias_negativo'].length) ? divide(_temp__table_stats['sequencias_negativo'].reduce((a, b) => a + b, 0), _temp__table_stats['sequencias_negativo'].length) : 0;
        /* prettier-ignore */ _table_stats['trades__max_seq_positivo_medio'] = (_temp__table_stats['sequencias_positivo'].length) ? divide(_temp__table_stats['sequencias_positivo'].reduce((a, b) => a + b, 0), _temp__table_stats['sequencias_positivo'].length) : 0;

        /* prettier-ignore */ _table_stats['result__lucro_brl']              = _temp__table_stats['lucro_corrente']['brl'];
        /* prettier-ignore */ _table_stats['result__lucro_R']                = (_simulation['R'] !== null) ? divide(_temp__table_stats['lucro_corrente']['brl'], _simulation['R']) : '--';
        /* prettier-ignore */ _table_stats['result__lucro_perc']             = (_simulation['valor_inicial'] !== null) ? (divide(_temp__table_stats['lucro_corrente']['brl'], _simulation['valor_inicial']) * 100) : '--';
        /* prettier-ignore */ _table_stats['result__lucro_medio_brl']        = divide(Object.values(_temp__table_stats['lucro_por_periodo']).reduce((a, b) => a + b, 0), Object.keys(_temp__table_stats['lucro_por_periodo']).length);
        /* prettier-ignore */ _table_stats['result__lucro_medio_R']          = (_simulation['R'] !== null) ? divide(_table_stats['result__lucro_medio_brl'], _simulation['R']) : '--';
        /* prettier-ignore */ _table_stats['result__lucro_medio_perc']       = (_simulation['valor_inicial'] !== null) ? (divide(_table_stats['result__lucro_medio_brl'], _simulation['valor_inicial']) * 100) : '--';
        /* prettier-ignore */ _table_stats['result__mediaGain_brl']          = _temp__table_stats['mediaGain'];
        /* prettier-ignore */ _table_stats['result__mediaLoss_brl']          = _temp__table_stats['mediaLoss'];
        /* prettier-ignore */ _table_stats['result__mediaGain_R'] 	         = (_simulation['R'] !== null) ? divide(_temp__table_stats['mediaGain'], _simulation['R']) : '--';
        /* prettier-ignore */ _table_stats['result__mediaLoss_R']            = (_simulation['R'] !== null) ? divide(_temp__table_stats['mediaLoss'], _simulation['R']) : '--';
        /* prettier-ignore */ _table_stats['result__mediaGain_perc']         = (_simulation['valor_inicial'] !== null) ? (divide(_temp__table_stats['mediaGain'], _simulation['valor_inicial']) * 100) : '--';
        /* prettier-ignore */ _table_stats['result__mediaLoss_perc']         = (_simulation['valor_inicial'] !== null) ? (divide(_temp__table_stats['mediaLoss'], _simulation['valor_inicial']) * 100) : '--';

        /* prettier-ignore */ _table_stats['stats__retornoRiscoMedio']       = divide(_table_stats['stats__retornoRiscoMedio'], _table_stats['trades__total']);
        /* prettier-ignore */ _table_stats['stats__rrMedio']                 = divide(_temp__table_stats['mediaGain'], Math.abs(_temp__table_stats['mediaLoss']));
        /* prettier-ignore */ _table_stats['stats__breakeven']               = (divide(Math.abs(_temp__table_stats['mediaLoss']), (_temp__table_stats['mediaGain'] + Math.abs(_temp__table_stats['mediaLoss']))) * 100);
        /* prettier-ignore */ _table_stats['stats__edge']                    = _table_stats['trades__positivo_perc'] - _table_stats['stats__breakeven'];
        /* prettier-ignore */ // Calculado da forma do Tainan
        /* prettier-ignore */ _table_stats['stats__fatorLucro']              = divide((_table_stats['trades__positivo_perc'] * _table_stats['stats__rrMedio']), (100 - _table_stats['trades__positivo_perc']));
        /* prettier-ignore */ _table_stats['stats__expect_brl']              = divide(_temp__table_stats['lucro_corrente']['brl'], _table_stats['trades__total']);
        /* prettier-ignore */ _table_stats['stats__expect_R']                = (_simulation['R'] !== null) ? divide(_table_stats['stats__expect_brl'], _simulation['R']) : '--';
        /* prettier-ignore */ _table_stats['stats__expect_perc']             = (_simulation['valor_inicial'] !== null) ? (divide(_table_stats['stats__expect_brl'], _simulation['valor_inicial']) * 100) : '--';
        /* prettier-ignore */ _table_stats['stats__dp_brl']                  = desvpad(_temp__table_stats['lista_resultados'])['desvpad'];
        /* prettier-ignore */ _table_stats['stats__dp_R']                    = (_simulation['R'] !== null) ? desvpad(_temp__table_stats['lista_resultados_R'])['desvpad'] : '--';
        /* prettier-ignore */ _table_stats['stats__dp_perc']                 = (_simulation['valor_inicial'] !== null) ? (divide(_table_stats['stats__dp_brl'], _simulation['valor_inicial']) * 100) : '--';
        /* prettier-ignore */ _table_stats['stats__sqn']                     = (_simulation['R'] !== null) ? (divide(_table_stats['stats__expect_R'], _table_stats['stats__dp_R']) * Math.sqrt(_table_stats['trades__total'])) : '--';
        /* prettier-ignore */ _table_stats['stats__valorInicial_com_lucro']  = (_simulation['valor_inicial'] !== null) ? (_simulation['valor_inicial'] + _temp__table_stats['lucro_corrente']['brl']) : '--';
        /* prettier-ignore */ _table_stats['stats__stops_ruina']             = (_simulation['valor_inicial'] !== null && _simulation['R'] !== null) ? Math.floor(divide(_table_stats['stats__valorInicial_com_lucro'], _simulation['R'])) : '--';

        _temp__table_stats['sorted_drawdowns'].sort((a, b) => a.brl - b.brl);

        /* prettier-ignore */ _table_stats['stats__drawdown_qtd']            = _temp__table_stats['drawdowns'].length;
        /* prettier-ignore */ _table_stats['stats__drawdown_max']            = (_temp__table_stats['sorted_drawdowns'].length) ? _temp__table_stats['sorted_drawdowns'][_temp__table_stats['drawdowns'].length-1]['brl'] : 0.0;
        /* prettier-ignore */ _table_stats['stats__drawdown_max_periodo']    = (_temp__table_stats['sorted_drawdowns'].length) ? _temp__table_stats['sorted_drawdowns'][_temp__table_stats['drawdowns'].length-1]['periodo'] : 0.0;

        /* prettier-ignore */ _table_stats['trades__erro']                   = ((!_simulation.ignora_erro) ? _table_stats['trades__erro'] : '--');
        /* prettier-ignore */ _table_stats['trades__erro_perc']              = ((!_simulation.ignora_erro) ? (divide(_table_stats['trades__erro'], _table_stats['trades__total']) * 100) : '--');

        //////////////////////////////////
        // Estatisticas para os Gráficos
        //////////////////////////////////
        if (_options.get_graficoData) {
            //////////////////////////////////
            // Gráfico de Evolução Patrimonial
            //////////////////////////////////
            // Média móvel simples da evolução patrimonial
            SMA(_chart_data['evolucao_patrimonial']['data'], _chart_data['evolucao_patrimonial']['sma20'], 20);
            // 2 Bandas de Desvio Padrão
            BBollinger(_chart_data['evolucao_patrimonial'], 1, null, 2);
            //////////////////////////////////
            // Gráfico de Resultados Normalizados
            //////////////////////////////////
            // Gráfico de barras dos resultados + bandas superior e inferior do desvio padrao + linha de risco
            BBollinger(_chart_data['resultados_normalizado'], 1, null, 1);
            //////////////////////////////////
            // Gráfico de Resultados por Hora
            //////////////////////////////////
            let days_of_week = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
                sorted_horas__unicas = Object.keys(_temp__table_stats['horas__unicas']).sort();
            for (let h = 0; h < sorted_horas__unicas.length; h++) {
                _chart_data['resultado_por_hora']['labels'].push(days_of_week[sorted_horas__unicas[h]]);
                _chart_data['resultado_por_hora']['data_result'].push(_temp__table_stats['horas__unicas'][sorted_horas__unicas[h]]['result']);
                _chart_data['resultado_por_hora']['data_qtd'].push(_temp__table_stats['horas__unicas'][sorted_horas__unicas[h]]['qtd']);
            }
            //////////////////////////////////
            // Gráfico Historico de Drawdowns
            //////////////////////////////////
            _chart_data['drawdowns']['data'] = _temp__table_stats['drawdowns'].map((o) => o.brl);
            _chart_data['drawdowns']['labels'] = Object.keys(_chart_data['drawdowns']['data']).map((o) => parseInt(o) + 1);
            BBollinger(_chart_data['drawdowns'], 1, null, 2, true, 'sup');
        }
        /*------------------------------- Retorno dos Dados ------------------------------*/
        return {
            checksum: generateHash(6),
            table_stats: _table_stats,
            table_stats__byCenario: _table_stats__byCenario,
            table_trades: _table_trades,
            table_trades__periodo_calc: _simulation.periodo_calc,
            chart_data: _chart_data,
        };
    } else if (_simulation.periodo_calc === 3) {
        /*------------------------------------ Por Mes -----------------------------------*/
        for (let o in _ops) {
            //////////////////////////////////
            // Resultados do Trade
            //////////////////////////////////
            if (_options.get_tradeTableData) {
                _table_trades.push({
                    // Sequencia do trade, na ordem que vem do BD
                    mes__seq: _temp__table_stats['i_seq']++,
                    // Data do trade
                    mes__data: _ops[o].data,
                    // Contratos usados
                    mes__cts: _ops[o].cts_usado,
                    // Média de Retorno sobre risco do mes
                    mes__retornoRisco_medio: _ops[o].retornoRisco,
                    // Trades feitos no mes
                    mes__qtd_trades: _ops[o].qtd_trades,
                    // Se houve erro no mes
                    mes__erro: _ops[o].erro,
                    // Resultado bruto do mes em S
                    mes__result_bruto__S: _ops[o].result_bruto['S'],
                    // Lucro bruto do mes em BRL
                    mes__lucro_bruto__brl: _ops[o].lucro_bruto['brl'],
                    // Prejuizo bruto do mes em BRL
                    mes__prejuizo_bruto__brl: _ops[o].prejuizo_bruto['brl'],
                    // Resultado bruto do mes em BRL
                    mes__result_bruto__brl: _ops[o].result_bruto['brl'],
                    // Custo do mes
                    mes__custo: _ops[o].custo,
                    // Resultado Liquido do mes em BRL
                    mes__result_liquido__brl: _ops[o].result_liquido['brl'],
                });
            }
            //////////////////////////////////
            // Estatisticas Gerais
            //////////////////////////////////
            let month = getMonth(parseISO(_ops[o].data));
            if (!(month in _temp__table_stats['horas__unicas'])) _temp__table_stats['horas__unicas'][month] = { result: 0.0, qtd: 0 };
            _temp__table_stats['horas__unicas'][month]['result'] += _ops[o].result_liquido['brl'];
            _temp__table_stats['horas__unicas'][month]['qtd']++;
            _table_stats['stats__retornoRiscoMedio'] += _ops[o].retornoRisco;
            // Para o lucro em S
            _table_stats['result__lucro_S'] += _ops[o].result_bruto['S'];
            // Se for uma operação 'Positiva'
            if (_ops[o].resultado_op === 1) {
                _table_stats['trades__positivo']++;
                _temp__table_stats['mediaGain'] += _ops[o].result_liquido['brl'];
                if (_temp__table_stats['sequencias_positivo'][_temp__table_stats['sequencias_positivo__index']] === undefined)
                    _temp__table_stats['sequencias_positivo'][_temp__table_stats['sequencias_positivo__index']] = 0;
                _temp__table_stats['sequencias_positivo'][_temp__table_stats['sequencias_positivo__index']]++;
                // Reinicia a contagem de sequencia negativa
                if (_temp__table_stats['sequencias_negativo'][_temp__table_stats['sequencias_negativo__index']] > 0) _temp__table_stats['sequencias_negativo__index']++;
            }
            // Se for uma operação 'Negativa'
            else if (_ops[o].resultado_op === -1) {
                _table_stats['trades__negativo']++;
                _temp__table_stats['mediaLoss'] += _ops[o].result_liquido['brl'];
                if (_temp__table_stats['sequencias_negativo'][_temp__table_stats['sequencias_negativo__index']] === undefined)
                    _temp__table_stats['sequencias_negativo'][_temp__table_stats['sequencias_negativo__index']] = 0;
                _temp__table_stats['sequencias_negativo'][_temp__table_stats['sequencias_negativo__index']]++;
                // Reinicia a contagem de sequencia positiva
                if (_temp__table_stats['sequencias_positivo'][_temp__table_stats['sequencias_positivo__index']] > 0) _temp__table_stats['sequencias_positivo__index']++;
            }
            // Se for uma operação 'Empate (0x0)'
            else if (_ops[o].resultado_op === 0) {
                _table_stats['trades__empate']++;
                _temp__table_stats['mediaGain'] += _ops[o].result_liquido['brl'];
            }
            // Se for uma operação com Erro
            if (_ops[o].erro === 1) _table_stats['trades__erro']++;
            // Calcula o lucro corrente após cada operação
            _temp__table_stats['lucro_corrente']['brl'] += _ops[o].result_liquido['brl'];
            // Calcula o Lucro por Mes
            if (!(_ops[o].data in _temp__table_stats['lucro_por_periodo'])) _temp__table_stats['lucro_por_periodo'][_ops[o].data] = 0.0;
            _temp__table_stats['lucro_por_periodo'][_ops[o].data] += _ops[o].result_liquido['brl'];
            // Para o Drawdown
            // Atualiza o topo historico
            if (_temp__table_stats['lucro_corrente']['brl'] > _table_stats['stats__drawdown_topoHistorico']) {
                _table_stats['stats__drawdown_topoHistorico'] = _temp__table_stats['lucro_corrente']['brl'];
                _table_stats['stats__drawdown'] = 0;
                _table_stats['stats__drawdown_periodo'] = 0;
                if (_temp__table_stats['drawdowns'][_temp__table_stats['drawdowns_index']] !== undefined) _temp__table_stats['drawdowns_index']++;
            }
            // Se estiver abaixo do topo, está em drawdown
            else if (_temp__table_stats['lucro_corrente']['brl'] < _table_stats['stats__drawdown_topoHistorico']) {
                if (_temp__table_stats['drawdowns'][_temp__table_stats['drawdowns_index']] === undefined) {
                    _temp__table_stats['drawdowns'][_temp__table_stats['drawdowns_index']] = {
                        brl: 0,
                        periodo: 0,
                    };
                    _temp__table_stats['sorted_drawdowns'][_temp__table_stats['drawdowns_index']] = {
                        brl: 0,
                        periodo: 0,
                    };
                }
                let lucro__topo_diff = Math.abs(_table_stats['stats__drawdown_topoHistorico'] - Math.abs(_temp__table_stats['lucro_corrente']['brl']));
                if (lucro__topo_diff > _temp__table_stats['drawdowns'][_temp__table_stats['drawdowns_index']]['brl']) {
                    _temp__table_stats['drawdowns'][_temp__table_stats['drawdowns_index']]['brl'] = lucro__topo_diff;
                    _temp__table_stats['sorted_drawdowns'][_temp__table_stats['drawdowns_index']]['brl'] = lucro__topo_diff;
                }
                _temp__table_stats['drawdowns'][_temp__table_stats['drawdowns_index']]['periodo']++;
                _temp__table_stats['sorted_drawdowns'][_temp__table_stats['drawdowns_index']]['periodo']++;
                _table_stats['stats__drawdown'] = lucro__topo_diff;
                _table_stats['stats__drawdown_periodo']++;
            }
            // Para o DP
            _temp__table_stats['lista_resultados'].push(_ops[o].result_liquido['brl']);
            if (_simulation['R'] !== null) _temp__table_stats['lista_resultados_R'].push(divide(_ops[o].result_liquido['brl'], _simulation['R']));
            //////////////////////////////////
            // Estatisticas para os Gráficos
            //////////////////////////////////
            if (_options.get_graficoData) {
                // Para o gráfico de Resultados por Trade
                _chart_data['resultados_normalizado']['labels'].push(parseInt(o) + 1);
                _chart_data['resultados_normalizado']['data'].push(_ops[o].result_liquido['brl']);
                _chart_data['resultados_normalizado']['date'].push(`${format(parseISO(_ops[o].data), 'dd/MM/yyyy')} Trades: ${_ops[o].qtd_trades}`);
                // Para o gráfico de Evolução Patrimonial
                _chart_data['evolucao_patrimonial']['labels'].push(parseInt(o) + 1);
                _chart_data['evolucao_patrimonial']['data'].push(_temp__table_stats['lucro_corrente']['brl']);
                _chart_data['evolucao_patrimonial']['date'].push(`${format(parseISO(_ops[o].data), 'dd/MM/yyyy')} Trades: ${_ops[o].qtd_trades}`);
            }
        }
        /*------------------------ Termina processamento dos Dados -----------------------*/
        //////////////////////////////////
        // Estatisticas Gerais
        //////////////////////////////////
        // Termina de processar estatisticas de '_temp__table_stats'
        /* prettier-ignore */ _temp__table_stats['mediaGain']                = divide(_temp__table_stats['mediaGain'], (_table_stats['trades__positivo'] + _table_stats['trades__empate']));
        /* prettier-ignore */ _temp__table_stats['mediaLoss']                = divide(_temp__table_stats['mediaLoss'], _table_stats['trades__negativo']);

        // Termina de processar estatisticas do '_table_stats'

        /* prettier-ignore */ _table_stats['trades__total']                  = _ops.length;

        /* prettier-ignore */ _table_stats['trades__positivo_perc']          = (divide(_table_stats['trades__positivo'], _table_stats['trades__total']) * 100);
        /* prettier-ignore */ _table_stats['trades__negativo_perc']          = (divide(_table_stats['trades__negativo'], _table_stats['trades__total']) * 100);
        /* prettier-ignore */ _table_stats['trades__empate_perc']            = (divide(_table_stats['trades__empate'], _table_stats['trades__total']) * 100);
        /* prettier-ignore */ _table_stats['trades__max_seq_negativo']       = (_temp__table_stats['sequencias_negativo'].length) ? Math.max(..._temp__table_stats['sequencias_negativo']) : 0;
        /* prettier-ignore */ _table_stats['trades__max_seq_positivo']       = (_temp__table_stats['sequencias_positivo'].length) ? Math.max(..._temp__table_stats['sequencias_positivo']) : 0;
        /* prettier-ignore */ _table_stats['trades__max_seq_negativo_medio'] = (_temp__table_stats['sequencias_negativo'].length) ? divide(_temp__table_stats['sequencias_negativo'].reduce((a, b) => a + b, 0), _temp__table_stats['sequencias_negativo'].length) : 0;
        /* prettier-ignore */ _table_stats['trades__max_seq_positivo_medio'] = (_temp__table_stats['sequencias_positivo'].length) ? divide(_temp__table_stats['sequencias_positivo'].reduce((a, b) => a + b, 0), _temp__table_stats['sequencias_positivo'].length) : 0;

        /* prettier-ignore */ _table_stats['result__lucro_brl']              = _temp__table_stats['lucro_corrente']['brl'];
        /* prettier-ignore */ _table_stats['result__lucro_R']                = (_simulation['R'] !== null) ? divide(_temp__table_stats['lucro_corrente']['brl'], _simulation['R']) : '--';
        /* prettier-ignore */ _table_stats['result__lucro_perc']             = (_simulation['valor_inicial'] !== null) ? (divide(_temp__table_stats['lucro_corrente']['brl'], _simulation['valor_inicial']) * 100) : '--';
        /* prettier-ignore */ _table_stats['result__lucro_medio_brl']        = divide(Object.values(_temp__table_stats['lucro_por_periodo']).reduce((a, b) => a + b, 0), Object.keys(_temp__table_stats['lucro_por_periodo']).length);
        /* prettier-ignore */ _table_stats['result__lucro_medio_R']          = (_simulation['R'] !== null) ? divide(_table_stats['result__lucro_medio_brl'], _simulation['R']) : '--';
        /* prettier-ignore */ _table_stats['result__lucro_medio_perc']       = (_simulation['valor_inicial'] !== null) ? (divide(_table_stats['result__lucro_medio_brl'], _simulation['valor_inicial']) * 100) : '--';
        /* prettier-ignore */ _table_stats['result__mediaGain_brl']          = _temp__table_stats['mediaGain'];
        /* prettier-ignore */ _table_stats['result__mediaLoss_brl']          = _temp__table_stats['mediaLoss'];
        /* prettier-ignore */ _table_stats['result__mediaGain_R'] 	         = (_simulation['R'] !== null) ? divide(_temp__table_stats['mediaGain'], _simulation['R']) : '--';
        /* prettier-ignore */ _table_stats['result__mediaLoss_R']            = (_simulation['R'] !== null) ? divide(_temp__table_stats['mediaLoss'], _simulation['R']) : '--';
        /* prettier-ignore */ _table_stats['result__mediaGain_perc']         = (_simulation['valor_inicial'] !== null) ? (divide(_temp__table_stats['mediaGain'], _simulation['valor_inicial']) * 100) : '--';
        /* prettier-ignore */ _table_stats['result__mediaLoss_perc']         = (_simulation['valor_inicial'] !== null) ? (divide(_temp__table_stats['mediaLoss'], _simulation['valor_inicial']) * 100) : '--';

        /* prettier-ignore */ _table_stats['stats__retornoRiscoMedio']       = divide(_table_stats['stats__retornoRiscoMedio'], _table_stats['trades__total']);
        /* prettier-ignore */ _table_stats['stats__rrMedio']                 = divide(_temp__table_stats['mediaGain'], Math.abs(_temp__table_stats['mediaLoss']));
        /* prettier-ignore */ _table_stats['stats__breakeven']               = (divide(Math.abs(_temp__table_stats['mediaLoss']), (_temp__table_stats['mediaGain'] + Math.abs(_temp__table_stats['mediaLoss']))) * 100);
        /* prettier-ignore */ _table_stats['stats__edge']                    = _table_stats['trades__positivo_perc'] - _table_stats['stats__breakeven'];
        /* prettier-ignore */ // Calculado da forma do Tainan
        /* prettier-ignore */ _table_stats['stats__fatorLucro']              = divide((_table_stats['trades__positivo_perc'] * _table_stats['stats__rrMedio']), (100 - _table_stats['trades__positivo_perc']));
        /* prettier-ignore */ _table_stats['stats__expect_brl']              = divide(_temp__table_stats['lucro_corrente']['brl'], _table_stats['trades__total']);
        /* prettier-ignore */ _table_stats['stats__expect_R']                = (_simulation['R'] !== null) ? divide(_table_stats['stats__expect_brl'], _simulation['R']) : '--';
        /* prettier-ignore */ _table_stats['stats__expect_perc']             = (_simulation['valor_inicial'] !== null) ? (divide(_table_stats['stats__expect_brl'], _simulation['valor_inicial']) * 100) : '--';
        /* prettier-ignore */ _table_stats['stats__dp_brl']                  = desvpad(_temp__table_stats['lista_resultados'])['desvpad'];
        /* prettier-ignore */ _table_stats['stats__dp_R']                    = (_simulation['R'] !== null) ? desvpad(_temp__table_stats['lista_resultados_R'])['desvpad'] : '--';
        /* prettier-ignore */ _table_stats['stats__dp_perc']                 = (_simulation['valor_inicial'] !== null) ? (divide(_table_stats['stats__dp_brl'], _simulation['valor_inicial']) * 100) : '--';
        /* prettier-ignore */ _table_stats['stats__sqn']                     = (_simulation['R'] !== null) ? (divide(_table_stats['stats__expect_R'], _table_stats['stats__dp_R']) * Math.sqrt(_table_stats['trades__total'])) : '--';
        /* prettier-ignore */ _table_stats['stats__valorInicial_com_lucro']  = (_simulation['valor_inicial'] !== null) ? (_simulation['valor_inicial'] + _temp__table_stats['lucro_corrente']['brl']) : '--';
        /* prettier-ignore */ _table_stats['stats__stops_ruina']             = (_simulation['valor_inicial'] !== null && _simulation['R'] !== null) ? Math.floor(divide(_table_stats['stats__valorInicial_com_lucro'], _simulation['R'])) : '--';

        _temp__table_stats['sorted_drawdowns'].sort((a, b) => a.brl - b.brl);

        /* prettier-ignore */ _table_stats['stats__drawdown_qtd']            = _temp__table_stats['drawdowns'].length;
        /* prettier-ignore */ _table_stats['stats__drawdown_max']            = (_temp__table_stats['sorted_drawdowns'].length) ? _temp__table_stats['sorted_drawdowns'][_temp__table_stats['drawdowns'].length-1]['brl'] : 0.0;
        /* prettier-ignore */ _table_stats['stats__drawdown_max_periodo']    = (_temp__table_stats['sorted_drawdowns'].length) ? _temp__table_stats['sorted_drawdowns'][_temp__table_stats['drawdowns'].length-1]['periodo'] : 0.0;

        /* prettier-ignore */ _table_stats['trades__erro']                   = ((!_simulation.ignora_erro) ? _table_stats['trades__erro'] : '--');
        /* prettier-ignore */ _table_stats['trades__erro_perc']              = ((!_simulation.ignora_erro) ? (divide(_table_stats['trades__erro'], _table_stats['trades__total']) * 100) : '--');

        //////////////////////////////////
        // Estatisticas para os Gráficos
        //////////////////////////////////
        if (_options.get_graficoData) {
            //////////////////////////////////
            // Gráfico de Evolução Patrimonial
            //////////////////////////////////
            // Média móvel simples da evolução patrimonial
            SMA(_chart_data['evolucao_patrimonial']['data'], _chart_data['evolucao_patrimonial']['sma20'], 20);
            // 2 Bandas de Desvio Padrão
            BBollinger(_chart_data['evolucao_patrimonial'], 1, null, 2);
            //////////////////////////////////
            // Gráfico de Resultados Normalizados
            //////////////////////////////////
            // Gráfico de barras dos resultados + bandas superior e inferior do desvio padrao + linha de risco
            BBollinger(_chart_data['resultados_normalizado'], 1, null, 1);
            //////////////////////////////////
            // Gráfico de Resultados por Hora
            //////////////////////////////////
            let months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
                sorted_horas__unicas = Object.keys(_temp__table_stats['horas__unicas']).sort();
            for (let m = 0; m < sorted_horas__unicas.length; m++) {
                _chart_data['resultado_por_hora']['labels'].push(months[sorted_horas__unicas[m]]);
                _chart_data['resultado_por_hora']['data_result'].push(_temp__table_stats['horas__unicas'][sorted_horas__unicas[m]]['result']);
                _chart_data['resultado_por_hora']['data_qtd'].push(_temp__table_stats['horas__unicas'][sorted_horas__unicas[m]]['qtd']);
            }
            //////////////////////////////////
            // Gráfico Historico de Drawdowns
            //////////////////////////////////
            _chart_data['drawdowns']['data'] = _temp__table_stats['drawdowns'].map((o) => o.brl);
            _chart_data['drawdowns']['labels'] = Object.keys(_chart_data['drawdowns']['data']).map((o) => parseInt(o) + 1);
            BBollinger(_chart_data['drawdowns'], 1, null, 2, true, 'sup');
        }
        /*------------------------------- Retorno dos Dados ------------------------------*/
        return {
            checksum: generateHash(6),
            table_stats: _table_stats,
            table_stats__byCenario: _table_stats__byCenario,
            table_trades: _table_trades,
            table_trades__periodo_calc: _simulation.periodo_calc,
            chart_data: _chart_data,
        };
    }
};

export { generate__DashboardOps };
