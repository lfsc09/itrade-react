import InputUnstyled from '@mui/base/InputUnstyled';
import React, { forwardRef } from 'react';

import styles from './input.module.scss';

/*
    @props : [
        ...
        extraClasses([textAlign__center, inputSize__small]) : Classes extras que podem ser passadas
    ]
*/
const Input = forwardRef((props, ref) => {
    const { extraClasses, addedClasses, ...other } = props;
    const processed_classes = extraClasses?.map((exC) => styles?.[exC] ?? '')?.join(' ') ?? '';

    return (
        <InputUnstyled
            componentsProps={{ root: { className: styles.u_container }, input: { className: `${styles.u_input} ${processed_classes} ${props?.addedClasses ?? ''}` } }}
            {...other}
            ref={ref}
        />
    );
});

export default Input;
