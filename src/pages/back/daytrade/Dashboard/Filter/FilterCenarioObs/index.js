import {
    Button,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    Divider,
    FormControl,
    FormControlLabel,
    FormGroup,
    FormLabel,
    Grid,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    ListSubheader,
    Switch,
} from '@mui/material';
import cloneDeep from 'lodash.clonedeep';
import React, { useCallback, useState } from 'react';

import NoContent from '../../../../../../components/ui/NoContent';
import { isObjectEmpty } from '../../../../../../helpers/global';
import styles from './filter-cenario-obs.module.scss';

const FilterCenarioObs = (props) => {
    /*********
     * STATES
     *********/
    const [openDialog, setOpenDialog] = useState(false);
    const [cenario, setCenario] = useState(props.receivedCenario);

    /*******
     * VARS
     *******/
    let isEmptyCenario = isObjectEmpty(cenario);

    /***********
     * HANDLERS
     ***********/
    const handleOpenDialog = useCallback(() => {
        setOpenDialog((prevState) => true);
    }, []);

    const handleCloseDialog = useCallback(() => {
        let cpyCenario = cloneDeep(cenario);
        setOpenDialog((prevState) => false);
        props.returnCenario((prevState) => cpyCenario);
    }, [cenario]);

    const handleCenarioSeletionChange = useCallback(
        (e) => {
            let cpyCenario = cloneDeep(cenario);
            const cIndx = props.cenarios.findIndex((v) => v.nome);
            if (e.target.checked) cpyCenario[e.target.name] = { id: props.cenarios[cIndx].id, observacoes: {} };
            else delete cpyCenario[e.target.name];
            setCenario((prevState) => cpyCenario);
        },
        [cenario, props.cenarios]
    );

    const handleObsSeletionChange = useCallback(
        (c_nome, o_ref) => {
            let cpyCenario = cloneDeep(cenario);
            if (!(o_ref in cpyCenario[c_nome].observacoes)) cpyCenario[c_nome].observacoes[o_ref] = false;
            else delete cpyCenario[c_nome].observacoes[o_ref];
            setCenario((prevState) => cpyCenario);
        },
        [cenario]
    );

    const handleObsNegaChange = useCallback(
        (c_nome, o_ref) => {
            let cpyCenario = cloneDeep(cenario);
            if (!(o_ref in cpyCenario[c_nome].observacoes)) cpyCenario[c_nome].observacoes[o_ref] = true;
            else cpyCenario[c_nome].observacoes[o_ref] = !cpyCenario[c_nome].observacoes[o_ref];
            setCenario((prevState) => cpyCenario);
        },
        [cenario]
    );

    /********
     * FUNCS
     ********/
    const showCenarioInfo = useCallback(() => {
        let label = [];
        for (let c in cenario) {
            let selObs = Object.keys(cenario[c].observacoes).join(',');
            label.push(`${c}${selObs !== '' ? `(${selObs})` : ''}`);
        }
        return label.join(', ');
    }, [cenario]);

    return (
        <>
            <Button variant='outlined' onClick={handleOpenDialog} fullWidth>
                {isEmptyCenario ? 'Filtrar os Cenários' : showCenarioInfo()}
            </Button>
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth='md' fullWidth>
                <DialogContent dividers={true}>
                    <Grid container spacing={2}>
                        <Grid item md={3} xs={12}>
                            <FormControl component='fieldset' variant='standard' sx={{ m: 2 }}>
                                <FormLabel component='legend'>Cenários</FormLabel>
                                <FormGroup>
                                    {props.cenarios.map((c) => (
                                        <FormControlLabel
                                            key={`cenarios-${c.id}`}
                                            control={<Checkbox checked={c.nome in cenario} onChange={handleCenarioSeletionChange} name={c.nome} />}
                                            label={c.nome}
                                        />
                                    ))}
                                </FormGroup>
                            </FormControl>
                        </Grid>
                        <Grid item md={1} xs={12}>
                            <Divider orientation='vertical' variant='middle' />
                        </Grid>
                        <Grid item md={8} xs={12}>
                            {!isEmptyCenario ? (
                                <List>
                                    {props.cenarios.map((c) =>
                                        c.nome in cenario ? (
                                            <li key={`list-${c.id}`}>
                                                <ul className={styles.obs_container}>
                                                    <ListSubheader>{c.nome}</ListSubheader>
                                                    {c.observacoes.map((o) => (
                                                        <ListItem
                                                            key={`list-obs-${o.id}`}
                                                            secondaryAction={
                                                                <Switch
                                                                    edge='end'
                                                                    size='small'
                                                                    color='error'
                                                                    onChange={() => handleObsNegaChange(c.nome, o.ref)}
                                                                    checked={o.ref in cenario[c.nome].observacoes && cenario[c.nome].observacoes[o.ref]}
                                                                />
                                                            }
                                                            disablePadding
                                                        >
                                                            <ListItemButton
                                                                dense={true}
                                                                className={`${styles.obs_item} ${o.ref in cenario[c.nome].observacoes ? styles.obs_item__selected : ''}`}
                                                                onClick={() => handleObsSeletionChange(c.nome, o.ref)}
                                                            >
                                                                <ListItemText
                                                                    primary={
                                                                        <div>
                                                                            <span className={styles.obs__ref}>{o.ref} - </span>
                                                                            <span className={styles.obs__nome}>{o.nome}</span>
                                                                        </div>
                                                                    }
                                                                />
                                                            </ListItemButton>
                                                        </ListItem>
                                                    ))}
                                                </ul>
                                            </li>
                                        ) : (
                                            <React.Fragment key={`list-${c.id}`}></React.Fragment>
                                        )
                                    )}
                                </List>
                            ) : (
                                <NoContent type='empty-data' empty_text='Nenhum cenário selecionado' />
                            )}
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ px: 2 }}>
                    <Button onClick={handleCloseDialog}>Fechar</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default FilterCenarioObs;
