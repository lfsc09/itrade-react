import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    snacks: [],
};

const snackMessagesSlice = createSlice({
    name: 'snackMessages',
    initialState: initialState,
    reducers: {
        add: (state, { payload: { key, message, severity } }) => {
            state.snacks.push({
                key: key,
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
