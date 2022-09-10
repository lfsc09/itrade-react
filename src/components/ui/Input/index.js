import InputUnstyled from '@mui/base/InputUnstyled';
import React, { forwardRef } from 'react';

import styles from './input.module.scss';

const Input = forwardRef((props, ref) => {
    const { extraClasses, ...other } = props;
    const processed_classes = extraClasses?.map((exC) => styles?.[exC] ?? '')?.join(' ') ?? '';

    return <InputUnstyled componentsProps={{ root: { className: styles.u_container }, input: { className: `${styles.u_input} ${processed_classes}` } }} {...other} ref={ref} />;
});

export default Input;
