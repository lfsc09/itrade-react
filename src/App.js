import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import MainRoutes from './routes/routes';
import { useDispatch } from 'react-redux';
import { readTokenFromLocal } from './store/auth/auth-action';

function App() {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(readTokenFromLocal());
    }, [dispatch]);

    return (
        <BrowserRouter>
            <MainRoutes />
        </BrowserRouter>
    );
}

export default App;
