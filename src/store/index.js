import { configureStore } from '@reduxjs/toolkit';

import apiMessagesReducer from './api-messages/api-messages-slice';
import authReducer from './auth/auth-slice';

const store = configureStore({
    reducer: {
        auth: authReducer,
        apiMessages: apiMessagesReducer,
    },
});

export default store;
