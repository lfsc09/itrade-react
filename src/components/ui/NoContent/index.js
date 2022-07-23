import styles from './no-content.module.css';
import React from 'react';
import { Typography } from '@mui/material';

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
};

export default NoContent;
