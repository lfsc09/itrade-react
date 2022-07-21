import { configureStore } from '@reduxjs/toolkit';
import authReducer from './auth/auth-slice';
import snackMessagesReducer from './snack-messages/snack-messages-slice';

const store = configureStore({
    reducer: {
        auth: authReducer,
        snackMessages: snackMessagesReducer,
    },
});

export default store;
