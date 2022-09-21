import React from 'react';
import ReactDOM from 'react-dom';
import { Alert, Snackbar } from '@mui/material';

const SnackOverlay = (props) => {
    return (
        <>
            {ReactDOM.createPortal(
                <Snackbar
                    open={'open' in props ? props.open : false}
                    autoHideDuration={'autoHideDuration' in props ? props.autoHideDuration : 4000}
                    onClose={'onClose' in props ? props.onClose : () => {}}
                >
                    <Alert onClose={'onClose' in props ? props.onClose : () => {}} severity={'severity' in props ? props.severity : ''} sx={'sx' in props ? props.sx : {}}>
                        {props.children}
                    </Alert>
                </Snackbar>,
                document.getElementById('root-overlays')
            )}
        </>
    );
};

export default SnackOverlay;
