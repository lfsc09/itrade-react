import { Check } from '@mui/icons-material';
import { Alert, AlertTitle, Button } from '@mui/material';
import React from 'react';
import { createPortal } from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';

import { remove, removeAll } from '../../../store/api-messages/api-messages-slice';
import styles from './message-controller.module.scss';

/*
    Controller de Mensagens.
    
    Busca mensagens direto no Redux de mensagens.
    Se for em overlay e houver mais de 1 mensagem, é criado um container com um botão para apagar todos de uma vez.

    @props : [
        ...
        overlay(true|false) : Se deve mostrar as mensagens em overlay ou se irá cria-las em algum local especifico da pagina
    ]
 */
const MessageController = (props) => {
    /**********
     * DISPATCH
     **********/
    const dispatch = useDispatch();

    /*********
     * STATES
     *********/
    const { messages } = useSelector((store) => store.apiMessages);

    if (messages.length === 0) return <></>;

    /*******
     * VARS
     *******/
    let alerts = messages.map((message) => (
        <Alert
            key={message.key}
            onClose={() => dispatch(remove(message.key))}
            severity={message.severity}
            sx={{ mt: 1 }}
            iconMapping={{
                success: <Check fontSize='inherit' />,
            }}
        >
            {message.title !== null ? <AlertTitle>{message.title}</AlertTitle> : <></>}
            {message.message}
        </Alert>
    ));

    return props?.overlay ?? true
        ? createPortal(
              <div className={styles.container}>
                  {messages.length > 1 ? (
                      <div className={styles.container__apaga_tudo}>
                          <Button className={styles.apaga_tudo} size='small' color='warning' onClick={() => dispatch(removeAll())}>
                              Apagar Todos
                          </Button>
                      </div>
                  ) : (
                      <></>
                  )}
                  {alerts}
              </div>,
              document.getElementById('root-overlays')
          )
        : alerts;
};

export default MessageController;
