import styles from './no-content.module.scss';
import React from 'react';
import { Paper, Typography } from '@mui/material';

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
        if (props?.withContainer)
            return (
                <div className={styles.wrapper_with_container}>
                    <Paper className={styles.container}>
                        <Typography className={`${styles.text} ${styles.empty_text} ${text_size}`} variant='overline'>
                            {props.empty_text}
                        </Typography>
                    </Paper>
                </div>
            );
        else
            return (
                <div className={`${styles.wrapper} ${text_padding}`}>
                    <Typography className={`${styles.text} ${styles.empty_text} ${text_size}`} variant='overline'>
                        {props.empty_text}
                    </Typography>
                </div>
            );
    }
};

export default NoContent;
