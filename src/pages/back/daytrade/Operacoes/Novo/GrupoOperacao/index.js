import React, { useState } from 'react';

import styles from './grupo-operacao.module.scss';
import Operacao from '../Operacao';

const GrupoOperacao = (props) => {
    /*********
     * STATES
     *********/
    const [operacoes, setOperacoes] = useState(props.linhaGrupoOperacoes);

    return (
        <>
            {operacoes.map((o, i) => (
                <Operacao key={`linhaOp_${i}`} />
            ))}
        </>
    );
};

export default GrupoOperacao;
