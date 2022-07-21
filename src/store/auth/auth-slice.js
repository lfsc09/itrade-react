import { createSlice } from '@reduxjs/toolkit';
import * as asyncThunk from './auth-thunk';

const initialState = {
    user: null,
    token: null,
    isLoading: false,
};

const authSlice = createSlice({
    name: 'auth',
    initialState: initialState,
    reducers: {
        logout: (state) => {
            state.user = null;
            state.token = null;
        },
    },
    extraReducers: {
        [asyncThunk.login.pending]: (state) => {
            state.isLoading = true;
        },
        [asyncThunk.login.fulfilled]: (state, { payload }) => {
            state.isLoading = false;
            state.token = payload.token;
            state.user = payload.user;
        },
        [asyncThunk.login.rejected]: (state) => {
            state.isLoading = false;
        },
    },
});

export const { logout } = authSlice.actions;

export default authSlice.reducer;
