import { createAsyncThunk } from '@reduxjs/toolkit';
import { add } from '../snack-messages/snack-messages-slice';
import cryptoJS from 'crypto-js';
import jwtDecode from 'jwt-decode';
import axiosCon from '../../helpers/axios-con';
import { generateHash } from '../../helpers/global';

const login = createAsyncThunk('auth/login', async ({ usuario, password }, { dispatch, rejectWithValue }) => {
    return axiosCon
        .post('/auth', {
            usuario: usuario,
            password: cryptoJS.SHA256(password).toString(),
        })
        .then((resp) => {
            const token = resp.data.token;

            localStorage.setItem('token', token);
            axiosCon.defaults.headers.Authorization = `Bearer ${token}`;

            return {
                user: jwtDecode(token),
                token: token,
            };
        })
        .catch((error) => {
            if (error.response) {
                if (error.response.status === 401)
                    dispatch(
                        add({
                            key: generateHash(8),
                            message: 'Credenciais inexistentes',
                            severity: 'error',
                        })
                    );
            } else {
                dispatch(
                    add({
                        key: generateHash(8),
                        message: error.message,
                        severity: 'error',
                    })
                );
            }
            return rejectWithValue();
        });
});

export { login };
