import React from 'react';
import { Stack, TextField } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { Send } from '@mui/icons-material';
import { useFormik } from 'formik';
import SnackOverlay from '../ui/SnackOverlay';
import * as yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../../store/auth/auth-thunk';
import { remove } from '../../store/snack-messages/snack-messages-slice';

const validationLoginSchema = yup.object({
    usuario: yup.string().trim().required('Informe seu usuário'),
    password: yup.string().trim().required('Informe sua senha'),
});

const LoginForm = () => {
    /**********
     * DISPATCH
     **********/
    const dispatch = useDispatch();

    /*********
     * STATES
     *********/
    const { isLoading } = useSelector((store) => store.auth);
    const { snacks } = useSelector((store) => store.snackMessages);

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
            dispatch(login(values));
        },
    });

    return (
        <>
            {snacks.map((item) => (
                <SnackOverlay key={item.key} open={true} severity={item.severity} onClose={() => dispatch(remove(item.key))}>
                    {item.message}
                </SnackOverlay>
            ))}
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
                    <LoadingButton loading={isLoading} variant='contained' color='primary' type='submit' endIcon={<Send />}>
                        Enviar
                    </LoadingButton>
                </Stack>
            </form>
        </>
    );
};

export default LoginForm;
