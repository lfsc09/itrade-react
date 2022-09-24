import cloneDeep from 'lodash.clonedeep';

export const TYPES = {
    STEP1_LOAD: 0,
    STEP2_LOAD: 1,
    FILTERS_CHANGED: 2,
};

export const INI_STATE = {
    // Dados
    datasets: [],
    cenarios: [],
    operacoes_p_dataset: [],
    // Filtros
    filters: {},
    // Simulações
    simulations: {},
};

export const reducer = (state, action) => {
    switch (action.type) {
        case TYPES.STEP1_LOAD:
            return {
                datasets: action.payload.datasets,
                cenarios: [],
                operacoes_p_dataset: [],
                filters: action.payload.filters,
                simulations: action.payload.simulations,
            };
        case TYPES.FILTERS_CHANGED:
            return {
                datasets: cloneDeep(state.datasets),
                cenarios: cloneDeep(state.cenarios),
                operacoes_p_dataset: cloneDeep(state.operacoes_p_dataset),
                filters: action.payload.filters,
                simulations: action.payload.simulations,
            };
        default:
            return state;
    }
};
