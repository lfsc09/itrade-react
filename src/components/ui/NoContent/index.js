import { Paper, Typography } from '@mui/material';
import React from 'react';

import styles from './no-content.module.scss';

/*
    Componente de 'Sem Conteúdo'.

    @props : [
        ...
        type(img|under-construction|empty-data) : Tipos diferentes de mostrar a falta de contudo
        empty_text(string|component)            : Texto ou componente a ser colocado
        addedClasses(array)                     : Custom classes a serem adicionadas aos componentes internos
        [
            wrapper(key)   : String com as classes sendo adicionadas ao Wrapper ou Wrapper_with_container
            container(key) : String com as classes sendo adicionadas ao Container (Se tiver)
            text(key)      : String com as classes sendo adicionadas ao Typography
        ]
        withContainer(true|false)               : Se irá adicionar um container de wrapper ou não
    ]
*/
const NoContent = (props) => {
    const { type, empty_text, addedClasses, withContainer } = props;

    if (type === undefined) return <></>;
    if (type === 'img') return <div>Image not Found</div>;
    if (type === 'under-construction')
        return (
            <div className={`${styles.wrapper} ${addedClasses?.wrapper ?? ''}`}>
                <img className={`${styles.not_found_content}`} alt='No Content' src={require('../../../assets/back/img/not-found-content.png')} />
                <Typography className={`${styles.text} ${addedClasses?.text ?? ''}`} variant='overline'>
                    No Content
                </Typography>
            </div>
        );
    if (type === 'empty-data') {
        if (withContainer === true)
            return (
                <div className={`${styles.wrapper_with_container} ${addedClasses?.wrapper ?? ''}`}>
                    <Paper className={`${styles.container} ${addedClasses?.container ?? ''}`}>
                        <Typography className={`${styles.text} ${styles.empty_text} ${addedClasses?.text ?? ''}`} variant='overline'>
                            {empty_text}
                        </Typography>
                    </Paper>
                </div>
            );
        else
            return (
                <div className={`${styles.wrapper} ${addedClasses?.wrapper ?? ''}`}>
                    <Typography className={`${styles.text} ${styles.empty_text} ${addedClasses?.text ?? ''}`} variant='overline'>
                        {empty_text}
                    </Typography>
                </div>
            );
    }
};

export default NoContent;
