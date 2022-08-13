import { createSlice } from '@reduxjs/toolkit';
import { generateHash } from '../../helpers/global';

const initialState = {
    snacks: [],
};

const snackMessagesSlice = createSlice({
    name: 'snackMessages',
    initialState: initialState,
    reducers: {
        add: (state, { payload: { message, severity } }) => {
            state.snacks.push({
                key: generateHash(8),
                message: message,
                severity: severity,
            });
        },
        remove: (state, { payload }) => {
            state.snacks = state.snacks.filter((item) => item.key !== payload);
        },
    },
});

export const { add, remove } = snackMessagesSlice.actions;

export default snackMessagesSlice.reducer;
