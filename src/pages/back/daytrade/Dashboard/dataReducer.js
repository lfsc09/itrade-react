import cloneDeep from 'lodash.clonedeep';

export const TYPES = {
    STEP1_LOAD: 0,
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
        default:
            return state;
    }
};
