import { Paper, Typography } from '@mui/material';
import React from 'react';

import styles from './no-content.module.scss';

/*
    Componente de 'Sem Conteúdo'.

    @props : [
        ...
        type(img|under-construction|empty-data) : Tipos diferentes de mostrar a falta de contudo
        {
            Se 'empty-data' aceita tambem os props:
                text_size(small)          : Para reduzir a fonte da msg passada
                text_padding(1|2)         : Para modificar o padding da msg
                text_bold(true|false)     : Para modificar o peso da fonte da msg
                text_color(black|'')      : Para modificar a cor da fonte da msg
                empty_text                : Msg que irá mostrar
                withContainer(true|false) : Se irá adicionar um container de wrapper ou não
        }
    ]
*/
const NoContent = (props) => {
    if (props.type === 'img') return <div>Image not Found</div>;
    if (props.type === 'under-construction')
        return (
            <div className={styles.wrapper}>
                <img className={styles.not_found_content} alt='No Content' src={require('../../../assets/back/img/not-found-content.png')} />
                <Typography className={styles.text} variant='overline'>
                    No Content
                </Typography>
            </div>
        );
    if (props.type === 'empty-data') {
        const text_size = props?.text_size === 'small' ? styles.text_small : '';
        const text_padding = props?.text_padding !== '' ? styles[`text_padding_${props?.text_padding}`] : '';
        const text_bold = props?.text_bold === true ? styles.text_bold : '';
        const text_color = props?.text_color !== '' ? styles[`text_color_${props?.text_color}`] : '';
        if (props?.withContainer)
            return (
                <div className={styles.wrapper_with_container}>
                    <Paper className={styles.container}>
                        <Typography className={`${styles.text} ${styles.empty_text} ${text_size} ${text_bold} ${text_color}`} variant='overline'>
                            {props.empty_text}
                        </Typography>
                    </Paper>
                </div>
            );
        else
            return (
                <div className={`${styles.wrapper} ${text_padding}`}>
                    <Typography className={`${styles.text} ${styles.empty_text} ${text_size}  ${text_bold} ${text_color}`} variant='overline'>
                        {props.empty_text}
                    </Typography>
                </div>
            );
    }
};

export default NoContent;
