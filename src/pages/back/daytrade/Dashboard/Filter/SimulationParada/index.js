import { FilterListOff } from '@mui/icons-material';
import { Button, Dialog, DialogActions, DialogContent, Divider, Grid, Stack, Typography } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import { batch } from 'react-redux';

import Input from '../../../../../../components/ui/Input';
import styles from './simulation-parada.module.scss';

const checksum_tipoParada = (tp) => {
    let checksum = '{';
    for (let key in tp) checksum += `|${key}=${tp[key]}`;
    checksum += '}';
    return checksum;
};

const transformReceivedTipoParada = (data) => {
    let newData = {};
    for (let d of data) newData[d.tipo_parada] = d.valor_parada;
    return newData;
};

/*
    Retorna um Array de objetos [{ tipo_parada: string, valor_parada: int|float }, ...]

    @props : [
        ...
        receivedTipoParada({ string: int|float }) : Valores vindos do componente pai de Tipos de Paradas
        returnTipoParada(func)                    : Função para atualizar o tipo parada do componente Pai
    ]
*/
const SimulationParada = (props) => {
    /*********
     * STATES
     *********/
    const [openDialog, setOpenDialog] = useState(false);
    const [tipoParada, setTipoParada] = useState(transformReceivedTipoParada(props.receivedTipoParada));

    /***********
     * HANDLERS
     ***********/
    const handleOpenDialog = useCallback(() => {
        setOpenDialog((prevState) => true);
    }, []);

    const handleCloseDialog = useCallback(() => {
        let newTipoParada = [];
        let newChecksum = checksum_tipoParada(tipoParada);
        for (let tp in tipoParada) newTipoParada.push({ tipo_parada: tp, valor_parada: tipoParada[tp] });
        batch(() => {
            setOpenDialog((prevState) => false);
            if (newChecksum !== props.receivedTipoParada_checksum) {
                props.returnTipoParada((prevState) => newTipoParada);
                props.returnTipoParada_checksum((prevState) => newChecksum);
            }
        });
    }, [tipoParada]);

    const handleTipoParadaInputs = useCallback(
        (e) => {
            let cpyTipoParada = { ...tipoParada };
            if (e.target.value !== '' && e.target.value > 0) cpyTipoParada[e.target.name] = e.target.value;
            else if (e.target.name in cpyTipoParada) delete cpyTipoParada[e.target.name];
            setTipoParada((prevState) => cpyTipoParada);
        },
        [tipoParada]
    );

    const handleClear = useCallback(() => {
        setTipoParada((prevState) => ({}));
    }, []);

    /*****************************************************
     * UPDATE (POR CONTA DE ALTERAÇÕES NO COMPONENTE PAI)
     *****************************************************/
    useEffect(() => {
        setTipoParada((prevState) => transformReceivedTipoParada(props.receivedTipoParada));
    }, [props.receivedTipoParada_checksum]);

    return (
        <>
            <Button variant='outlined' onClick={handleOpenDialog} fullWidth>
                Simular Tipos de Parada
            </Button>
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth='xs' fullWidth>
                <DialogContent dividers={true}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Divider textAlign='left'>
                                <Typography variant='overline' className={styles.divider_title}>
                                    No Dia
                                </Typography>
                            </Divider>
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant='overline' className={styles.group_title}>
                                N (Total)
                            </Typography>
                            <Stack direction='row' spacing={0}>
                                <Input className={styles.group_left} name='sd1' value={tipoParada?.sd1 ?? ''} placeholder='Stops' onChange={handleTipoParadaInputs} />
                                <Input className={styles.group_right} name='gd1' value={tipoParada?.gd1 ?? ''} placeholder='Gains' onChange={handleTipoParadaInputs} />
                            </Stack>
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant='overline' className={styles.group_title}>
                                N (Sequencia)
                            </Typography>
                            <Stack direction='row' spacing={0}>
                                <Input className={styles.group_left} name='sd2' value={tipoParada?.sd2 ?? ''} placeholder='Stops' onChange={handleTipoParadaInputs} />
                                <Input className={styles.group_right} name='gd2' value={tipoParada?.gd2 ?? ''} placeholder='Gains' onChange={handleTipoParadaInputs} />
                            </Stack>
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant='overline' className={styles.group_title}>
                                R$ (Final)
                            </Typography>
                            <Stack direction='row' spacing={0}>
                                <Input className={styles.group_left} name='sd3' value={tipoParada?.sd3 ?? ''} placeholder='Stops' onChange={handleTipoParadaInputs} />
                                <Input className={styles.group_right} name='gd3' value={tipoParada?.gd3 ?? ''} placeholder='Gains' onChange={handleTipoParadaInputs} />
                            </Stack>
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant='overline' className={styles.group_title}>
                                R$ (Bruto)
                            </Typography>
                            <Stack direction='row' spacing={0}>
                                <Input className={styles.group_left} name='sd4' value={tipoParada?.sd4 ?? ''} placeholder='Stops' onChange={handleTipoParadaInputs} />
                                <Input className={styles.group_right} name='gd4' value={tipoParada?.gd4 ?? ''} placeholder='Gains' onChange={handleTipoParadaInputs} />
                            </Stack>
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant='overline' className={styles.group_title}>
                                Quantidade R (Final)
                            </Typography>
                            <Stack direction='row' spacing={0}>
                                <Input className={styles.group_left} name='sd5' value={tipoParada?.sd5 ?? ''} placeholder='Stops' onChange={handleTipoParadaInputs} />
                                <Input className={styles.group_right} name='gd5' value={tipoParada?.gd5 ?? ''} placeholder='Gains' onChange={handleTipoParadaInputs} />
                            </Stack>
                        </Grid>
                        <Grid item xs={12}>
                            <Divider textAlign='left'>
                                <Typography variant='overline' className={styles.divider_title}>
                                    Na Semana
                                </Typography>
                            </Divider>
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant='overline' className={styles.group_title}>
                                N dias (Cheio)
                            </Typography>
                            <Stack direction='row' spacing={0}>
                                <Input className={styles.group_left} name='ss1' value={tipoParada?.ss1 ?? ''} placeholder='Stops' onChange={handleTipoParadaInputs} />
                                <Input className={styles.group_right} name='gs1' value={tipoParada?.gs1 ?? ''} placeholder='Gains' onChange={handleTipoParadaInputs} />
                            </Stack>
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant='overline' className={styles.group_title}>
                                N dias (Total)
                            </Typography>
                            <Stack direction='row' spacing={0}>
                                <Input className={styles.group_left} name='ss2' value={tipoParada?.ss2 ?? ''} placeholder='Stops' onChange={handleTipoParadaInputs} />
                                <Input className={styles.group_right} name='gs2' value={tipoParada?.gs2 ?? ''} placeholder='Gains' onChange={handleTipoParadaInputs} />
                            </Stack>
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant='overline' className={styles.group_title}>
                                N dias (Sequencia)
                            </Typography>
                            <Stack direction='row' spacing={0}>
                                <Input className={styles.group_left} name='ss3' value={tipoParada?.ss3 ?? ''} placeholder='Stops' onChange={handleTipoParadaInputs} />
                                <Input className={styles.group_right} name='gs3' value={tipoParada?.gs3 ?? ''} placeholder='Gains' onChange={handleTipoParadaInputs} />
                            </Stack>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ px: 2 }}>
                    <Button onClick={handleClear} endIcon={<FilterListOff />}>
                        Limpar Tudo
                    </Button>
                    <Button className={styles.action_clear} onClick={handleCloseDialog}>
                        Fechar
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default SimulationParada;
