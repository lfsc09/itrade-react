import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import React from 'react';

import styles from './confirm-dialog.module.scss';

const ConfirmDialog = (props) => {
    return (
        <Dialog maxWidth='xs' open={props.open}>
            {props?.title !== '' ? <DialogTitle>{props.title}</DialogTitle> : <></>}
            {props?.content !== undefined ? (
                <DialogContent dividers>
                    <div className={styles.dialog_content}>{props.content}</div>
                </DialogContent>
            ) : (
                <></>
            )}
            <DialogActions>
                <Button onClick={props.handleNo}>Não</Button>
                <Button onClick={props.handleYes}>Sim</Button>
            </DialogActions>
        </Dialog>
    );
};

export default ConfirmDialog;
