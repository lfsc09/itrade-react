import { List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

import NoContent from '../../../../../../components/ui/NoContent';
import styles from './observacoes-painel.module.scss';

const ObservacoesPainal = (props) => {
    let cenarioIndex = props.cenario !== '' && props.cenarios.length > 0 ? props.cenarios.findIndex((c) => c.nome === props.cenario) : null;

    return cenarioIndex !== null && props.cenarios[cenarioIndex].observacoes.length > 0 ? (
        <div className={styles.wrapper}>
            <List dense sx={{ p: 0 }}>
                {props.cenarios[cenarioIndex].observacoes.map((o) => (
                    <ListItem key={`obs_${o.id}`} className={styles.list_item}>
                        <ListItemIcon className={styles.list_item__ref}>{o.ref}</ListItemIcon>
                        <ListItemText className={styles.list_item__text} primary={o.nome} />
                    </ListItem>
                ))}
            </List>
        </div>
    ) : (
        <NoContent type='empty-data' empty_text='Nada a mostrar' text_color='black' text_bold={true} text_size='small' />
    );
};

export default ObservacoesPainal;
