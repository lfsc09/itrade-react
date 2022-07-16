import React, { useContext, useState } from 'react';
import { Stack, TextField } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { Send } from '@mui/icons-material';
import { useFormik } from 'formik';
import SnackOverlay from '../ui/SnackOverlay';
import * as yup from 'yup';
import axiosCon from '../../helpers/axiosCon';
import cryptoJS from 'crypto-js';
import { LoginContext } from '../../ctx/AuthContext';

const validationLoginSchema = yup.object({
    usuario: yup.string().trim().required('Informe seu usuário'),
    password: yup.string().trim().required('Informe sua senha'),
});

const LoginForm = () => {
    /**********
     * CONTEXT
     **********/
    const { handleLogin } = useContext(LoginContext);

    /*********
     * STATES
     *********/
    //Gerenciar 'loading' no botao de Submit
    const [sendLoading, setSendLoading] = useState(false);
    //Gerenciar overlay snack de resposta do Axios
    const [openAxiosSnack, setOpenAxiosSnack] = useState({});

    /************
     * HANDLERS
     ************/
    const handlerCloseSnack = () => {
        setOpenAxiosSnack({});
    };

    /********
     * FORMS
     ********/
    const formik = useFormik({
        initialValues: {
            usuario: '',
            password: '',
        },
        validationSchema: validationLoginSchema,
        onSubmit: (values) => {
            setSendLoading(true);
            axiosCon
                .post('/auth', {
                    usuario: values.usuario,
                    password: cryptoJS.SHA256(values.password).toString(),
                })
                .then((resp) => {
                    setSendLoading(false);
                    handleLogin(resp.data.token);
                })
                .catch((error) => {
                    setSendLoading(false);
                    if (error.response) {
                        if (error.response.status === 401)
                            setOpenAxiosSnack({
                                message: 'Credenciais inexistentes',
                            });
                    } else {
                        setOpenAxiosSnack({
                            message: error.message,
                        });
                    }
                });
        },
    });

    return (
        <>
            {Object.keys(openAxiosSnack).length > 0 && (
                <SnackOverlay open={true} severity='error' onClose={handlerCloseSnack}>
                    {openAxiosSnack.message}
                </SnackOverlay>
            )}
            <form onSubmit={formik.handleSubmit}>
                <Stack spacing={2} minWidth={250}>
                    <TextField
                        label='User'
                        id='usuario'
                        name='usuario'
                        autoFocus
                        value={formik.values.usuario}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.usuario && Boolean(formik.errors.usuario)}
                        helperText={formik.touched.usuario && formik.errors.usuario}
                    />
                    <TextField
                        label='Password'
                        id='password'
                        name='password'
                        type='password'
                        value={formik.values.password}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.password && Boolean(formik.errors.password)}
                        helperText={formik.touched.password && formik.errors.password}
                    />
                    <LoadingButton loading={sendLoading} variant='contained' color='primary' type='submit' endIcon={<Send />}>
                        Enviar
                    </LoadingButton>
                </Stack>
            </form>
        </>
    );
};

export default LoginForm;
