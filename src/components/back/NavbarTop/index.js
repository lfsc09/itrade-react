import { Analytics, CloudUpload, Euro, Grading, Layers, LocalAtm, Logout, Science, Search, Storage } from '@mui/icons-material';
import { AppBar, Autocomplete, Box, Container, Divider, IconButton, Paper, Stack, TextField, Toolbar, Typography } from '@mui/material';
import { matchSorter } from 'match-sorter';
import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';

import { handleLogout } from '../../../store/auth/auth-action';
import styles from './navbar-top.module.scss';

const modulos = [
    { id: 1, label: 'Ativos', url: '/daytrade/ativos', icon: <Euro fontSize='small' />, grupo: 'Ativos', sub_item: false, matches: ['ativos'] },
    {
        id: 2,
        label: 'Dashboard',
        url: '/daytrade/dashboard',
        icon: <Analytics fontSize='small' />,
        grupo: 'Renda Variável',
        sub_item: false,
        matches: ['rv dash', 'dash rv', 'dashboard rv', 'renda variavel dash', 'dash renda variavel'],
    },
    {
        id: 3,
        label: 'Novas Operações',
        url: '/daytrade/operacoes/novo',
        icon: <Layers fontSize='small' />,
        grupo: 'Renda Variável',
        sub_item: true,
        matches: ['rv novo', 'novo rv', 'nova rv', 'rv nova', 'renda variavel novo', 'novo renda variavel'],
    },
    {
        id: 4,
        label: 'Importar Operações',
        url: '/daytrade/operacoes/importar',
        icon: <CloudUpload fontSize='small' />,
        grupo: 'Renda Variável',
        sub_item: true,
        matches: ['rv importar', 'importar rv', 'renda variavel importar', 'importar renda variavel'],
    },
    {
        id: 5,
        label: 'Datasets',
        url: '/daytrade/datasets',
        icon: <Storage fontSize='small' />,
        grupo: 'Renda Variável',
        sub_item: false,
        matches: ['rv datasets', 'datasets rv', 'renda variavel datasets', 'datasets renda variavel'],
    },
    {
        id: 6,
        label: 'Gerenciamentos',
        url: '/daytrade/gerenciamentos',
        icon: <LocalAtm fontSize='small' />,
        grupo: 'Renda Variável',
        sub_item: false,
        matches: ['rv gerenciamentos', 'gerenciamentos rv', 'renda variavel gerenciamentos', 'gerenciamentos renda variavel'],
    },
    {
        id: 7,
        label: 'Cenários',
        url: '/daytrade/cenarios',
        icon: <Grading fontSize='small' />,
        grupo: 'Renda Variável',
        sub_item: false,
        matches: ['rv cenarios', 'cenarios rv', 'renda variavel cenarios', 'cenarios renda variavel'],
    },
    {
        id: 8,
        label: 'Builds',
        url: '/daytrade/builds',
        icon: <Science fontSize='small' />,
        grupo: 'Renda Variável',
        sub_item: false,
        matches: ['rv builds', 'builds rv', 'renda variavel builds', 'builds renda variavel'],
    },
];

const filterOptions = (options, { inputValue }) => matchSorter(options, inputValue, { keys: ['matches'], sorter: (rI) => rI });

const findLocationModulo = (pathname) => {
    for (let m of modulos) if (pathname === m.url) return m;
    return modulos[0];
};

const NavbarTop = () => {
    const dispatch = useDispatch();

    /***********
     * NAVIGATE
     ***********/
    const navigate = useNavigate();
    const location = useLocation();

    /*********
     * STATES
     *********/
    const [modulo, setModulo] = useState(findLocationModulo(location.pathname));

    /**********
     * HANDLERS
     **********/
    const handleModuloAutocomplete = useCallback((e, values) => {
        setModulo((prevState) => values);
    }, []);

    useEffect(() => {
        function hotkeyPress(e) {
            if (e.ctrlKey && e.keyCode === 75) {
                e.preventDefault();
                let input = document.getElementById('menu-modulos');
                input.focus();
                input.select();
                return;
            }
        }

        document.addEventListener('keydown', hotkeyPress);
        return () => document.removeEventListener('keydown', hotkeyPress);
    }, []);

    useEffect(() => {
        if (location.pathname !== modulo.url) navigate(modulo.url, { replace: true });
    }, [modulo?.id]);

    return (
        <Paper className={styles.appbar}>
            <Container maxWidth='xl'>
                <Toolbar className={styles.toolbar}>
                    <Stack direction='row' spacing={0}>
                        <Paper className={styles.search__left_section} elevation={0} sx={{ px: 1.5 }}>
                            <Search />
                        </Paper>
                        <Autocomplete
                            id='menu-modulos'
                            size='small'
                            className={styles.search__input}
                            options={modulos}
                            value={modulo}
                            disableClearable
                            autoHighlight
                            openOnFocus
                            blurOnSelect
                            onChange={handleModuloAutocomplete}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            groupBy={(option) => option.grupo}
                            getOptionLabel={(option) => option.label}
                            renderOption={(at_props, option) => (
                                <Box {...at_props} className={`${at_props.className} ${styles.search__option} ${option.sub_item ? styles.search__option_sub : ''}`}>
                                    <Stack className={styles.search__option_item} direction='row' spacing={1} sx={{ py: 1 }}>
                                        <span className={styles.search__option_item__icon}>{option.icon}</span>
                                        <span className={styles.search__option_item__label}>{option.label}</span>
                                    </Stack>
                                </Box>
                            )}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    sx={{ '& fieldset': { borderRadius: 0 } }}
                                    inputProps={{
                                        ...params.inputProps,
                                        autoComplete: 'new-password',
                                    }}
                                />
                            )}
                            filterOptions={filterOptions}
                        />
                        <Paper className={styles.search__right_section} elevation={0} sx={{ px: 1.5 }}>
                            <Typography variant='overline' color='primary'>
                                CTRL + K
                            </Typography>
                        </Paper>
                    </Stack>
                    <div className={styles.right}>
                        <Divider orientation='vertical' variant='middle' />
                        <IconButton
                            color='error'
                            onClick={() => {
                                dispatch(handleLogout());
                            }}
                        >
                            <Logout />
                        </IconButton>
                    </div>
                </Toolbar>
            </Container>
        </Paper>
    );
};

export default NavbarTop;
