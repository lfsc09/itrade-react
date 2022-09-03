import InputUnstyled from '@mui/base/InputUnstyled';
import React, { forwardRef } from 'react';

import styles from './input.module.scss';

const Input = forwardRef((props, ref) => {
    return <InputUnstyled componentsProps={{ input: { className: `${styles.u_input}` } }} {...props} ref={ref} />;
});

export default Input;
