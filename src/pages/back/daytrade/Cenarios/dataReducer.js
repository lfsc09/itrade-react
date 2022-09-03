export const TYPES = {
    STOP_LOADING: 0,
    SORTMODEL_CHANGE: 1,
    ROWS_UPDATED: 2,
    DELETE_CONFIRM: 3,
    FORCE_RELOAD: 4,
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
        case TYPES.DELETE_CONFIRM:
            return {
                ...state,
                idRowDeleteConfirm: action.payload,
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
