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
    // Simulações
    simulations: null,
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
                simulations: action.payload.simulations,
            };
        case TYPES.STEP2_LOAD:
            return {
                datasets: cloneDeep(state.datasets),
                ativos: action.payload.ativos,
                gerenciamentos: action.payload.gerenciamentos,
                cenarios: action.payload.cenarios,
                originalInfo: action.payload.originalInfo,
                filters: action.payload?.filters ?? cloneDeep(state.filters),
                simulations: action.payload?.simulations ?? cloneDeep(state.simulations),
            };
        case TYPES.FILTERS_CHANGED:
            return {
                datasets: cloneDeep(state.datasets),
                ativos: cloneDeep(state.ativos),
                gerenciamentos: cloneDeep(state.gerenciamentos),
                cenarios: cloneDeep(state.cenarios),
                originalInfo: cloneDeep(state.originalInfo),
                filters: action.payload.filters,
                simulations: action.payload.simulations,
            };
        default:
            return state;
    }
};
