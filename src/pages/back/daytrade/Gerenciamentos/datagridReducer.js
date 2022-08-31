export const TYPES = {
    STOP_LOADING: 0,
    PAGE_CHANGE: 1,
    SORTMODEL_CHANGE: 2,
    ROWS_UPDATED: 3,
    FILTERS_CHANGED: 4,
    FILTERS_CLEAR: 5,
    DELETE_CONFIRM: 6,
    CHANGE_FILTER_MODAL_STATE: 7,
    FORCE_RELOAD: 8,
};

export const INI_STATE = {
    // Linhas da tabela
    rows: [],
    // Quantidade total de linhas (O datagrid não mostra a quantidade filtrada de dados em relação ao total)
    rowCount: 0,
    isLoading: true,
    // Index da pagina atual
    page: 0,
    // Quantidade de linhas por pagina
    pageSize: 100,
    // Se mostra ou não o Modal de Filtros do Datagrid
    isFilterModalOpen: false,
    // Conversão dos nomes de cada tipo de filtro (Usado apenas na construção dos 'Chips')
    filters_lib: {},
    filters: {},
    // Modelo inicial de ordenação
    sortingModel: [{ field: 'nome', sort: 'asc' }],
    // ID da row a ser deletada (Usado no Confirm Dialog)
    idRowDeleteConfirm: null,
    // Para forçar o recarregamento
    forceReloadDatagrid: false,
};

export const reducer = (state, action) => {
    switch (action.type) {
        case TYPES.STOP_LOADING:
            return {
                ...state,
                isLoading: false,
            };
        case TYPES.PAGE_CHANGE:
            return {
                ...state,
                isLoading: true,
                page: action.payload,
            };
        case TYPES.SORTMODEL_CHANGE:
            return {
                ...state,
                isLoading: true,
                sortingModel: action.payload,
            };
        case TYPES.ROWS_UPDATED:
            return {
                ...state,
                rows: action.payload.rows,
                rowCount: action.payload.rowCount,
                isLoading: false,
                forceReloadDatagrid: false,
            };
        case TYPES.FILTERS_CHANGED:
            return {
                ...state,
                filters: action.payload,
                isFilterModalOpen: false,
            };
        case TYPES.FILTERS_CLEAR:
            return {
                ...state,
                filters: {},
                isFilterModalOpen: false,
            };
        case TYPES.DELETE_CONFIRM:
            return {
                ...state,
                idRowDeleteConfirm: action.payload,
            };
        case TYPES.CHANGE_FILTER_MODAL_STATE:
            return {
                ...state,
                isFilterModalOpen: action.payload,
            };
        case TYPES.FORCE_RELOAD:
            return {
                ...state,
                forceReloadDatagrid: true,
            };
        default:
            return state;
    }
};
