import { createSlice } from '@reduxjs/toolkit';
import * as asyncThunk from './auth-thunk';

const initialState = {
    user: undefined,
    token: undefined,
    isLoading: false,
};

const authSlice = createSlice({
    name: 'auth',
    initialState: initialState,
    reducers: {
        setUserFromLocalToken: (state, { payload }) => {
            state.token = payload.token;
            state.user = payload.user;
        },
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

export const { logout, setUserFromLocalToken } = authSlice.actions;

export default authSlice.reducer;
