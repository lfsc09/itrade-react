import InputUnstyled from '@mui/base/InputUnstyled';
import React, { forwardRef } from 'react';

import styles from './input.module.scss';

/*
    @props : [
        ...
        addedClasses(array) : Custom classes a serem adicionadas aos componentes internos
        [
            root(key)  : String com as classes sendo adicionadas ao root
            input(key) : String com as classes sendo adicionadas ao input
        ]
    ]
*/
const Input = forwardRef((props, ref) => {
    const { addedClasses, ...other } = props;

    return (
        <InputUnstyled
            componentsProps={{ root: { className: `${styles.u_container} ${addedClasses?.root ?? ''}` }, input: { className: `${styles.u_input} ${addedClasses?.input ?? ''}` } }}
            {...other}
            ref={ref}
        />
    );
});

export default Input;
