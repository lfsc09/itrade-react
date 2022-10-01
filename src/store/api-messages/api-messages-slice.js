import { createSlice } from '@reduxjs/toolkit';

import { generateHash } from '../../helpers/global';

/**
 * Uma mensagem consiste de:
 *  - key: Chave unica aleatória desta mensagem (Fins do DOM)
 *  - title: Titulo da mensagem (Opcional)
 *  - message: Mensagem da mensagem
 *  - severity: Tipo da mensagem (Se é de Erro/Sucesso/Aviso)
 */
const initialState = {
    messages: [],
};

const apiMessagesSlice = createSlice({
    name: 'apiMessages',
    initialState: initialState,
    reducers: {
        add: (state, { payload }) => {
            (!Array.isArray(payload) ? [payload] : payload).map((m) =>
                state.messages.push({
                    key: generateHash(8),
                    title: m?.title ?? null,
                    message: m.message,
                    severity: m.severity,
                })
            );
        },
        remove: (state, { payload }) => {
            state.messages = state.messages.filter((item) => item.key !== payload);
        },
        removeAll: (state) => {
            state.messages = [];
        },
    },
});

export const { add, remove, removeAll } = apiMessagesSlice.actions;

export default apiMessagesSlice.reducer;
