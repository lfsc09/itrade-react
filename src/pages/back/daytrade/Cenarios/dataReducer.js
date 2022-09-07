export const TYPES = {
    STOP_LOADING: 0,
    ROWS_UPDATED__FETCH: 1,
    ROWS_UPDATED: 2,
    ROW_UPDATED: 3,
};

export const INI_STATE = {
    // Dados
    rows: [],
    // Dados originais do Fetch
    originalRows: [],
    isLoading: true,
};

export const reducer = (state, action) => {
    switch (action.type) {
        case TYPES.STOP_LOADING:
            return {
                rows: [...{ ...state.rows, observacoes: [...state.rows.observacoes] }],
                originalRows: [...{ ...state.originalRows, observacoes: [...state.originalRows.observacoes] }],
                isLoading: false,
            };
        case TYPES.ROWS_UPDATED__FETCH:
            return {
                rows: action.payload,
                originalRows: action.payload,
                isLoading: false,
            };
        case TYPES.ROWS_UPDATED:
            return {
                ...state,
                originalRows: [...{ ...state.originalRows, observacoes: [...state.originalRows.observacoes] }],
                rows: action.payload,
            };
        case TYPES.ROW_UPDATED:
            const newRows = [];
            for (let row of state.rows) {
                newRows.push(row.id === action.payload.id ? action.payload : { ...row, observacoes: [...row.observacoes] });
            }
            return {
                ...state,
                originalRows: [...{ ...state.originalRows, observacoes: [...state.originalRows.observacoes] }],
                rows: newRows,
            };
        default:
            return state;
    }
};
