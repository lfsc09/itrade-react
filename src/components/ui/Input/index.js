import { styled } from '@mui/system';
import React, { forwardRef } from 'react';
import InputUnstyled from '@mui/base/InputUnstyled';

const StyledInput = styled('input')(
    () =>
        `
            font-family: IBM Plex Sans, sans-serif;
            font-size: 0.875rem;
            font-weight: 400;
            line-height: 1.5;
            padding: 6px;
            width: 100%;
            border-radius: 4px;
            color: #1a2027;
            background: #fff;
            border: 1px solid #e0e3e7;
            box-shadow: 0px 2px 2px #f3f6f9;

            &:hover {
                border-color: #3399ff;
            }

            &:focus {
                border-color: #3399ff;
                outline: 3px solid #80bfff;
            }
        `
);

const Input = forwardRef((props, ref) => {
    return <InputUnstyled components={{ Input: StyledInput }} {...props} ref={ref} />;
});

export default Input;
