import cloneDeep from 'lodash.clonedeep';

export const TYPES = {
    STEP1_LOAD: 0,
    STEP2_LOAD: 1,
    FILTERS_CHANGED: 2,
};

export const INI_STATE = {
    // Dados
    datasets: [],
    ativos: null,
    gerenciamentos: null,
    cenarios: null,
    originalInfo: null,
    // Filtros
    filters: null,
    filters_checksum: null,
    // Simulações
    simulations: null,
    simulations_checksum: null,
};

export const checksum_filters = (f) => {
    if (f === null) return '';
    let checksum = '';
    if ('data_inicial' in f) checksum += `&di=${f.data_inicial}`;
    if ('data_final' in f) checksum += `&df=${f.data_final}`;
    if ('hora_inicial' in f) checksum += `&hi=${f.hora_inicial}`;
    if ('hora_final' in f) checksum += `&hf=${f.hora_final}`;
    if ('ativo' in f) {
        checksum += '&at={';
        for (let val of f.ativo) checksum += `|${val.label}`;
        checksum += '}';
    }
    if ('cenario' in f) {
        checksum += '&cen={';
        for (let cen in f.cenario) {
            checksum += `|${cen}={`;
            for (let obs in f.cenario[cen].observacoes) checksum += `|${obs}=${f.cenario[cen].observacoes[obs]}`;
            checksum += '}';
        }
        checksum += '}';
    }
    return checksum;
};

export const checksum_simulations = (s) => {
    if (s === null) return '';
    let checksum = '';
    if ('periodo_calc' in s) checksum += `&pc=${s.periodo_calc}`;
    if ('usa_custo' in s) checksum += `&uc=${s.usa_custo}`;
    if ('ignora_erro' in s) checksum += `&ie=${s.ignora_erro}`;
    if ('tipo_cts' in s) checksum += `&tcts=${s.tipo_cts}`;
    if ('cts' in s) checksum += `&cts=${s.cts}`;
    if ('tipo_parada' in s) {
        checksum += '&tp={';
        for (let val of s.tipo_parada) checksum += `|${val.tipo_parada}=${val.valor_parada}`;
        checksum += '}';
    }
    if ('valor_inicial' in s) checksum += `&vi=${s.valor_inicial}`;
    if ('R' in s) checksum += `&R=${s.R}`;
    return checksum;
};

export const reducer = (state, action) => {
    switch (action.type) {
        case TYPES.STEP1_LOAD:
            return {
                datasets: action.payload.datasets,
                ativos: state.ativos,
                gerenciamentos: state.gerenciamentos,
                cenarios: state.cenarios,
                originalInfo: state.originalInfo,
                filters: action.payload.filters,
                filters_checksum: checksum_filters(action.payload.filters),
                simulations: action.payload.simulations,
                simulations_checksum: checksum_simulations(action.payload.simulations),
            };
        case TYPES.STEP2_LOAD:
            return {
                datasets: cloneDeep(state.datasets),
                ativos: action.payload.ativos,
                gerenciamentos: action.payload.gerenciamentos,
                cenarios: action.payload.cenarios,
                originalInfo: action.payload.originalInfo,
                filters: action.payload?.filters ?? cloneDeep(state.filters),
                filters_checksum: 'filters' in action.payload ? checksum_filters(action.payload.filters) : state.filters_checksum,
                simulations: action.payload?.simulations ?? cloneDeep(state.simulations),
                simulations_checksum: 'simulations' in action.payload ? checksum_simulations(action.payload.simulations) : state.simulations_checksum,
            };
        case TYPES.FILTERS_CHANGED:
            return {
                datasets: cloneDeep(state.datasets),
                ativos: cloneDeep(state.ativos),
                gerenciamentos: cloneDeep(state.gerenciamentos),
                cenarios: cloneDeep(state.cenarios),
                originalInfo: cloneDeep(state.originalInfo),
                filters: action.payload.filters,
                filters_checksum: checksum_filters(action.payload.filters),
                simulations: action.payload.simulations,
                simulations_checksum: checksum_simulations(action.payload.simulations),
            };
        default:
            return state;
    }
};
