import React from 'react';
import { Cookie } from '@mui/icons-material';

import styles from './fetching-content.module.scss';

const FetchingContent = () => {
    return (
        <div className={styles.wrapper}>
            <div className={styles.container}>
                <Cookie />
                <div className={styles.text}>FETCHING...</div>
            </div>
        </div>
    );
};

export default FetchingContent;
