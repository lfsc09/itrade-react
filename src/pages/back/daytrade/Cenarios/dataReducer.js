import cloneDeep from 'lodash.clonedeep';

export const TYPES = {
    ROWS_UPDATED__FETCH: 0,
    ROWS_UPDATED: 1,
    ROW_UPDATED: 2,
    ROW_DELETE: 3,
};

export const INI_STATE = {
    // Dados
    rows: [],
    // Dados originais do Fetch
    originalRows: [],
};

export const reducer = (state, action) => {
    let newRows;
    switch (action.type) {
        case TYPES.ROWS_UPDATED__FETCH:
            return {
                rows: action.payload,
                originalRows: action.payload,
            };
        case TYPES.ROWS_UPDATED:
            return {
                originalRows: cloneDeep(state.originalRows),
                rows: action.payload,
            };
        case TYPES.ROW_UPDATED:
            newRows = [];
            for (let row of state.rows) newRows.push(row.id === action.payload.id ? action.payload : { ...row, observacoes: [...row.observacoes] });
            return {
                originalRows: cloneDeep(state.originalRows),
                rows: newRows,
            };
        case TYPES.ROW_DELETE:
            newRows = state.rows.filter((row) => row.id !== action.payload);
            return {
                originalRows: cloneDeep(state.originalRows),
                rows: newRows,
            };
        default:
            return state;
    }
};
